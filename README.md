# Group Order for Pokemon Cards

**Live demo: https://group-order-theta.vercel.app**

A DoorDash-style group ordering experience built with Next.js. A host starts an order,
invites up to two friends by email, everyone browses a catalog of real Pokemon cards and
builds their own cart in real time, and the host closes the order and checks out. The
host sees the order broken down per person.

Live catalog and prices come from the public [Pokemon TCG API](https://pokemontcg.io/).
Persistence, realtime, and auth run on Firebase. It deploys to Vercel and stays inside
the free tiers of every service it touches.

## Quick start

The app boots with **no secrets**. The catalog loads from the public API, invites report
their delivery status inline (email sends only once SMTP is configured), structured logs
go to the console, and any page that needs Firebase shows a short setup notice instead of
a stack trace.

```bash
npm install
npm run dev
```

Open http://localhost:3000. To exercise the full flow (host sign-in, orders, realtime),
configure Firebase (see [Environment](#environment)).

### Run the tests

```bash
npm test                   # unit tests (pure logic: money, totals, rules, tokens)
npm run test:integration   # transactional flow against the Firestore emulator
npm run e2e                # full group-order flow in a browser (Playwright)
```

`test:integration` and `e2e` start the Firestore emulator automatically and need Java
21+ and the Firebase CLI (`npm install -g firebase-tools`).

## Architecture

The application depends on capabilities **by use case, never by vendor**. Four seams are
defined as interfaces under `src/lib/<seam>/`, each with a factory that selects a concrete
provider by configuration:

| Seam | Interface | Current provider | Fallback |
| --- | --- | --- | --- |
| `auth` | `src/lib/auth/types.ts` | Firebase Auth (Google) | test provider (E2E) |
| `db` | `src/lib/db/types.ts` | Firestore (Admin SDK) | none (setup notice) |
| `catalog` | `src/lib/catalog/types.ts` | Pokemon TCG API | none (error state) |
| `email` | `src/lib/email/types.ts` | SMTP (Nodemailer) | delivery status toast |
| `observability` | `src/lib/observability/types.ts` | Google Cloud Logging | console |

App code, Server Actions, and components import the interface (`getDb()`, `getEmail()`),
so swapping or adding a provider is an implementation and configuration change, not an
app-code change.

### Server-first, with a thin realtime layer

Pages are React Server Components that read through the `db` seam on the server. There is
no client database SDK and the browser holds no database credentials. Live updates reach
every participant over **server-sent events**: `GET /orders/[orderId]/stream` subscribes
to the order on the server and pushes snapshots to connected clients.

```
Browser
 - Server Components (RSC)   render        db.read (server)
                             catalog       getFeatured (cached)
 - EventSource               SSE           /orders/[id]/stream  ->  db.subscribe
 - Mutations                 Server Action db.write (authorization enforced here)
                                           email.send (invites)
```

Because realtime is server-mediated, guests need no identity to receive live updates, and
Firestore security rules stay **deny-all to clients** (`firestore.rules`). All access is
server-mediated and authorized in code.

### Authorization

- **Host** identity is a Firebase UID carried in an HTTP-only session cookie, verified
  server-side with `verifySessionCookie` on every mutation.
- **Guests** carry an opaque, unguessable invite token, hashed at rest; joining sets an
  HTTP-only cookie scoping them to exactly one participant slot.
- Every Server Action re-derives the caller's role server-side. Checkout, invite, and the
  timer assert `caller.uid === order.hostUid`; a guest calling them is rejected regardless
  of UI state.
- The three-participant cap and the timer close are enforced inside **Firestore
  transactions**, so concurrent joins cannot exceed the cap and a race cannot add items
  after the order closes. These paths are covered by the integration tests.

### Data integrity

- Money is handled in **integer cents** throughout (`src/lib/money.ts`).
- Card prices are **snapshotted into the cart line at add time** from the server-side
  catalog. The client never sends a price, so the total is stable and tamper-proof even
  if the upstream price moves or the API is unavailable.

## Decisions and tradeoffs

**Firebase on the free Spark tier for `db` + `auth`.** Firestore gives a relational-enough
document model, transactions for the concurrency-sensitive paths, and a generous free tier
(50k reads / 20k writes per day). Google sign-in was chosen over Firebase's email magic
links because the magic-link path is throttled to five emails per day on the free tier,
which is unusable for a host who signs in repeatedly.

**Server-sent events instead of the client Firestore SDK.** The obvious way to get live
carts is `onSnapshot` in the browser, but that requires client read access to Firestore,
which means either wide-open rules or giving unauthenticated guests a Firebase identity.
SSE keeps all database access on the server, so rules stay deny-all and guests stay
anonymous. Realtime becomes a `db` seam capability rather than a vendor feature leaked into
the client.

**SMTP relay for email, behind an interface.** Transactional providers (SendGrid,
Resend, Postmark) gate sending to arbitrary recipients behind domain verification and
DNS setup. Relaying through an SMTP mailbox you already own (Gmail with an App Password)
sends *as* that mailbox, so it delivers to any recipient with no custom domain. It sits
behind the `email` seam via a Nodemailer transport. When no SMTP provider is configured
the seam degrades to a no-op that logs the invite, and the host sees the delivery outcome
reported inline, so the app still runs without an email provider configured. The transport
is provider-agnostic: any SMTP host works by changing env vars.

**Prices snapshotted at add time.** Trusting a live third-party price at checkout would let
the total drift or fail when the API is down, and trusting a client-sent price would be a
tampering vector. Snapshotting the server-derived price onto the line item makes the order
deterministic.

**Cap = 3 total, including the host.** The brief says "capped at 3 participants per group";
the most literal reading is three people in the group, so a host plus two guests.

**One exported function per file.** Files stay small and single-purpose; utility modules
(`money.ts`, `config.ts`) group closely-related helpers.

## Observability

Performance, traffic, and errors are wired to the **Google Cloud free tier** (the same
project as Firebase), and are viewable in the Cloud console:

- **Cloud Logging** (50 GB/month free): structured request logs, domain events (order
  created, joined, item added, checkout), and errors.
- **Cloud Error Reporting**: automatically groups anything logged at error severity.
- **Cloud Trace** (2.5M spans/month free): latency.

The `observability` seam picks its transport by configuration: `providers/gcp.ts`
(`@google-cloud/logging`, using `LogSync` so entries are not dropped on serverless) when
GCP credentials are present, and `providers/console.ts` otherwise, so it runs locally with
no secrets. Web Vitals are reported from the client to `/api/vitals` and logged through the
same seam.

## Environment

Copy `.env.example` to `.env.local` and fill in the blocks you want to activate. Every
block is optional; the app degrades gracefully when one is absent.

| Variable | Seam | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_FIREBASE_*` | auth/db | Public client config (safe to expose) |
| `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` | auth/db | Admin service account. The private key contains newlines; paste them escaped as `\n` and they are un-escaped at load |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASS` / `EMAIL_FROM` | email | SMTP relay for real invite emails. For Gmail, `EMAIL_PASS` is an App Password; delivers to any recipient, no domain needed |
| `GCP_*` | observability | Reuses the Firebase service account by default |
| `APP_BASE_URL` | app | Base URL for invite links; defaults to the request origin |

## Deploying to Vercel

1. Import the repository into Vercel. It is detected as a Next.js app; no build config is
   needed. `next.config.ts` allow-lists the card image host and enables typed routes.
2. Add the environment variables above in the Vercel project settings. For
   `FIREBASE_PRIVATE_KEY`, paste the key with `\n` in place of newlines.
3. Deploy. The SSE route and Server Actions run on the Node.js runtime.

## Testing strategy

- **Unit** (`tests/unit`): the pure cores. Money and tax math, per-person totals, the cap
  and timer-close predicates, and invite-token hashing.
- **Integration** (`tests/integration`): the transactional `db` provider against the
  Firestore emulator, proving the cap, dedupe, non-host rejection, join, timer close, and
  host-only checkout behave correctly under real Firestore semantics.
- **End-to-end** (`e2e`): a browser drives the full multiplayer flow (host creates and
  invites, a separate browser context joins as a guest and adds a card, the host sees it
  live, then checks out) plus a negative test that a guest cannot reach the host checkout.
  E2E runs against a production build so hydration matches production.

CI (`.github/workflows/ci.yml`) runs typecheck, lint, and unit tests on every push and
pull request, with integration and E2E in parallel jobs.

## What I would do next

- **Payments**: the checkout is a summary today; wire Stripe behind a `payments` seam.
- **Catalog search and filters**: browse beyond the curated featured set.
- **Reopen after close**: let a host reopen a closed order, not only extend the timer.
- **Presence**: show who is currently viewing and editing.
- **Alternate providers**: the seams make Supabase (`db`), Auth0 (`auth`), or SES (`email`)
  drop-in swaps; add one to demonstrate the abstraction.

## Out of scope

Real payment processing, delivery logistics, guest passwords, and full card search are
intentionally omitted to keep the focus on the group-order mechanics, realtime
collaboration, the host timer, and the authorization model.

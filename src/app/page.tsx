import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { isFirebaseConfigured } from "@/lib/config";
import { SetupNotice } from "@/components/setup-notice";
import { StartOrderButton } from "@/components/start-order-button";

export default async function HomePage() {
  const configured = isFirebaseConfigured();
  const user = configured ? await getCurrentUser() : null;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-8 px-6 py-16">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">
          Group order
        </p>
        <h1 className="text-4xl font-bold tracking-tight">
          Build a Pokemon card order together
        </h1>
        <p className="text-lg text-muted">
          Start an order, invite up to two friends by email, and everyone adds cards to
          their own cart. As the host you set the timer and check out.
        </p>
      </header>

      {!configured ? (
        <SetupNotice />
      ) : user ? (
        <div className="space-y-3">
          <p className="text-sm text-muted">Signed in as {user.email}</p>
          <StartOrderButton />
        </div>
      ) : (
        <Link
          href="/login"
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-brand px-5 py-3 font-semibold text-brand-contrast transition hover:bg-brand-strong"
        >
          Sign in to start an order
        </Link>
      )}

      <ol className="grid gap-4 border-t border-border pt-8 text-sm text-muted sm:grid-cols-3">
        <li>
          <span className="font-semibold text-foreground">1. Invite</span>
          <p>Add up to two friends by email. They join with a link, no account needed.</p>
        </li>
        <li>
          <span className="font-semibold text-foreground">2. Add cards</span>
          <p>Everyone browses the catalog and fills their own cart in real time.</p>
        </li>
        <li>
          <span className="font-semibold text-foreground">3. Check out</span>
          <p>The host reviews each person&apos;s cart and checks out the group order.</p>
        </li>
      </ol>
    </main>
  );
}

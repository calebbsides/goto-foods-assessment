import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LiveOrder } from "@/app/orders/[orderId]/live-order";
import { getCallerParticipant } from "@/lib/auth/get-caller-participant";
import { getCatalog } from "@/lib/catalog";
import type { CatalogCard } from "@/lib/catalog/types";
import { isFirebaseConfigured } from "@/lib/config";
import { getOrderSnapshot } from "@/lib/orders/get-order-snapshot";
import { ErrorState } from "@/components/error-state";
import { SetupNotice } from "@/components/setup-notice";

export const metadata: Metadata = { title: "Group order" };

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  if (!isFirebaseConfigured()) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 px-6 py-16">
        <SetupNotice />
      </main>
    );
  }

  const snapshot = await getOrderSnapshot(orderId);
  if (!snapshot) {
    notFound();
  }

  const caller = await getCallerParticipant(orderId);
  const role = caller?.role ?? "visitor";

  let cards: CatalogCard[] = [];
  let catalogFailed = false;
  try {
    cards = await getCatalog().getFeatured();
  } catch {
    catalogFailed = true;
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">
          {snapshot.order.hostName}&apos;s group order
        </h1>
        <p className="text-sm text-muted">
          {role === "host"
            ? "You are the host. Invite people, set a timer, and check out when ready."
            : role === "guest"
              ? "Add cards to your cart. The host checks out for the group."
              : "You are viewing this order. Use your invite link to join and add cards."}
        </p>
      </header>

      {catalogFailed ? (
        <ErrorState
          title="Catalog is unavailable"
          message="We could not load the card catalog from the Pokemon TCG API. Refresh to try again."
        />
      ) : (
        <LiveOrder
          initial={snapshot}
          cards={cards}
          role={role}
          callerParticipantId={caller?.participantId ?? null}
        />
      )}
    </main>
  );
}

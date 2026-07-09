import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { isFirebaseConfigured } from "@/lib/config";
import { getOrderSnapshot } from "@/lib/orders/get-order-snapshot";
import { computeTotals } from "@/lib/totals";
import { ParticipantBreakdown } from "@/components/participant-breakdown";
import { SetupNotice } from "@/components/setup-notice";

export const metadata: Metadata = { title: "Order summary" };

export default async function CheckoutPage({
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

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const snapshot = await getOrderSnapshot(orderId);
  if (!snapshot) {
    notFound();
  }
  if (snapshot.order.hostUid !== user.uid) {
    redirect(`/orders/${orderId}`);
  }

  const totals = computeTotals(snapshot);

  return (
    <main className="mx-auto w-full max-w-xl flex-1 space-y-6 px-6 py-10">
      <header className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-wide text-success">
          {snapshot.order.status === "checked_out" ? "Order placed" : "Order summary"}
        </p>
        <h1 className="text-2xl font-bold">Group order breakdown</h1>
        <p className="text-sm text-muted">
          Each person&apos;s cart, rolled up into the group total.
        </p>
      </header>

      <ParticipantBreakdown totals={totals} />

      <Link
        href={`/orders/${orderId}`}
        className="inline-block text-sm font-medium text-accent hover:underline"
      >
        Back to the order
      </Link>
    </main>
  );
}

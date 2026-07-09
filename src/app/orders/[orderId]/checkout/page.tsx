import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CircleCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { isFirebaseConfigured } from "@/lib/config";
import { getOrderSnapshot } from "@/lib/orders/get-order-snapshot";
import { computeTotals } from "@/lib/totals";
import { ParticipantBreakdown } from "@/components/participant-breakdown";
import { SetupNotice } from "@/components/setup-notice";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Order summary" };

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  if (!isFirebaseConfigured()) {
    return (
      <>
        <SiteHeader />
        <main className="container-page flex-1 py-16">
          <div className="mx-auto max-w-md">
            <SetupNotice />
          </div>
        </main>
      </>
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  const snapshot = await getOrderSnapshot(orderId);
  if (!snapshot) {
    notFound();
  }
  if (snapshot.order.hostUid !== user.uid) {
    redirect(`/orders/${orderId}`);
  }

  const totals = computeTotals(snapshot);
  const placed = snapshot.order.status === "checked_out";

  return (
    <>
      <SiteHeader user={user} />
      <main className="container-page flex-1 py-10">
        <div className="mx-auto max-w-xl space-y-6">
          <header className="space-y-2">
            {placed ? (
              <Badge variant="success">
                <CircleCheck className="size-3.5" /> Order placed
              </Badge>
            ) : (
              <Badge variant="secondary">Order summary</Badge>
            )}
            <h1 className="text-2xl font-bold tracking-tight">Group order breakdown</h1>
            <p className="text-sm text-muted-foreground">
              Each person&apos;s cart, rolled up into the group total.
            </p>
          </header>

          <ParticipantBreakdown totals={totals} />

          <Button asChild variant="ghost" size="sm">
            <Link href={`/orders/${orderId}`}>
              <ArrowLeft />
              Back to the order
            </Link>
          </Button>
        </div>
      </main>
    </>
  );
}

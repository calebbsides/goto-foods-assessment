import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { isFirebaseConfigured } from "@/lib/config";
import { getOrderSnapshot } from "@/lib/orders/get-order-snapshot";
import { hashInviteToken } from "@/lib/token";
import { ErrorState } from "@/components/error-state";
import { JoinForm } from "@/components/join-form";
import { SetupNotice } from "@/components/setup-notice";

export const metadata: Metadata = { title: "Join a group order" };

export default async function JoinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!isFirebaseConfigured()) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 px-6 py-16">
        <SetupNotice />
      </main>
    );
  }

  const orderId = await getDb().findOrderIdByTokenHash(hashInviteToken(token));
  if (!orderId) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 px-6 py-16">
        <ErrorState
          title="Invite not found"
          message="This invite link is not valid. Ask the host to send a new one."
        />
      </main>
    );
  }

  const snapshot = await getOrderSnapshot(orderId);
  if (!snapshot) {
    redirect("/");
  }

  if (snapshot.order.status !== "open") {
    return (
      <main className="mx-auto w-full max-w-md flex-1 px-6 py-16">
        <ErrorState
          title="Order closed"
          message="This group order is closed, so you cannot join it anymore."
        />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-16">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">
          Join {snapshot.order.hostName}&apos;s group order
        </h1>
        <p className="text-sm text-muted">
          Add your name to start building your cart. No account needed.
        </p>
      </header>
      <JoinForm token={token} />
    </main>
  );
}

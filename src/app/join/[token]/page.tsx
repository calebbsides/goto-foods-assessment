import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { isFirebaseConfigured } from "@/lib/config";
import { getOrderSnapshot } from "@/lib/orders/get-order-snapshot";
import { hashInviteToken } from "@/lib/token";
import { ErrorState } from "@/components/error-state";
import { JoinForm } from "@/components/join-form";
import { SetupNotice } from "@/components/setup-notice";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Join a group order" };

export default async function JoinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const shell = (content: React.ReactNode) => (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-5 py-16">
        <div className="w-full max-w-md">{content}</div>
      </main>
    </>
  );

  if (!isFirebaseConfigured()) {
    return shell(<SetupNotice />);
  }

  const orderId = await getDb().findOrderIdByTokenHash(hashInviteToken(token));
  if (!orderId) {
    return shell(
      <ErrorState
        title="Invite not found"
        message="This invite link is not valid. Ask the host to send a new one."
      />,
    );
  }

  const snapshot = await getOrderSnapshot(orderId);
  if (!snapshot) {
    redirect("/");
  }

  if (snapshot.order.status !== "open") {
    return shell(
      <ErrorState
        title="Order closed"
        message="This group order is closed, so you cannot join it anymore."
      />,
    );
  }

  return shell(
    <Card>
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl">
          Join {snapshot.order.hostName}&apos;s group order
        </CardTitle>
        <CardDescription>
          Add your name to start building your cart. No account needed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <JoinForm token={token} />
      </CardContent>
    </Card>,
  );
}

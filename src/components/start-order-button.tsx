"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { createOrder } from "@/actions/create-order";
import { useSignIn } from "@/lib/firebase/use-sign-in";
import { Button } from "@/components/ui/button";

export function StartOrderButton({
  signedIn,
  existingOrderId,
}: {
  signedIn: boolean;
  existingOrderId: string | null;
}) {
  const { signIn, pending: signingIn, error } = useSignIn();
  const [starting, setStarting] = useState(false);
  const pending = signingIn || starting;

  if (existingOrderId) {
    return (
      <Button asChild size="lg">
        <Link href={`/orders/${existingOrderId}`}>
          Resume your order
          <ArrowRight />
        </Link>
      </Button>
    );
  }

  async function start() {
    if (!signedIn) {
      const ok = await signIn();
      if (!ok) return;
    }
    setStarting(true);
    await createOrder();
  }

  return (
    <div className="space-y-2">
      <Button onClick={start} disabled={pending} size="lg">
        {pending ? "Starting..." : "Start a group order"}
        {pending ? null : <ArrowRight />}
      </Button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

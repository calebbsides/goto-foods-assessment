"use client";

import { useState } from "react";
import { ReceiptText } from "lucide-react";
import { checkout } from "@/actions/checkout";
import type { OrderTotals } from "@/lib/domain";
import { formatCents } from "@/lib/money";
import { ParticipantBreakdown } from "@/components/participant-breakdown";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CheckoutButton({ orderId, totals }: { orderId: string; totals: OrderTotals }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await checkout(formData);
    if (result && !result.ok) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">
          <ReceiptText />
          Review and check out
          <span className="ml-auto tabular-nums">{formatCents(totals.grandTotalCents)}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order summary</DialogTitle>
          <DialogDescription>
            Each person&apos;s cart, rolled up into the group total.
          </DialogDescription>
        </DialogHeader>

        <ParticipantBreakdown totals={totals} />

        <form action={submit} className="space-y-2">
          <input type="hidden" name="orderId" value={orderId} />
          <Button type="submit" disabled={pending} size="lg" className="w-full">
            {pending ? "Checking out..." : "Place group order"}
          </Button>
          {error ? (
            <p className="text-center text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}

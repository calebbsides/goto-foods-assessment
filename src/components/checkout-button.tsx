"use client";

import { useState } from "react";
import { checkout } from "@/actions/checkout";

export function CheckoutButton({ orderId }: { orderId: string }) {
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
    <form action={submit} className="space-y-2">
      <input type="hidden" name="orderId" value={orderId} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand px-5 py-3 font-semibold text-brand-contrast transition hover:bg-brand-strong disabled:opacity-60"
      >
        {pending ? "Checking out..." : "Review and check out"}
      </button>
      {error ? <p className="text-sm text-brand">{error}</p> : null}
    </form>
  );
}

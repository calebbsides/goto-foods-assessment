"use client";

import { useState } from "react";
import { setTimer } from "@/actions/set-timer";

const PRESETS = [1, 5, 10];

export function TimerControls({ orderId, active }: { orderId: string; active: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function apply(minutes: number | null) {
    setPending(true);
    setError(null);
    const formData = new FormData();
    formData.set("orderId", orderId);
    if (minutes !== null) {
      formData.set("minutes", String(minutes));
    }
    const result = await setTimer(formData);
    if (!result.ok) {
      setError(result.error);
    }
    setPending(false);
  }

  return (
    <section aria-label="Order timer" className="space-y-2 rounded-xl border border-border bg-surface p-4">
      <h2 className="font-semibold">Close the order on a timer</h2>
      <p className="text-sm text-muted">
        When the timer runs out, everyone&apos;s cart locks and you move to checkout.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((minutes) => (
          <button
            key={minutes}
            onClick={() => apply(minutes)}
            disabled={pending}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-surface-muted disabled:opacity-60"
          >
            {minutes} min
          </button>
        ))}
        {active ? (
          <button
            onClick={() => apply(null)}
            disabled={pending}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-brand hover:underline disabled:opacity-60"
          >
            Clear timer
          </button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-brand">{error}</p> : null}
    </section>
  );
}

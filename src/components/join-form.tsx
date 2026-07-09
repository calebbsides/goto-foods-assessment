"use client";

import { useState } from "react";
import { join } from "@/actions/join";

export function JoinForm({ token }: { token: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await join(formData);
    if (result && !result.ok) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <form action={submit} className="space-y-3">
      <input type="hidden" name="token" value={token} />
      <label className="block text-sm font-medium" htmlFor="join-name">
        Your name
      </label>
      <input
        id="join-name"
        name="name"
        type="text"
        required
        maxLength={60}
        placeholder="Ash Ketchum"
        className="w-full rounded-lg border border-border bg-surface px-3 py-2"
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand px-5 py-3 font-semibold text-brand-contrast transition hover:bg-brand-strong disabled:opacity-60"
      >
        {pending ? "Joining..." : "Join the order"}
      </button>
      {error ? <p className="text-sm text-brand">{error}</p> : null}
    </form>
  );
}

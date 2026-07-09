"use client";

import { useState } from "react";
import { invite, type InviteData } from "@/actions/invite";

export function InvitePanel({ orderId, canInvite }: { orderId: string; canInvite: boolean }) {
  const [result, setResult] = useState<InviteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setPending(true);
    setError(null);
    setResult(null);
    const response = await invite(formData);
    if (response.ok) {
      setResult(response.data);
    } else {
      setError(response.error);
    }
    setPending(false);
  }

  return (
    <section aria-label="Invite people" className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <h2 className="font-semibold">Invite people</h2>
      {canInvite ? (
        <form action={submit} className="flex gap-2">
          <input type="hidden" name="orderId" value={orderId} />
          <label className="sr-only" htmlFor="invite-email">
            Email address
          </label>
          <input
            id="invite-email"
            name="email"
            type="email"
            required
            placeholder="friend@example.com"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-contrast transition hover:bg-brand-strong disabled:opacity-60"
          >
            {pending ? "Sending..." : "Invite"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-muted">The group is full.</p>
      )}

      {error ? <p className="text-sm text-brand">{error}</p> : null}

      {result ? (
        <div className="space-y-2 rounded-lg bg-surface-muted p-3 text-sm">
          {result.alreadyInvited ? (
            <p className="text-muted">{result.email} was already invited. Share this link:</p>
          ) : result.delivered ? (
            <p className="text-success">Invite sent to {result.email}. Shareable link:</p>
          ) : (
            <p className="text-warning">
              Email is not configured, so share this link with {result.email}:
            </p>
          )}
          <CopyableLink url={result.joinUrl} />
        </div>
      ) : null}
    </section>
  );
}

function CopyableLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 truncate rounded bg-background px-2 py-1 text-xs">{url}</code>
      <button
        onClick={copy}
        className="rounded-lg border border-border px-3 py-1 text-xs font-medium hover:bg-background"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

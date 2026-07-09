"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { getClientAuth, googleProvider } from "@/lib/firebase/client";

export function GoogleSignIn() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setPending(true);
    setError(null);
    try {
      const credential = await signInWithPopup(getClientAuth(), googleProvider());
      const idToken = await credential.user.getIdToken();
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!response.ok) {
        throw new Error("Session could not be created.");
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Sign in failed. Please try again.");
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={signIn}
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 font-medium transition hover:bg-surface-muted disabled:opacity-60"
      >
        {pending ? "Signing in..." : "Continue with Google"}
      </button>
      {error ? <p className="text-sm text-brand">{error}</p> : null}
    </div>
  );
}

"use client";

import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { getClientAuth, googleProvider } from "@/lib/firebase/client";

interface UseSignIn {
  signIn: () => Promise<boolean>;
  pending: boolean;
  error: string | null;
}

export function useSignIn(): UseSignIn {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn(): Promise<boolean> {
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
      return true;
    } catch {
      setError("Sign in failed. Please try again.");
      setPending(false);
      return false;
    }
  }

  return { signIn, pending, error };
}

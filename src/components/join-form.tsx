"use client";

import { useState } from "react";
import { join } from "@/actions/join";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <form action={submit} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div className="space-y-2">
        <Label htmlFor="join-name">Your name</Label>
        <Input
          id="join-name"
          name="name"
          type="text"
          required
          maxLength={60}
          placeholder="Ash Ketchum"
        />
      </div>
      <Button type="submit" disabled={pending} size="lg" className="w-full">
        {pending ? "Joining..." : "Join the order"}
      </Button>
      {error ? (
        <p className="text-center text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}

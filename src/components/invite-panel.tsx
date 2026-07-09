"use client";

import { useRef, useState } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { invite } from "@/actions/invite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InvitePanel({ orderId, canInvite }: { orderId: string; canInvite: boolean }) {
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function submit(formData: FormData) {
    setPending(true);
    const response = await invite(formData);
    setPending(false);

    if (!response.ok) {
      toast.error(response.error);
      return;
    }

    const { email, delivered, alreadyJoined } = response.data;
    if (alreadyJoined) {
      toast.info(`${email} has already joined this order.`);
      formRef.current?.reset();
    } else if (delivered) {
      toast.success(`Invite sent to ${email}.`);
      formRef.current?.reset();
    } else {
      toast.error(`Could not send the invite to ${email}. Please try again.`);
    }
  }

  return (
    <section aria-label="Invite people" className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <UserPlus className="size-4 text-muted-foreground" />
        <h2 className="font-semibold">Invite people</h2>
      </div>

      {canInvite ? (
        <form ref={formRef} action={submit} className="flex gap-2">
          <input type="hidden" name="orderId" value={orderId} />
          <Label className="sr-only" htmlFor="invite-email">
            Email address
          </Label>
          <Input
            id="invite-email"
            name="email"
            type="email"
            required
            placeholder="friend@example.com"
            className="flex-1"
          />
          <Button type="submit" disabled={pending}>
            {pending ? "Sending" : "Invite"}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">The group is full.</p>
      )}
    </section>
  );
}

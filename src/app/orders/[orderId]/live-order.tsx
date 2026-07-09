"use client";

import { useMemo, useState } from "react";
import { addItem } from "@/actions/add-item";
import { removeItem } from "@/actions/remove-item";
import { CardGrid } from "@/components/card-grid";
import { CheckoutButton } from "@/components/checkout-button";
import { CountdownTimer } from "@/components/countdown-timer";
import { InvitePanel } from "@/components/invite-panel";
import { ParticipantBreakdown } from "@/components/participant-breakdown";
import { TimerControls } from "@/components/timer-controls";
import type { CatalogCard } from "@/lib/catalog/types";
import { MAX_PARTICIPANTS, type OrderSnapshot } from "@/lib/domain";
import { computeTotals } from "@/lib/totals";
import { useNow } from "@/lib/use-now";
import { useOrderStream } from "@/lib/use-order-stream";

interface LiveOrderProps {
  initial: OrderSnapshot;
  cards: CatalogCard[];
  role: "host" | "guest" | "visitor";
  callerParticipantId: string | null;
}

export function LiveOrder({ initial, cards, role, callerParticipantId }: LiveOrderProps) {
  const snapshot = useOrderStream(initial.order.id, initial);
  const totals = useMemo(() => computeTotals(snapshot), [snapshot]);
  const [actionError, setActionError] = useState<string | null>(null);
  const now = useNow(1000);

  const closed =
    snapshot.order.status !== "open" ||
    (snapshot.order.closesAt !== null && now > 0 && now >= snapshot.order.closesAt);

  const canAdd = role !== "visitor" && !closed;
  const joinedCount = snapshot.participants.filter((p) => p.joinedAt !== null).length;
  const totalSlots = snapshot.participants.length;

  async function onAdd(card: CatalogCard) {
    setActionError(null);
    const formData = new FormData();
    formData.set("orderId", snapshot.order.id);
    formData.set("cardId", card.id);
    formData.set("quantity", "1");
    const result = await addItem(formData);
    if (!result.ok) setActionError(result.error);
  }

  async function onRemove(lineId: string) {
    setActionError(null);
    const formData = new FormData();
    formData.set("orderId", snapshot.order.id);
    formData.set("lineId", lineId);
    const result = await removeItem(formData);
    if (!result.ok) setActionError(result.error);
  }

  const disabledReason = closed
    ? "Ordering is closed"
    : role === "visitor"
      ? "Join to add cards"
      : undefined;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-4">
        {actionError ? (
          <p className="rounded-lg bg-brand/10 px-3 py-2 text-sm text-brand">{actionError}</p>
        ) : null}
        <CardGrid cards={cards} disabled={!canAdd} disabledReason={disabledReason} onAdd={onAdd} />
      </div>

      <aside className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Group order</h2>
            <p className="text-sm text-muted">
              {joinedCount} joined · {totalSlots}/{MAX_PARTICIPANTS} slots
            </p>
          </div>
          {snapshot.order.closesAt !== null && snapshot.order.status === "open" ? (
            <CountdownTimer closesAt={snapshot.order.closesAt} />
          ) : null}
        </div>

        {closed ? (
          <p className="rounded-lg bg-surface-muted px-3 py-2 text-sm text-muted">
            Ordering is closed. Carts are locked.
          </p>
        ) : null}

        {role === "host" ? (
          <>
            <InvitePanel
              orderId={snapshot.order.id}
              canInvite={totalSlots < MAX_PARTICIPANTS && !closed}
            />
            {!closed ? (
              <TimerControls
                orderId={snapshot.order.id}
                active={snapshot.order.closesAt !== null}
              />
            ) : null}
          </>
        ) : null}

        <ParticipantBreakdown
          totals={totals}
          removable={
            callerParticipantId && !closed
              ? {
                  orderId: snapshot.order.id,
                  canRemove: (participantId) => participantId === callerParticipantId,
                  onRemove,
                }
              : undefined
          }
        />

        {role === "host" ? <CheckoutButton orderId={snapshot.order.id} /> : null}
      </aside>
    </div>
  );
}

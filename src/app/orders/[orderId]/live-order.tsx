"use client";

import { Suspense, use, useMemo, useState } from "react";
import { CircleAlert, Lock, Users } from "lucide-react";
import { addItem } from "@/actions/add-item";
import { removeItem } from "@/actions/remove-item";
import { CardGrid } from "@/components/card-grid";
import { CardGridSkeleton } from "@/components/card-grid-skeleton";
import { CatalogBoundary } from "@/components/catalog-boundary";
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
  cardsPromise: Promise<CatalogCard[]>;
  role: "host" | "guest" | "visitor";
  callerParticipantId: string | null;
}

export function LiveOrder({
  initial,
  cardsPromise,
  role,
  callerParticipantId,
}: LiveOrderProps) {
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
    ? "Ordering closed"
    : role === "visitor"
      ? "Join to add cards"
      : undefined;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        {actionError ? (
          <p
            className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            <CircleAlert className="size-4 shrink-0" />
            {actionError}
          </p>
        ) : null}
        <CatalogBoundary>
          <Suspense fallback={<CardGridSkeleton />}>
            <CatalogSection
              cardsPromise={cardsPromise}
              disabled={!canAdd}
              disabledReason={disabledReason}
              onAdd={onAdd}
            />
          </Suspense>
        </CatalogBoundary>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="size-4" />
            </span>
            <div>
              <h2 className="font-semibold leading-tight">Group order</h2>
              <p className="text-xs text-muted-foreground">
                {joinedCount} joined · {totalSlots}/{MAX_PARTICIPANTS} slots
              </p>
            </div>
          </div>
          {snapshot.order.closesAt !== null && snapshot.order.status === "open" ? (
            <CountdownTimer closesAt={snapshot.order.closesAt} />
          ) : null}
        </div>

        {closed ? (
          <p className="flex items-center gap-2 rounded-xl border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
            <Lock className="size-4 shrink-0" />
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

        {role === "host" ? (
          <CheckoutButton orderId={snapshot.order.id} totals={totals} />
        ) : null}
      </aside>
    </div>
  );
}

function CatalogSection({
  cardsPromise,
  disabled,
  disabledReason,
  onAdd,
}: {
  cardsPromise: Promise<CatalogCard[]>;
  disabled: boolean;
  disabledReason?: string;
  onAdd: (card: CatalogCard) => Promise<void>;
}) {
  const cards = use(cardsPromise);
  return (
    <CardGrid
      cards={cards}
      disabled={disabled}
      disabledReason={disabledReason}
      onAdd={onAdd}
    />
  );
}

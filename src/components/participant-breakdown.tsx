import { Trash2, UserRound } from "lucide-react";
import type { OrderTotals } from "@/lib/domain";
import { formatCents } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ParticipantBreakdownProps {
  totals: OrderTotals;
  removable?: {
    orderId: string;
    canRemove: (participantId: string) => boolean;
    onRemove: (lineId: string) => void;
  };
}

export function ParticipantBreakdown({ totals, removable }: ParticipantBreakdownProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {totals.perParticipant.map(({ participant, subtotalCents }) => (
          <div key={participant.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <UserRound className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium">
                    <span className="truncate">{participant.name || participant.email}</span>
                    {participant.role === "host" ? (
                      <Badge variant="secondary">Host</Badge>
                    ) : null}
                  </p>
                  {participant.joinedAt === null ? (
                    <p className="text-xs text-warning">Invited, not joined yet</p>
                  ) : (
                    <p className="truncate text-xs text-muted-foreground">
                      {participant.email}
                    </p>
                  )}
                </div>
              </div>
              <span className="shrink-0 font-semibold tabular-nums">
                {formatCents(subtotalCents)}
              </span>
            </div>

            {participant.items.length > 0 ? (
              <ul className="mt-3 space-y-2 border-t pt-3 text-sm">
                {participant.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-muted-foreground">
                      <span className="tabular-nums">{item.quantity}×</span> {item.name}
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="tabular-nums">
                        {formatCents(item.unitPriceCents * item.quantity)}
                      </span>
                      {removable && removable.canRemove(participant.id) ? (
                        <button
                          onClick={() => removable.onRemove(item.id)}
                          className="cursor-pointer text-muted-foreground transition-colors hover:text-destructive"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 border-t pt-3 text-sm text-muted-foreground">
                No cards yet.
              </p>
            )}
          </div>
        ))}
      </div>

      <dl className="space-y-2 rounded-xl border bg-muted/40 p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="tabular-nums">{formatCents(totals.subtotalCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Tax</dt>
          <dd className="tabular-nums">{formatCents(totals.taxCents)}</dd>
        </div>
        <Separator className="my-1" />
        <div className="flex justify-between text-base font-semibold">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatCents(totals.grandTotalCents)}</dd>
        </div>
      </dl>
    </div>
  );
}

import type { OrderTotals } from "@/lib/domain";
import { formatCents } from "@/lib/money";

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
      {totals.perParticipant.map(({ participant, subtotalCents }) => (
        <div key={participant.id} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">
                {participant.name || participant.email}
                {participant.role === "host" ? (
                  <span className="ml-2 rounded bg-surface-muted px-1.5 py-0.5 text-xs text-muted">
                    Host
                  </span>
                ) : null}
              </p>
              {participant.joinedAt === null ? (
                <p className="text-xs text-warning">Invited, not joined yet</p>
              ) : (
                <p className="text-xs text-muted">{participant.email}</p>
              )}
            </div>
            <span className="font-semibold">{formatCents(subtotalCents)}</span>
          </div>

          {participant.items.length > 0 ? (
            <ul className="mt-3 space-y-1.5 border-t border-border pt-3 text-sm">
              {participant.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2">
                  <span className="text-muted">
                    {item.quantity} × {item.name}
                  </span>
                  <span className="flex items-center gap-3">
                    {formatCents(item.unitPriceCents * item.quantity)}
                    {removable && removable.canRemove(participant.id) ? (
                      <button
                        onClick={() => removable.onRemove(item.id)}
                        className="text-xs text-brand hover:underline"
                        aria-label={`Remove ${item.name}`}
                      >
                        Remove
                      </button>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 border-t border-border pt-3 text-sm text-muted">
              No cards yet.
            </p>
          )}
        </div>
      ))}

      <dl className="space-y-1 rounded-xl bg-surface-muted p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd>{formatCents(totals.subtotalCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Tax</dt>
          <dd>{formatCents(totals.taxCents)}</dd>
        </div>
        <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
          <dt>Total</dt>
          <dd>{formatCents(totals.grandTotalCents)}</dd>
        </div>
      </dl>
    </div>
  );
}

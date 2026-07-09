import type { OrderSnapshot, OrderTotals } from "@/lib/domain";
import { grandTotalCents, lineTotalCents, sumCents, taxCents } from "@/lib/money";

export function computeTotals(snapshot: OrderSnapshot): OrderTotals {
  const perParticipant = snapshot.participants.map((participant) => ({
    participant,
    subtotalCents: sumCents(
      participant.items.map((item) => lineTotalCents(item.unitPriceCents, item.quantity)),
    ),
  }));

  const subtotalCents = sumCents(perParticipant.map((row) => row.subtotalCents));
  const taxRateBps = snapshot.order.fees.taxRateBps;

  return {
    perParticipant,
    subtotalCents,
    taxCents: taxCents(subtotalCents, taxRateBps),
    grandTotalCents: grandTotalCents(subtotalCents, taxRateBps),
  };
}

"use server";

import { getCallerParticipant } from "@/lib/auth/get-caller-participant";
import { getCatalog } from "@/lib/catalog";
import { getDb } from "@/lib/db";
import { DbError } from "@/lib/db/types";
import { addItemSchema } from "@/lib/orders/schemas";
import { getLogger } from "@/lib/observability";
import { reportEvent } from "@/lib/observability/report-event";
import { fail, ok, type ActionResult } from "@/actions/result";

export async function addItem(formData: FormData): Promise<ActionResult> {
  const parsed = addItemSchema.safeParse({
    orderId: formData.get("orderId"),
    cardId: formData.get("cardId"),
    quantity: Number(formData.get("quantity") ?? 1),
  });
  if (!parsed.success) {
    return fail("Invalid item.");
  }

  const { orderId, cardId, quantity } = parsed.data;

  const caller = await getCallerParticipant(orderId);
  if (!caller) {
    return fail("Join the order before adding cards.");
  }

  const card = await getCatalog().getCard(cardId);
  if (!card) {
    return fail("That card is not available.");
  }

  try {
    await getDb().addItem({
      orderId,
      participantId: caller.participantId,
      item: {
        cardId: card.id,
        name: card.name,
        imageSmall: card.imageSmall,
        setName: card.setName,
        rarity: card.rarity,
        unitPriceCents: card.priceCents,
        quantity,
      },
    });
    reportEvent("order.item_added", { orderId, cardId, quantity });
    return ok(undefined);
  } catch (error) {
    if (error instanceof DbError && error.code === "order_closed") {
      return fail("This order is closed.");
    }
    if (error instanceof DbError && error.code === "not_joined") {
      return fail("Join the order before adding cards.");
    }
    getLogger().error("action.add_item_failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return fail("Could not add the card. Please try again.");
  }
}

import { describe, expect, it } from "vitest";
import type { OrderSnapshot } from "@/lib/domain";
import { computeTotals } from "@/lib/totals";

function snapshot(): OrderSnapshot {
  return {
    order: {
      id: "order1",
      hostUid: "host",
      hostName: "Ash",
      hostEmail: "ash@example.com",
      status: "open",
      createdAt: 0,
      closesAt: null,
      checkedOutAt: null,
      fees: { taxRateBps: 875 },
    },
    participants: [
      {
        id: "p-host",
        role: "host",
        name: "Ash",
        email: "ash@example.com",
        joinedAt: 1,
        uid: "host",
        items: [
          {
            id: "i1",
            cardId: "base1-4",
            name: "Charizard",
            imageSmall: "",
            setName: "Base",
            rarity: "Rare Holo",
            unitPriceCents: 72831,
            quantity: 1,
          },
        ],
      },
      {
        id: "p-guest",
        role: "guest",
        name: "Misty",
        email: "misty@example.com",
        joinedAt: 2,
        uid: null,
        items: [
          {
            id: "i2",
            cardId: "base1-58",
            name: "Pikachu",
            imageSmall: "",
            setName: "Base",
            rarity: "Common",
            unitPriceCents: 665,
            quantity: 2,
          },
        ],
      },
      {
        id: "p-pending",
        role: "guest",
        name: "",
        email: "brock@example.com",
        joinedAt: null,
        uid: null,
        items: [],
      },
    ],
  };
}

describe("computeTotals", () => {
  it("breaks the order down per participant, including pending invitees", () => {
    const totals = computeTotals(snapshot());
    expect(totals.perParticipant).toHaveLength(3);
    expect(totals.perParticipant[0].subtotalCents).toBe(72831);
    expect(totals.perParticipant[1].subtotalCents).toBe(1330);
    expect(totals.perParticipant[2].subtotalCents).toBe(0);
  });

  it("rolls per-person subtotals into a taxed grand total", () => {
    const totals = computeTotals(snapshot());
    expect(totals.subtotalCents).toBe(74161);
    expect(totals.taxCents).toBe(6489);
    expect(totals.grandTotalCents).toBe(80650);
  });
});

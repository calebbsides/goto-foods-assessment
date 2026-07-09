import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { deleteApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createFirestoreDb } from "@/lib/db/providers/firestore-admin";
import { DbError } from "@/lib/db/types";
import { hashInviteToken } from "@/lib/token";
import { DEFAULT_TAX_RATE_BPS } from "@/lib/domain";

process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
process.env.FIREBASE_PROJECT_ID ??= "demo-group-order";

function initApp() {
  if (getApps().length === 0) {
    initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
  }
}

async function clearFirestore() {
  const firestore = getFirestore();
  const orders = await firestore.collection("orders").listDocuments();
  await Promise.all(orders.map((order) => firestore.recursiveDelete(order)));
}

const db = (() => {
  initApp();
  return createFirestoreDb();
})();

async function newOrder() {
  return db.createOrder({
    hostUid: "host-1",
    hostName: "Ash",
    hostEmail: "ash@example.com",
    taxRateBps: DEFAULT_TAX_RATE_BPS,
  });
}

beforeEach(async () => {
  await clearFirestore();
});

afterAll(async () => {
  await Promise.all(getApps().map((app) => deleteApp(app)));
});

describe("order flow (emulator)", () => {
  it("creates an order with the host as the first participant", async () => {
    const orderId = await newOrder();
    const snapshot = await db.getSnapshot(orderId);
    expect(snapshot?.participants).toHaveLength(1);
    expect(snapshot?.participants[0].role).toBe("host");
    expect(snapshot?.participants[0].uid).toBe("host-1");
  });

  it("enforces the three-participant cap (host + two guests)", async () => {
    const orderId = await newOrder();
    await db.invite({ orderId, hostUid: "host-1", email: "a@example.com", tokenHash: hashInviteToken("a") });
    await db.invite({ orderId, hostUid: "host-1", email: "b@example.com", tokenHash: hashInviteToken("b") });
    await expect(
      db.invite({ orderId, hostUid: "host-1", email: "c@example.com", tokenHash: hashInviteToken("c") }),
    ).rejects.toMatchObject({ code: "cap_reached" } satisfies Partial<DbError>);
  });

  it("dedupes an already-invited email instead of taking a slot", async () => {
    const orderId = await newOrder();
    const first = await db.invite({
      orderId,
      hostUid: "host-1",
      email: "dupe@example.com",
      tokenHash: hashInviteToken("t1"),
    });
    const second = await db.invite({
      orderId,
      hostUid: "host-1",
      email: "dupe@example.com",
      tokenHash: hashInviteToken("t2"),
    });
    expect(second.alreadyInvited).toBe(true);
    expect(second.participantId).toBe(first.participantId);
    const snapshot = await db.getSnapshot(orderId);
    expect(snapshot?.participants).toHaveLength(2);
  });

  it("rejects invites from a non-host", async () => {
    const orderId = await newOrder();
    await expect(
      db.invite({ orderId, hostUid: "intruder", email: "x@example.com", tokenHash: hashInviteToken("x") }),
    ).rejects.toMatchObject({ code: "forbidden" });
  });

  it("lets a guest join via token and add a card", async () => {
    const orderId = await newOrder();
    await db.invite({ orderId, hostUid: "host-1", email: "g@example.com", tokenHash: hashInviteToken("gt") });
    const joined = await db.join({ tokenHash: hashInviteToken("gt"), name: "Misty" });
    expect(joined.orderId).toBe(orderId);

    await db.addItem({
      orderId,
      participantId: joined.participantId,
      item: {
        cardId: "base1-58",
        name: "Pikachu",
        imageSmall: "",
        setName: "Base",
        rarity: "Common",
        unitPriceCents: 665,
        quantity: 2,
      },
    });

    const snapshot = await db.getSnapshot(orderId);
    const guest = snapshot?.participants.find((p) => p.id === joined.participantId);
    expect(guest?.items[0].quantity).toBe(2);
  });

  it("blocks adding cards once the timer has closed the order", async () => {
    const orderId = await newOrder();
    await db.invite({ orderId, hostUid: "host-1", email: "g@example.com", tokenHash: hashInviteToken("gt") });
    const joined = await db.join({ tokenHash: hashInviteToken("gt"), name: "Misty" });
    await db.setTimer({ orderId, hostUid: "host-1", closesAt: Date.now() - 1000 });

    await expect(
      db.addItem({
        orderId,
        participantId: joined.participantId,
        item: {
          cardId: "base1-4",
          name: "Charizard",
          imageSmall: "",
          setName: "Base",
          rarity: "Rare Holo",
          unitPriceCents: 72831,
          quantity: 1,
        },
      }),
    ).rejects.toMatchObject({ code: "order_closed" });
  });

  it("only lets the host check out", async () => {
    const orderId = await newOrder();
    await expect(db.checkout({ orderId, hostUid: "intruder" })).rejects.toMatchObject({
      code: "forbidden",
    });
    await db.checkout({ orderId, hostUid: "host-1" });
    const snapshot = await db.getSnapshot(orderId);
    expect(snapshot?.order.status).toBe("checked_out");
  });
});

import { getFirestore, Timestamp, type Firestore } from "firebase-admin/firestore";
import { nanoid } from "nanoid";
import { getAdminApp } from "@/lib/firebase/admin";
import type {
  LineItem,
  Order,
  OrderSnapshot,
  Participant,
} from "@/lib/domain";
import { canAddParticipant, isOrderClosed } from "@/lib/orders/rules";
import { DbError, type Db } from "@/lib/db/types";

function millis(value: Timestamp | null | undefined): number | null {
  return value ? value.toMillis() : null;
}

function mapOrder(id: string, data: FirebaseFirestore.DocumentData): Order {
  return {
    id,
    hostUid: data.hostUid,
    hostName: data.hostName,
    hostEmail: data.hostEmail,
    status: data.status,
    createdAt: millis(data.createdAt) ?? 0,
    closesAt: millis(data.closesAt),
    checkedOutAt: millis(data.checkedOutAt),
    fees: { taxRateBps: data.fees?.taxRateBps ?? 0 },
  };
}

function mapParticipant(
  id: string,
  data: FirebaseFirestore.DocumentData,
  items: LineItem[],
): Participant {
  return {
    id,
    role: data.role,
    name: data.name,
    email: data.email,
    joinedAt: millis(data.joinedAt),
    uid: data.uid ?? null,
    items,
  };
}

function mapItem(id: string, data: FirebaseFirestore.DocumentData): LineItem {
  return {
    id,
    cardId: data.cardId,
    name: data.name,
    imageSmall: data.imageSmall,
    setName: data.setName,
    rarity: data.rarity,
    unitPriceCents: data.unitPriceCents,
    quantity: data.quantity,
  };
}

export function createFirestoreDb(): Db {
  const firestore: Firestore = getFirestore(getAdminApp());
  const orders = firestore.collection("orders");

  async function readSnapshot(orderId: string): Promise<OrderSnapshot | null> {
    const orderDoc = await orders.doc(orderId).get();
    if (!orderDoc.exists) return null;
    const order = mapOrder(orderDoc.id, orderDoc.data() as FirebaseFirestore.DocumentData);

    const participantDocs = await orders.doc(orderId).collection("participants").get();
    const participants = await Promise.all(
      participantDocs.docs.map(async (doc) => {
        const itemDocs = await doc.ref.collection("items").get();
        const items = itemDocs.docs.map((item) => mapItem(item.id, item.data()));
        return mapParticipant(doc.id, doc.data(), items);
      }),
    );

    participants.sort((a, b) => {
      if (a.role === "host") return -1;
      if (b.role === "host") return 1;
      return 0;
    });

    return { order, participants };
  }

  return {
    async createOrder(input) {
      const orderId = nanoid(12);
      const orderRef = orders.doc(orderId);
      const now = Timestamp.now();
      const openByHost = orders
        .where("hostUid", "==", input.hostUid)
        .where("status", "==", "open")
        .limit(1);
      return firestore.runTransaction(async (tx) => {
        const existing = await tx.get(openByHost);
        if (!existing.empty) {
          return existing.docs[0].id;
        }
        tx.set(orderRef, {
          hostUid: input.hostUid,
          hostName: input.hostName,
          hostEmail: input.hostEmail,
          status: "open",
          createdAt: now,
          closesAt: null,
          checkedOutAt: null,
          fees: { taxRateBps: input.taxRateBps },
        });
        tx.set(orderRef.collection("participants").doc(), {
          role: "host",
          name: input.hostName,
          email: input.hostEmail,
          joinedAt: now,
          uid: input.hostUid,
          inviteTokenHash: null,
        });
        return orderId;
      });
    },

    getSnapshot: readSnapshot,

    async findOpenOrderByHost(hostUid) {
      const snap = await orders
        .where("hostUid", "==", hostUid)
        .where("status", "==", "open")
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();
      return snap.empty ? null : snap.docs[0].id;
    },

    async findOrderIdByTokenHash(tokenHash) {
      const matches = await firestore
        .collectionGroup("participants")
        .where("inviteTokenHash", "==", tokenHash)
        .limit(1)
        .get();
      if (matches.empty) return null;
      return matches.docs[0].ref.parent.parent?.id ?? null;
    },

    async invite(input) {
      const orderRef = orders.doc(input.orderId);
      return firestore.runTransaction(async (tx) => {
        const orderDoc = await tx.get(orderRef);
        if (!orderDoc.exists) throw new DbError("order_not_found");
        const order = mapOrder(orderDoc.id, orderDoc.data() as FirebaseFirestore.DocumentData);
        if (order.hostUid !== input.hostUid) throw new DbError("forbidden");
        if (order.status !== "open") throw new DbError("order_closed");

        const participantsSnap = await tx.get(orderRef.collection("participants"));
        const existing = participantsSnap.docs.find(
          (doc) => doc.data().email === input.email,
        );
        if (existing) {
          const alreadyJoined = existing.data().joinedAt !== null;
          if (!alreadyJoined) {
            tx.update(existing.ref, { inviteTokenHash: input.tokenHash });
          }
          return { participantId: existing.id, alreadyInvited: true, alreadyJoined };
        }
        if (!canAddParticipant(participantsSnap.size)) {
          throw new DbError("cap_reached");
        }

        const participantRef = orderRef.collection("participants").doc();
        tx.set(participantRef, {
          role: "guest",
          name: "",
          email: input.email,
          joinedAt: null,
          uid: null,
          inviteTokenHash: input.tokenHash,
        });
        return { participantId: participantRef.id, alreadyInvited: false, alreadyJoined: false };
      });
    },

    async join(input) {
      return firestore.runTransaction(async (tx) => {
        const matches = await tx.get(
          firestore
            .collectionGroup("participants")
            .where("inviteTokenHash", "==", input.tokenHash)
            .limit(1),
        );
        if (matches.empty) throw new DbError("invalid_invite");

        const participantRef = matches.docs[0].ref;
        const orderRef = participantRef.parent.parent;
        if (!orderRef) throw new DbError("invalid_invite");

        const orderDoc = await tx.get(orderRef);
        if (!orderDoc.exists) throw new DbError("order_not_found");
        const order = mapOrder(orderDoc.id, orderDoc.data() as FirebaseFirestore.DocumentData);
        if (order.status !== "open") throw new DbError("order_closed");

        tx.update(participantRef, {
          name: input.name,
          joinedAt: Timestamp.now(),
        });
        return { orderId: orderRef.id, participantId: participantRef.id };
      });
    },

    async addItem(input) {
      const orderRef = orders.doc(input.orderId);
      const participantRef = orderRef.collection("participants").doc(input.participantId);
      await firestore.runTransaction(async (tx) => {
        const orderDoc = await tx.get(orderRef);
        if (!orderDoc.exists) throw new DbError("order_not_found");
        const order = mapOrder(orderDoc.id, orderDoc.data() as FirebaseFirestore.DocumentData);
        if (isOrderClosed(order, Date.now())) throw new DbError("order_closed");

        const participantDoc = await tx.get(participantRef);
        if (!participantDoc.exists) throw new DbError("participant_not_found");
        if (participantDoc.data()?.joinedAt == null) throw new DbError("not_joined");

        const existing = await tx.get(
          participantRef.collection("items").where("cardId", "==", input.item.cardId).limit(1),
        );
        if (!existing.empty) {
          const ref = existing.docs[0].ref;
          const current = existing.docs[0].data().quantity ?? 0;
          tx.update(ref, { quantity: current + input.item.quantity });
          return;
        }
        tx.set(participantRef.collection("items").doc(), {
          cardId: input.item.cardId,
          name: input.item.name,
          imageSmall: input.item.imageSmall,
          setName: input.item.setName,
          rarity: input.item.rarity,
          unitPriceCents: input.item.unitPriceCents,
          quantity: input.item.quantity,
        });
      });
    },

    async removeItem(input) {
      const orderRef = orders.doc(input.orderId);
      const itemRef = orderRef
        .collection("participants")
        .doc(input.participantId)
        .collection("items")
        .doc(input.lineId);
      await firestore.runTransaction(async (tx) => {
        const orderDoc = await tx.get(orderRef);
        if (!orderDoc.exists) throw new DbError("order_not_found");
        const order = mapOrder(orderDoc.id, orderDoc.data() as FirebaseFirestore.DocumentData);
        if (isOrderClosed(order, Date.now())) throw new DbError("order_closed");
        tx.delete(itemRef);
      });
    },

    async setTimer(input) {
      const orderRef = orders.doc(input.orderId);
      await firestore.runTransaction(async (tx) => {
        const orderDoc = await tx.get(orderRef);
        if (!orderDoc.exists) throw new DbError("order_not_found");
        const order = mapOrder(orderDoc.id, orderDoc.data() as FirebaseFirestore.DocumentData);
        if (order.hostUid !== input.hostUid) throw new DbError("forbidden");
        if (order.status !== "open") throw new DbError("order_closed");
        tx.update(orderRef, {
          closesAt: input.closesAt === null ? null : Timestamp.fromMillis(input.closesAt),
        });
      });
    },

    async checkout(input) {
      const orderRef = orders.doc(input.orderId);
      await firestore.runTransaction(async (tx) => {
        const orderDoc = await tx.get(orderRef);
        if (!orderDoc.exists) throw new DbError("order_not_found");
        const order = mapOrder(orderDoc.id, orderDoc.data() as FirebaseFirestore.DocumentData);
        if (order.hostUid !== input.hostUid) throw new DbError("forbidden");
        if (order.status === "checked_out") throw new DbError("already_checked_out");
        tx.update(orderRef, {
          status: "checked_out",
          checkedOutAt: Timestamp.now(),
        });
      });
    },

    subscribe(orderId, onChange) {
      const orderRef = orders.doc(orderId);
      const unsubscribers: Array<() => void> = [];
      let latestOrder: Order | null = null;
      const itemsByParticipant = new Map<string, LineItem[]>();
      const participantMeta = new Map<string, FirebaseFirestore.DocumentData>();
      const itemUnsubs = new Map<string, () => void>();

      function push(): void {
        if (!latestOrder) return;
        const participants = [...participantMeta.entries()].map(([id, data]) =>
          mapParticipant(id, data, itemsByParticipant.get(id) ?? []),
        );
        participants.sort((a, b) => {
          if (a.role === "host") return -1;
          if (b.role === "host") return 1;
          return 0;
        });
        onChange({ order: latestOrder, participants });
      }

      unsubscribers.push(
        orderRef.onSnapshot((doc) => {
          if (!doc.exists) return;
          latestOrder = mapOrder(doc.id, doc.data() as FirebaseFirestore.DocumentData);
          push();
        }),
      );

      unsubscribers.push(
        orderRef.collection("participants").onSnapshot((snap) => {
          const present = new Set<string>();
          snap.docs.forEach((doc) => {
            present.add(doc.id);
            participantMeta.set(doc.id, doc.data());
            if (!itemUnsubs.has(doc.id)) {
              const unsub = doc.ref.collection("items").onSnapshot((itemsSnap) => {
                itemsByParticipant.set(
                  doc.id,
                  itemsSnap.docs.map((item) => mapItem(item.id, item.data())),
                );
                push();
              });
              itemUnsubs.set(doc.id, unsub);
            }
          });
          for (const id of [...participantMeta.keys()]) {
            if (!present.has(id)) {
              participantMeta.delete(id);
              itemsByParticipant.delete(id);
              itemUnsubs.get(id)?.();
              itemUnsubs.delete(id);
            }
          }
          push();
        }),
      );

      return () => {
        unsubscribers.forEach((fn) => fn());
        itemUnsubs.forEach((fn) => fn());
      };
    },
  };
}

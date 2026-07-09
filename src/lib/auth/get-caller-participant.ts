import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { guestCookieName } from "@/lib/auth/cookies";

export interface CallerParticipant {
  participantId: string;
  role: "host" | "guest";
}

export async function getCallerParticipant(orderId: string): Promise<CallerParticipant | null> {
  const snapshot = await getDb().getSnapshot(orderId);
  if (!snapshot) return null;

  const user = await getCurrentUser();
  if (user) {
    const host = snapshot.participants.find(
      (participant) => participant.role === "host" && participant.uid === user.uid,
    );
    if (host && snapshot.order.hostUid === user.uid) {
      return { participantId: host.id, role: "host" };
    }
  }

  const store = await cookies();
  const guestId = store.get(guestCookieName(orderId))?.value;
  if (guestId) {
    const guest = snapshot.participants.find(
      (participant) => participant.id === guestId && participant.role === "guest",
    );
    if (guest) {
      return { participantId: guest.id, role: "guest" };
    }
  }

  return null;
}

export const MAX_PARTICIPANTS = 3;

export const DEFAULT_TAX_RATE_BPS = 875;

export type OrderStatus = "open" | "closed" | "checked_out";

export type ParticipantRole = "host" | "guest";

export interface OrderFees {
  taxRateBps: number;
}

export interface Order {
  id: string;
  hostUid: string;
  hostName: string;
  hostEmail: string;
  status: OrderStatus;
  createdAt: number;
  closesAt: number | null;
  checkedOutAt: number | null;
  fees: OrderFees;
}

export interface LineItem {
  id: string;
  cardId: string;
  name: string;
  imageSmall: string;
  setName: string;
  rarity: string;
  unitPriceCents: number;
  quantity: number;
}

export interface Participant {
  id: string;
  role: ParticipantRole;
  name: string;
  email: string;
  joinedAt: number | null;
  uid: string | null;
  items: LineItem[];
}

export interface OrderSnapshot {
  order: Order;
  participants: Participant[];
}

export interface ParticipantBreakdown {
  participant: Participant;
  subtotalCents: number;
}

export interface OrderTotals {
  perParticipant: ParticipantBreakdown[];
  subtotalCents: number;
  taxCents: number;
  grandTotalCents: number;
}

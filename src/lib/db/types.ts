import type { LineItem, OrderSnapshot } from "@/lib/domain";

export interface CreateOrderInput {
  hostUid: string;
  hostName: string;
  hostEmail: string;
  taxRateBps: number;
}

export interface InviteInput {
  orderId: string;
  hostUid: string;
  email: string;
  tokenHash: string;
}

export interface InviteResult {
  participantId: string;
  alreadyInvited: boolean;
  alreadyJoined: boolean;
}

export interface JoinInput {
  tokenHash: string;
  name: string;
}

export interface JoinResult {
  orderId: string;
  participantId: string;
}

export interface AddItemInput {
  orderId: string;
  participantId: string;
  item: Omit<LineItem, "id">;
}

export interface RemoveItemInput {
  orderId: string;
  participantId: string;
  lineId: string;
}

export interface SetTimerInput {
  orderId: string;
  hostUid: string;
  closesAt: number | null;
}

export interface CheckoutInput {
  orderId: string;
  hostUid: string;
}

export type Unsubscribe = () => void;

export interface Db {
  createOrder(input: CreateOrderInput): Promise<string>;
  getSnapshot(orderId: string): Promise<OrderSnapshot | null>;
  findOpenOrderByHost(hostUid: string): Promise<string | null>;
  findOrderIdByTokenHash(tokenHash: string): Promise<string | null>;
  invite(input: InviteInput): Promise<InviteResult>;
  join(input: JoinInput): Promise<JoinResult>;
  addItem(input: AddItemInput): Promise<void>;
  removeItem(input: RemoveItemInput): Promise<void>;
  setTimer(input: SetTimerInput): Promise<void>;
  checkout(input: CheckoutInput): Promise<void>;
  subscribe(orderId: string, onChange: (snapshot: OrderSnapshot) => void): Unsubscribe;
}

export class DbError extends Error {
  constructor(public code: string, message?: string) {
    super(message ?? code);
    this.name = "DbError";
  }
}

import { z } from "zod";

export const inviteSchema = z.object({
  orderId: z.string().min(1),
  email: z.string().trim().toLowerCase().email(),
});

export const joinSchema = z.object({
  token: z.string().min(1),
  name: z.string().trim().min(1).max(60),
});

export const addItemSchema = z.object({
  orderId: z.string().min(1),
  cardId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
});

export const removeItemSchema = z.object({
  orderId: z.string().min(1),
  lineId: z.string().min(1),
});

export const setTimerSchema = z.object({
  orderId: z.string().min(1),
  minutes: z.number().int().min(1).max(60).nullable(),
});

export const checkoutSchema = z.object({
  orderId: z.string().min(1),
});

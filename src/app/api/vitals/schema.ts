import { z } from "zod";

export const MAX_VITALS_BODY_BYTES = 2_048;

export const vitalsSchema = z.union([
  z.object({
    name: z.string().min(1).max(64),
    value: z.number().finite(),
    rating: z.string().max(32).optional(),
    id: z.string().max(128).optional(),
  }),
  z.object({
    name: z.literal("route_error"),
    message: z.string().max(1_000),
    digest: z.string().max(128).optional(),
  }),
]);

export type VitalsPayload = z.infer<typeof vitalsSchema>;

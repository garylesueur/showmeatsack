import { z } from "zod";

export const SHARE_MAX_BYTES = 5 * 1024 * 1024;
export const SHARE_DEFAULT_TTL_SECONDS = 30 * 24 * 60 * 60;
export const SHARE_MAX_TTL_SECONDS = SHARE_DEFAULT_TTL_SECONDS;

const sharePayloadFields = {
  html: z.string().min(1).optional(),
  zipBase64: z.string().min(1).optional(),
};

function onePayload<T extends { html?: string; zipBase64?: string }>(schema: z.ZodType<T>) {
  return schema.refine((value) => Boolean(value.html) !== Boolean(value.zipBase64), {
    message: "Send either html or a zip, not both or neither.",
  });
}

export const createShareSchema = onePayload(
  z.object({
    ...sharePayloadFields,
    expiresInSeconds: z.number().int().positive().max(SHARE_MAX_TTL_SECONDS).optional(),
  }),
);

export type CreateShareInput = z.infer<typeof createShareSchema>;

export const replaceShareSchema = onePayload(z.object(sharePayloadFields));

export type ReplaceShareInput = z.infer<typeof replaceShareSchema>;

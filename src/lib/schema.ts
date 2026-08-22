import { z } from "zod";

export const SHARE_MAX_BYTES = 5 * 1024 * 1024;
export const SHARE_DEFAULT_TTL_SECONDS = 30 * 24 * 60 * 60;
export const SHARE_MAX_TTL_SECONDS = SHARE_DEFAULT_TTL_SECONDS;

const sharePayloadFields = {
  html: z.string().min(1).optional(),
  markdown: z.string().min(1).optional(),
  zipBase64: z.string().min(1).optional(),
};

function payloadCount(value: { html?: string; markdown?: string; zipBase64?: string }): number {
  return (
    Number(value.html !== undefined) +
    Number(value.markdown !== undefined) +
    Number(value.zipBase64 !== undefined)
  );
}

function onePayload<T extends { html?: string; markdown?: string; zipBase64?: string }>(
  schema: z.ZodType<T>,
) {
  return schema.refine((value) => payloadCount(value) === 1, {
    message: "Send html, markdown, or a zip — one of them.",
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

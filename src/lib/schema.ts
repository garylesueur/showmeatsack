import { z } from "zod";

export const SHARE_MAX_BYTES = 5 * 1024 * 1024;
export const SHARE_DEFAULT_TTL_SECONDS = 30 * 24 * 60 * 60;
export const SHARE_MAX_TTL_SECONDS = SHARE_DEFAULT_TTL_SECONDS;

export const qrShareSchema = z.strictObject({
  url: z
    .string()
    .min(1)
    .superRefine((value, context) => {
      let valid =
        /^https?:\/\//i.test(value) &&
        value === value.trim() &&
        new TextEncoder().encode(value).byteLength <= 512;
      // oxlint-disable-next-line no-control-regex
      valid = valid && !/[\u0000-\u001f\u007f]/.test(value);
      try {
        const url = new URL(value);
        valid =
          valid && ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
      } catch {
        valid = false;
      }
      if (!valid) {
        context.addIssue({
          code: "custom",
          message:
            "QR url must be an absolute HTTP or HTTPS URL without credentials or control characters, at most 512 UTF-8 bytes.",
        });
      }
    }),
  title: z.string().trim().min(1).max(120).optional(),
  style: z.enum(["classic", "brand", "action"]).optional(),
});

export type QrShareInput = z.infer<typeof qrShareSchema>;

const sharePayloadFields = {
  html: z.string().min(1).optional(),
  markdown: z.string().min(1).optional(),
  zipBase64: z.string().min(1).optional(),
  qr: qrShareSchema.optional(),
};

type SharePayload = { html?: string; markdown?: string; zipBase64?: string; qr?: QrShareInput };

function payloadCount(value: SharePayload): number {
  return (
    Number(value.html !== undefined) +
    Number(value.markdown !== undefined) +
    Number(value.zipBase64 !== undefined) +
    Number(value.qr !== undefined)
  );
}

function onePayload<T extends SharePayload>(schema: z.ZodType<T>) {
  return schema.refine((value) => payloadCount(value) === 1, {
    message: "Send html, markdown, a zip, or qr — one of them.",
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

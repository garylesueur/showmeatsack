import { z } from "zod";

export const SHARE_MAX_BYTES = 5 * 1024 * 1024;
export const SHARE_DEFAULT_TTL_SECONDS = 30 * 24 * 60 * 60;
export const SHARE_MAX_TTL_SECONDS = SHARE_DEFAULT_TTL_SECONDS;

export const tablePayloadSchema = z
  .object({
    csv: z.string().min(1).optional(),
    xlsxBase64: z.string().min(1).optional(),
    filename: z.string().min(1).max(255).optional(),
    title: z.string().min(1).max(255).optional(),
    headerRow: z.number().int().min(0).optional(),
  })
  .refine(
    (value) => Number(value.csv !== undefined) + Number(value.xlsxBase64 !== undefined) === 1,
    { message: "Send csv or xlsxBase64 inside table, exactly one." },
  );

export type TablePayload = z.infer<typeof tablePayloadSchema>;

const sharePayloadFields = {
  html: z.string().min(1).optional(),
  markdown: z.string().min(1).optional(),
  zipBase64: z.string().min(1).optional(),
  table: tablePayloadSchema.optional(),
};

function payloadCount(value: {
  html?: string;
  markdown?: string;
  zipBase64?: string;
  table?: TablePayload;
}): number {
  return (
    Number(value.html !== undefined) +
    Number(value.markdown !== undefined) +
    Number(value.zipBase64 !== undefined) +
    Number(value.table !== undefined)
  );
}

function onePayload<
  T extends { html?: string; markdown?: string; zipBase64?: string; table?: TablePayload },
>(schema: z.ZodType<T>) {
  return schema.refine((value) => payloadCount(value) === 1, {
    message: "Send html, markdown, zipBase64, or table — exactly one.",
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

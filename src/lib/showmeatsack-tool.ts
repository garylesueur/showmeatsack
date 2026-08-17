import { z } from "zod";
import { limitCreateFromRequest } from "./create-rate-limit";
import { incomingRequest } from "./incoming-request";
import { SHARE_MAX_TTL_SECONDS } from "./schema";
import {
  isShareServiceError,
  type ShareServiceError,
  type createShareService,
} from "./shares";

export const SHOWMEATSACK_TOOL_NAME = "showmeatsack.com";

export const showmeatsackToolActions = [
  "create",
  "status",
  "replace",
  "delete",
] as const;

export type ShowmeatsackToolAction = (typeof showmeatsackToolActions)[number];

export const showmeatsackToolInputSchema = z.object({
  action: z.enum(showmeatsackToolActions),
  shareId: z.string().min(1).optional(),
  manageToken: z.string().min(1).optional(),
  html: z.string().min(1).optional(),
  zipBase64: z.string().min(1).optional(),
  expiresInSeconds: z
    .number()
    .int()
    .positive()
    .max(SHARE_MAX_TTL_SECONDS)
    .optional(),
});

export type ShowmeatsackToolShares = ReturnType<typeof createShareService>;

function invalidAction(message: string): ShareServiceError {
  return {
    code: "invalid_action",
    message,
    status: 400,
  };
}

export function isShowmeatsackToolError(
  value: unknown,
): value is ShareServiceError {
  return isShareServiceError(value);
}

export function createShowmeatsackTool(shares: ShowmeatsackToolShares) {
  return {
    name: SHOWMEATSACK_TOOL_NAME,
    async invoke(input: z.infer<typeof showmeatsackToolInputSchema>) {
      if (input.action === "create") {
        const request = incomingRequest();
        if (request) {
          const limited = await limitCreateFromRequest(request);
          if (!limited.ok) {
            return {
              code: "rate_limited",
              message:
                "Too many pages published from this address. Try again later.",
              status: 429,
            };
          }
        }
        return await shares.create({
          html: input.html,
          zipBase64: input.zipBase64,
          expiresInSeconds: input.expiresInSeconds,
        });
      }
      if (!input.shareId) {
        return invalidAction("shareId is required.");
      }
      if (input.action === "status") {
        return await shares.status(input.shareId, input.manageToken);
      }
      if (input.action === "replace") {
        return await shares.replace(input.shareId, input.manageToken, {
          html: input.html,
          zipBase64: input.zipBase64,
        });
      }
      if (input.action === "delete") {
        return await shares.remove(input.shareId, input.manageToken);
      }
      return invalidAction("Unknown action.");
    },
  };
}

import { createTokenVerifier, type ProductVerificationOutcome } from "./lanyard/product-verifier";

/**
 * lanyard is the estate's single sign-in. show.imeatsack.com never runs a login
 * screen: people sign in on lanyard, and agents present a lanyard token as
 * `Authorization: Bearer` on create. Everything here is inert until
 * `LANYARD_URL` is set — with it unset, create behaves exactly as it always has.
 */
export const LANYARD_PRODUCT = "showmeatsack";

export function lanyardUrl(): string | undefined {
  const trimmed = process.env.LANYARD_URL?.trim().replace(/\/+$/, "");
  return trimmed ? trimmed : undefined;
}

/** Where the nav's "Sign in" goes. Undefined hides the link. */
export function lanyardSignInHref(): string | undefined {
  const origin = lanyardUrl();
  return origin ? `${origin}/sign-in?product=${LANYARD_PRODUCT}` : undefined;
}

export type Verify = (presented: string | null | undefined) => Promise<ProductVerificationOutcome>;

const globalForLanyard = globalThis as typeof globalThis & {
  showmeatsackLanyard?: { url: string; verify: Verify };
};

/**
 * One verifier per process, in production too, so the grace cache survives
 * between requests. Rebuilt only if `LANYARD_URL` changes.
 */
function defaultVerifier(url: string): Verify {
  const cached = globalForLanyard.showmeatsackLanyard;
  if (cached?.url === url) return cached.verify;
  const verify = createTokenVerifier({ lanyardUrl: url, product: LANYARD_PRODUCT });
  globalForLanyard.showmeatsackLanyard = { url, verify };
  return verify;
}

export function installTestLanyardVerifier(url: string, verify: Verify): void {
  globalForLanyard.showmeatsackLanyard = { url, verify };
}

export function clearInstalledLanyardVerifier(): void {
  delete globalForLanyard.showmeatsackLanyard;
}

/**
 * A manage token is 24 random bytes as base64url — exactly 32 characters with
 * no prefix and no dots. It means nothing on create, and create has always
 * ignored it, so an agent that reuses its header from a replace call keeps
 * publishing anonymously instead of being refused by lanyard. lanyard tokens
 * never take this shape: personal tokens carry `lny_pat_` and are longer, and
 * agent-journey tokens are JWTs or provider tokens of other lengths.
 */
const MANAGE_TOKEN_SHAPE = /^[A-Za-z0-9_-]{32}$/;

function bearerFrom(request: Request): string | undefined {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return undefined;
  const token = header.slice("Bearer ".length).trim();
  return token || undefined;
}

export type CreatorIdentity =
  | { kind: "anonymous" }
  | { kind: "account"; account: string }
  | { kind: "refused" };

/**
 * Who is creating. Only ever asked on create — replace, delete, and status are
 * gated by the manage token alone and never reach lanyard.
 *
 * - `LANYARD_URL` unset, no Bearer, or a manage-token-shaped Bearer: anonymous,
 *   exactly as before.
 * - Otherwise lanyard decides: accepted (fresh or within the grace window)
 *   names the account; anything else is refused.
 */
export async function identifyCreator(
  request: Request | undefined,
  verifyOverride?: Verify,
): Promise<CreatorIdentity> {
  const url = lanyardUrl();
  if (!url || !request) return { kind: "anonymous" };
  const presented = bearerFrom(request);
  if (!presented || MANAGE_TOKEN_SHAPE.test(presented)) return { kind: "anonymous" };
  const verify = verifyOverride ?? defaultVerifier(url);
  const outcome = await verify(presented);
  return outcome.outcome === "accepted"
    ? { kind: "account", account: outcome.account }
    : { kind: "refused" };
}

export const UNAUTHORIZED = {
  status: 401,
  code: "unauthorized",
  message: "That sign-in token was not accepted. Sign in again on lanyard, or publish without it.",
} as const;

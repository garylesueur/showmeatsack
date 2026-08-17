export type ShareHostDecision =
  | { kind: "next" }
  | { kind: "redirect"; location: string }
  | { kind: "not_found" };

export function hostnameFromOrigin(origin: string): string {
  return new URL(origin).hostname.toLowerCase();
}

export function hostnameFromHostHeader(host: string): string {
  const trimmed = host.trim().toLowerCase();
  if (trimmed.startsWith("[")) {
    const end = trimmed.indexOf("]");
    if (end !== -1) {
      return trimmed.slice(1, end);
    }
  }
  const colon = trimmed.lastIndexOf(":");
  if (colon !== -1 && trimmed.includes(".") === false) {
    return trimmed.slice(0, colon);
  }
  if (colon !== -1 && /^\d+$/.test(trimmed.slice(colon + 1))) {
    return trimmed.slice(0, colon);
  }
  return trimmed;
}

export function shareHostDecision(input: {
  host: string;
  pathname: string;
  search: string;
  productOrigin: string;
  viewOrigin: string;
}): ShareHostDecision {
  const productHost = hostnameFromOrigin(input.productOrigin);
  const viewHost = hostnameFromOrigin(input.viewOrigin);
  if (productHost === viewHost) {
    return { kind: "next" };
  }

  const requestHost = hostnameFromHostHeader(input.host);
  const onView = requestHost === viewHost;
  const onProduct = requestHost === productHost;
  const isSharePath = input.pathname === "/s" || input.pathname.startsWith("/s/");

  if (onProduct && isSharePath) {
    return {
      kind: "redirect",
      location: `${input.viewOrigin}${input.pathname}${input.search}`,
    };
  }

  if (onView && isSharePath) {
    return { kind: "next" };
  }

  if (onView && (input.pathname === "/" || input.pathname === "")) {
    return { kind: "redirect", location: `${input.productOrigin}/` };
  }

  if (onView) {
    return { kind: "not_found" };
  }

  return { kind: "next" };
}

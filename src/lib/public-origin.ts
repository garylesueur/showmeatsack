const DEFAULT_PRODUCT_ORIGIN = "https://showmeatsack.com";

function trimOrigin(value: string | undefined): string | undefined {
  const trimmed = value?.replace(/\/$/, "");
  return trimmed ? trimmed : undefined;
}

export function publicOrigin(): string {
  return trimOrigin(process.env.PUBLIC_BASE_URL) ?? DEFAULT_PRODUCT_ORIGIN;
}

export function viewPublicOrigin(): string {
  return trimOrigin(process.env.VIEW_PUBLIC_BASE_URL) ?? publicOrigin();
}

export function originsAreSplit(): boolean {
  return viewPublicOrigin() !== publicOrigin();
}

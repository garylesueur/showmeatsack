export function manageTokenFrom(request: Request): string | undefined {
  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    const token = header.slice("Bearer ".length).trim();
    if (token) {
      return token;
    }
  }
  const fromQuery = new URL(request.url).searchParams.get("token")?.trim();
  return fromQuery || undefined;
}

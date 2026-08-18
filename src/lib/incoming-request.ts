import { AsyncLocalStorage } from "node:async_hooks";

const storage = new AsyncLocalStorage<Request>();

export function runWithIncomingRequest<T>(request: Request, run: () => T): T {
  return storage.run(request, run);
}

export function incomingRequest(): Request | undefined {
  return storage.getStore();
}

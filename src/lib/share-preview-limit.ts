export function createCaptureLimiter(limit: number) {
  let active = 0;
  return {
    tryEnter(): boolean {
      if (active >= limit) {
        return false;
      }
      active += 1;
      return true;
    },
    leave(): void {
      if (active > 0) {
        active -= 1;
      }
    },
  };
}

export const sharePreviewCaptures = createCaptureLimiter(2);

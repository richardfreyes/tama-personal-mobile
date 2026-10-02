/** Resolves after the given delay — a promisified setTimeout for polling/backoff loops. */
export const wait = (milliseconds: number) => new Promise<void>((resolve) => {
  setTimeout(resolve, milliseconds);
});

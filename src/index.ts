/**
 * Return the result of the first successful implementation in a set.
 */
export default function tryFallback<N extends string, I, O>(
  fns: Array<[N, (input: I) => Promise<O>]>,
  errorHandler?: (name: N, error: Error) => undefined | undefined
) {
  return async (arg: I): Promise<[N, O]> => {
    for (const [implementation, fn] of fns) {
      try {
        return [implementation, await fn(arg)];
      } catch (error) {
        if (errorHandler) {
          errorHandler(implementation, error);
        }
      }
    }
    throw new Error("Fallback functions exhausted");
  };
}

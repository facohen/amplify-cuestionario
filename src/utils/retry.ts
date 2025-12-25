export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: unknown) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  shouldRetry: (error: unknown) => {
    // Retry on network errors and 5xx responses
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes('network') ||
        message.includes('timeout') ||
        message.includes('econnreset') ||
        message.includes('500') ||
        message.includes('502') ||
        message.includes('503') ||
        message.includes('504')
      );
    }
    return false;
  },
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateDelay(attempt: number, baseDelayMs: number, maxDelayMs: number): number {
  // Exponential backoff with jitter
  const exponentialDelay = baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * 0.3 * exponentialDelay; // 0-30% jitter
  return Math.min(exponentialDelay + jitter, maxDelayMs);
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt < opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const isLastAttempt = attempt === opts.maxAttempts - 1;
      const shouldRetry = opts.shouldRetry(error);

      if (isLastAttempt || !shouldRetry) {
        throw error;
      }

      const delay = calculateDelay(attempt, opts.baseDelayMs, opts.maxDelayMs);
      console.warn(
        `Retry attempt ${attempt + 1}/${opts.maxAttempts} after ${Math.round(delay)}ms`,
        error instanceof Error ? error.message : error
      );
      await sleep(delay);
    }
  }

  throw lastError;
}

// Convenience wrapper for GraphQL operations
export function withGraphQLRetry<T>(fn: () => Promise<T>): Promise<T> {
  return withRetry(fn, {
    maxAttempts: 3,
    baseDelayMs: 500,
    shouldRetry: (error: unknown) => {
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        // Retry on transient errors but not on auth/validation errors
        return (
          message.includes('network') ||
          message.includes('timeout') ||
          message.includes('temporarily') ||
          message.includes('throttl') ||
          message.includes('rate limit')
        );
      }
      return false;
    },
  });
}

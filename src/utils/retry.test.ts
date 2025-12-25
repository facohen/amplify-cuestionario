import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withRetry, withGraphQLRetry } from './retry';

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns result on first successful attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');

    const result = await withRetry(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on network error', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce('success');

    const promise = withRetry(fn, { baseDelayMs: 100 });

    // Advance timer past first retry delay
    await vi.runAllTimersAsync();

    const result = await promise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws after max attempts', async () => {
    const error = new Error('network error');
    const fn = vi.fn().mockRejectedValue(error);

    // Start the retry operation
    const promise = withRetry(fn, { maxAttempts: 3, baseDelayMs: 100 });

    // Catch the rejection to prevent unhandled rejection
    promise.catch(() => {});

    // Run all timers to exhaust retries
    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrow('network error');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('does not retry non-retryable errors', async () => {
    const error = new Error('validation error');
    const fn = vi.fn().mockRejectedValue(error);

    await expect(withRetry(fn)).rejects.toThrow('validation error');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('uses custom shouldRetry function', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('custom-retry'))
      .mockResolvedValueOnce('success');

    const promise = withRetry(fn, {
      baseDelayMs: 100,
      shouldRetry: (err) => err instanceof Error && err.message === 'custom-retry',
    });

    await vi.runAllTimersAsync();

    const result = await promise;
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('respects maxDelayMs', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce('success');

    const promise = withRetry(fn, {
      maxAttempts: 3,
      baseDelayMs: 1000,
      maxDelayMs: 2000,
    });

    await vi.runAllTimersAsync();

    const result = await promise;
    expect(result).toBe('success');
  });
});

describe('withGraphQLRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('retries on throttling error', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('Request throttled'))
      .mockResolvedValueOnce('success');

    const promise = withGraphQLRetry(fn);

    await vi.runAllTimersAsync();

    const result = await promise;
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does not retry on auth error', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Unauthorized'));

    await expect(withGraphQLRetry(fn)).rejects.toThrow('Unauthorized');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on rate limit error', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('rate limit exceeded'))
      .mockResolvedValueOnce('success');

    const promise = withGraphQLRetry(fn);

    await vi.runAllTimersAsync();

    const result = await promise;
    expect(result).toBe('success');
  });
});

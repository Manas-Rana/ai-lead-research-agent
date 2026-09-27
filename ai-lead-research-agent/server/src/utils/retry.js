export async function withRetry(fn, options = {}) {
  const retries = options.retries ?? 2;
  const baseDelay = options.baseDelay ?? 700;

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;

      if (attempt === retries) break;

      const retryAfter = Number(error?.headers?.["retry-after"]);
      const delay = Number.isFinite(retryAfter)
        ? retryAfter * 1000
        : baseDelay * 2 ** attempt;

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

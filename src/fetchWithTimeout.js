export const isTimeoutError = (error) => error?.name === "AbortError";

export const fetchWithTimeout = async (
  input,
  init = {},
  timeoutMs = 10000
) => {
  const controller = new AbortController();
  const { signal: _ignoredSignal, ...requestInit } = init;
  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(input, {
      ...requestInit,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
};

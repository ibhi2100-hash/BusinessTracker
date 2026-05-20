export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 15000
) {
  const controller = new AbortController()

  const id = setTimeout(() => {
    controller.abort()
  }, timeout)

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(id)
  }
}
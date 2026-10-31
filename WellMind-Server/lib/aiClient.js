const AI_SERVICE_URL = (process.env.AI_SERVICE_URL || "http://localhost:5001").replace(/\/$/, "");
const TIMEOUT_MS = Number(process.env.AI_SERVICE_TIMEOUT_MS || 25000);

export class AiServiceError extends Error {
  constructor(message, status = 503, payload = {}) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export async function requestChat(message, history = []) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${AI_SERVICE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
      signal: controller.signal,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new AiServiceError(
        typeof data.error === "string" ? data.error : "AI service error",
        res.status,
        data
      );
    }
    return data;
  } catch (err) {
    if (err instanceof AiServiceError) throw err;
    if (err?.name === "AbortError") {
      throw new AiServiceError("The support service took too long to respond.", 504);
    }
    throw new AiServiceError("The support service is unavailable right now.", 503);
  } finally {
    clearTimeout(timer);
  }
}

export async function requestHealth() {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/health`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return { reachable: false };
    const data = await res.json().catch(() => ({}));
    return { reachable: true, ...data };
  } catch {
    return { reachable: false };
  }
}

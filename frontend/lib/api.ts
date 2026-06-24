/**
 * Client helpers for talking to the FastAPI backend.
 * Uses same-origin paths so rewrites (local) and Vercel routes (prod) both work.
 */

export type ChatResponse = {
  reply: string;
};

export type HealthResponse = {
  status: string;
};

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: string };
    if (typeof data.detail === "string") {
      return data.detail;
    }
  } catch {
    // Fall through to generic message below.
  }
  return `Request failed with status ${response.status}`;
}

/** POST /api/chat — send a user message and receive the coach reply. */
export async function sendChatMessage(message: string): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as ChatResponse;
  return data.reply;
}

/** GET / — lightweight check that the FastAPI backend is reachable. */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch("/health");
    if (!response.ok) {
      return false;
    }
    const data = (await response.json()) as HealthResponse;
    return data.status === "ok";
  } catch {
    return false;
  }
}

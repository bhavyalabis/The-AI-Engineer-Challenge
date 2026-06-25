"use client";

// A minimal chat UI. Everything lives in this one file so it's easy to follow:
//   1. keep a list of messages in state
//   2. on submit, POST the message to the FastAPI backend (/api/chat)
//   3. append the reply to the list
import { FormEvent, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    // Show the user's message immediately, then clear the box.
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      // Same-origin path — next.config.ts proxies this to the FastAPI backend.
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const reply = res.ok ? data.reply : `Error: ${data.detail ?? res.status}`;
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Could not reach the backend." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold text-slate-900">Mindful Coach</h1>

      {/* Message list */}
      <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-emerald-100 bg-white p-4">
        {messages.length === 0 && (
          <p className="text-slate-500">Ask your coach anything to get started.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <span
              className={`inline-block whitespace-pre-wrap rounded-2xl px-4 py-2 ${
                m.role === "user"
                  ? "bg-emerald-700 text-white"
                  : "bg-emerald-50 text-slate-900"
              }`}
            >
              {m.content}
            </span>
          </div>
        ))}
        {loading && <p className="text-slate-500">Thinking…</p>}
      </div>

      {/* Input box */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-full border border-slate-300 px-4 py-2 focus:border-emerald-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || input.trim().length === 0}
          className="rounded-full bg-emerald-700 px-5 py-2 font-semibold text-white disabled:bg-emerald-400"
        >
          Send
        </button>
      </form>
    </div>
  );
}

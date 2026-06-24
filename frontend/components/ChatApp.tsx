"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { checkBackendHealth, sendChatMessage } from "@/lib/api";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const starterMessage: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi there — I'm your supportive mental coach. What's on your mind today? You can talk about stress, motivation, habits, or anything you'd like a little help with.",
};

export default function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([starterMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkBackendHealth().then(setBackendOnline);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = input.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const reply = await sendChatMessage(trimmed);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply,
        },
      ]);
      setBackendOnline(true);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again.";
      setError(message);
      setBackendOnline(false);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-full min-h-screen w-full max-w-3xl flex-col px-4 py-6 sm:px-6">
      <header className="mb-6 rounded-2xl border border-emerald-200 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Mindful Coach
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              Your supportive mental coach
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-slate-700">
              Chat with an AI coach powered by your FastAPI backend. Share what
              you are working through and get thoughtful, encouraging guidance.
            </p>
          </div>
          <BackendStatus online={backendOnline} />
        </div>
      </header>

      <section
        aria-label="Chat messages"
        className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-inner sm:p-6"
      >
        {messages.map((message) => (
          <article
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-base leading-7 shadow-sm ${
                message.role === "user"
                  ? "bg-emerald-700 text-white"
                  : "border border-emerald-100 bg-emerald-50 text-slate-900"
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>
          </article>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-slate-700">
              Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </section>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-4 rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm"
      >
        <label htmlFor="message" className="sr-only">
          Your message
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Tell your coach what's on your mind..."
          disabled={isLoading}
          className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            Press Send when you are ready. Messages go to your FastAPI backend.
          </p>
          <button
            type="submit"
            disabled={isLoading || input.trim().length === 0}
            className="rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400"
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}

function BackendStatus({ online }: { online: boolean | null }) {
  if (online === null) {
    return (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
        Checking backend...
      </span>
    );
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-medium ${
        online
          ? "bg-emerald-100 text-emerald-800"
          : "bg-amber-100 text-amber-900"
      }`}
    >
      {online ? "Backend connected" : "Backend offline"}
    </span>
  );
}

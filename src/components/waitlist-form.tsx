"use client";

import { useState } from "react";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

interface WaitlistFormProps {
  variant?: "hero" | "cta";
}

export function WaitlistForm({ variant = "hero" }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3">
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        <span className="text-[14px] font-medium text-emerald-300">{message}</span>
      </div>
    );
  }

  const isCta = variant === "cta";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
      <div className="relative w-full sm:w-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className={`w-full sm:w-72 rounded-xl px-4 py-3 text-[14px] transition-all focus:outline-none focus:ring-2 ${
            isCta
              ? "border border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20 backdrop-blur-sm"
              : "border border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-violet-400/50 focus:ring-violet-500/20 backdrop-blur-sm"
          }`}
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className={`inline-flex w-full sm:w-auto items-center justify-center rounded-xl px-6 py-3 text-[14px] font-medium transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 ${
          isCta
            ? "bg-white text-slate-900 shadow-lg shadow-black/20 hover:bg-white/90"
            : "btn-gradient text-white"
        }`}
      >
        {status === "loading" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        Join Waitlist
        {status !== "loading" && <ArrowRight className="ml-2 h-4 w-4" />}
      </button>
      {status === "error" && (
        <p className="text-[13px] text-red-400">{message}</p>
      )}
    </form>
  );
}

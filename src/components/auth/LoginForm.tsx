"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const { error } = await supabaseBrowser.auth.signInWithOtp({ email });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("sent");
    setMessage("Check your email for a login link.");
    setTimeout(() => router.refresh(), 1500);
  };

  return (
    <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <h1 className="text-3xl font-semibold text-white">Salon owner login</h1>
      <p className="mt-4 text-sm leading-7 text-slate-300">Enter your email to receive a secure login link and manage appointments.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <label className="block text-sm text-slate-300">
          Email address
          <input
            className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-300/10"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="owner@salon.com"
            required
          />
        </label>
        <button type="submit" className="w-full rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200">
          {status === "sending" ? "Sending..." : "Send login link"}
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-amber-200">{message}</p>}
    </div>
  );
}

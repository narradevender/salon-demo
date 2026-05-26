"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data?.error || "Invalid username or password.");
        setStatus("idle");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setStatus("idle");
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <h1 className="text-3xl font-semibold text-white">Salon owner login</h1>
      <p className="mt-4 text-sm leading-7 text-slate-300">
        Sign in to manage bookings, customers, and analytics for your salon.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <label className="block text-sm text-slate-300">
          Username
          <input
            className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-300/10"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Owner"
            autoComplete="username"
            required
          />
        </label>
        <label className="block text-sm text-slate-300">
          Password
          <input
            className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-300/10"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </label>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:opacity-60"
        >
          {status === "submitting" ? "Signing in…" : "Sign in"}
        </button>
      </form>
      {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
    </div>
  );
}

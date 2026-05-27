"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppFab({ href }: { href: string }) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Book on WhatsApp"
      className="group fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-emerald-500 py-2 pl-2 pr-5 text-sm font-semibold text-white shadow-[0_20px_50px_-12px_rgba(16,185,129,0.6)] transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.03] sm:bottom-8 sm:right-8"
    >
      <span aria-hidden className="fab-pulse-1 absolute inset-0 -z-10 rounded-full bg-emerald-400/70" />
      <span aria-hidden className="fab-pulse-2 absolute inset-0 -z-10 rounded-full bg-emerald-400/50" />
      <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-emerald-500 shadow-inner shadow-emerald-700/10">
        <MessageCircle size={20} className="fill-emerald-500/10" />
        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-emerald-500 bg-emerald-300">
          <span aria-hidden className="fab-dot-ping absolute inset-0 rounded-full bg-emerald-300" />
        </span>
      </span>
      <span className="pr-1">Book on WhatsApp</span>
    </a>
  );
}

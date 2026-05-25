"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/bookings", label: "Bookings", icon: "📅" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📈" },
  { href: "/dashboard/customers", label: "Customers", icon: "👥" },
];

export default function Sidebar({ ownerEmail }: { ownerEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <aside className="flex w-full shrink-0 flex-col gap-2 rounded-[2rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-64">
      <div className="px-3 py-4">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300">NyCAA 14</p>
        <p className="mt-2 truncate text-sm text-slate-300">{ownerEmail}</p>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-amber-400/15 text-amber-200"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span aria-hidden>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-1 pb-2 pt-4">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:opacity-50"
        >
          {isLoggingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </aside>
  );
}

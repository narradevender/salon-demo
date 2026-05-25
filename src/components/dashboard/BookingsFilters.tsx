"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type ServiceOption = { id: string; name: string };

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
  { value: "no_show", label: "No-show" },
];

export default function BookingsFilters({
  services,
  current,
}: {
  services: ServiceOption[];
  current: { status: string; serviceId: string; from: string; to: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/dashboard/bookings?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <select
        value={current.status}
        onChange={(event) => updateParam("status", event.target.value)}
        className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-amber-300"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-slate-900">
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={current.serviceId}
        onChange={(event) => updateParam("service", event.target.value)}
        className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-amber-300"
      >
        <option value="all" className="bg-slate-900">
          All services
        </option>
        {services.map((service) => (
          <option key={service.id} value={service.id} className="bg-slate-900">
            {service.name}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={current.from}
        onChange={(event) => updateParam("from", event.target.value)}
        className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-amber-300"
      />

      <input
        type="date"
        value={current.to}
        onChange={(event) => updateParam("to", event.target.value)}
        className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-amber-300"
      />
    </div>
  );
}

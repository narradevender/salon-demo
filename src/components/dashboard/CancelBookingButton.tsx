"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function CancelBookingButton({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    const confirmed = window.confirm("Cancel this booking?");
    if (!confirmed) return;

    setError(null);
    try {
      const response = await fetch(`/api/bookings/${appointmentId}/cancel`, { method: "POST" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data?.error || "Failed to cancel.");
        return;
      }
      startTransition(() => router.refresh());
    } catch (err) {
      console.error(err);
      setError("Failed to cancel.");
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleCancel}
        disabled={isPending}
        className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-200 transition hover:bg-rose-500/20 disabled:opacity-50"
      >
        {isPending ? "Cancelling…" : "Cancel"}
      </button>
      {error && <p className="text-[10px] text-rose-300">{error}</p>}
    </div>
  );
}

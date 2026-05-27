import {
  DASHBOARD_SALON_ID,
  daysAgoIso,
  fetchAppointments,
  formatINR,
} from "@/lib/dashboard";
import {
  AreaChart,
  DonutChart,
  HorizontalBarChart,
  HourlyBarsChart,
} from "@/components/dashboard/Charts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Analytics | Salon Demo",
};

function dayKey(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

function shortDayLabel(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const SOURCE_COLORS: Record<string, string> = {
  whatsapp: "#34d399", // emerald
  web: "#60a5fa", // sky
  walk_in: "#fbbf24", // amber
};
const SOURCE_FALLBACK_COLORS = ["#f87171", "#a78bfa", "#f472b6"];

export default async function AnalyticsPage() {
  const fromIso = daysAgoIso(29); // last 30 days inclusive
  const appointments = await fetchAppointments(DASHBOARD_SALON_ID, { fromIso });
  const nonCancelled = appointments.filter((a) => a.status !== "cancelled");

  // ---- Top services by booking count ----
  const serviceCounts = new Map<string, { name: string; count: number; revenue: number }>();
  for (const appt of nonCancelled) {
    const id = appt.service?.id ?? "unknown";
    const name = appt.service?.name ?? "Unknown service";
    const existing = serviceCounts.get(id) || { name, count: 0, revenue: 0 };
    existing.count += 1;
    existing.revenue += Number(appt.price || 0);
    serviceCounts.set(id, existing);
  }
  const topServices = [...serviceCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // ---- Revenue by day (last 14 days) ----
  const revenueDays: { day: string; revenue: number; count: number }[] = [];
  for (let offset = 13; offset >= 0; offset--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - offset);
    revenueDays.push({ day: d.toISOString().slice(0, 10), revenue: 0, count: 0 });
  }
  const revenueIndex = new Map(revenueDays.map((e) => [e.day, e]));
  for (const appt of nonCancelled) {
    const bucket = revenueIndex.get(dayKey(appt.scheduled_start));
    if (bucket) {
      bucket.revenue += Number(appt.price || 0);
      bucket.count += 1;
    }
  }

  // ---- Peak hours (full 24-hour breakdown) ----
  const hourCounts = new Array(24).fill(0) as number[];
  for (const appt of nonCancelled) {
    const hour = new Date(appt.scheduled_start).getHours();
    hourCounts[hour] += 1;
  }
  const allHours = hourCounts.map((value, hour) => ({ hour, value }));

  // ---- Booking sources ----
  const sourceCounts = new Map<string, number>();
  for (const appt of nonCancelled) {
    sourceCounts.set(appt.source, (sourceCounts.get(appt.source) || 0) + 1);
  }
  const totalSources = [...sourceCounts.values()].reduce((sum, n) => sum + n, 0);
  let fallbackIdx = 0;
  const sourceSlices = [...sourceCounts.entries()]
    .map(([source, count]) => ({
      label: source,
      value: count,
      color:
        SOURCE_COLORS[source] ??
        SOURCE_FALLBACK_COLORS[fallbackIdx++ % SOURCE_FALLBACK_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value);

  // ---- Headline numbers ----
  const totalRevenue = nonCancelled.reduce((sum, a) => sum + Number(a.price || 0), 0);
  const totalBookings = nonCancelled.length;
  const cancelledCount = appointments.length - nonCancelled.length;
  const avgTicket = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
  const peakHour = allHours.reduce((best, cur) => (cur.value > best.value ? cur : best), {
    hour: 0,
    value: 0,
  });

  return (
    <div className="space-y-6">
      <header className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Analytics</p>
        <h1 className="mt-2 text-2xl font-semibold">Last 30 days</h1>
        <p className="mt-1 text-sm text-slate-300">
          Performance summary across services, revenue, hours, and booking sources.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total bookings", value: totalBookings.toString(), tint: "amber" },
          { label: "Revenue (30d)", value: formatINR(totalRevenue), tint: "emerald" },
          { label: "Avg ticket", value: formatINR(avgTicket), tint: "sky" },
          { label: "Cancellations", value: cancelledCount.toString(), tint: "rose" },
        ].map((card) => (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
          >
            <div
              aria-hidden
              className={`absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl ${
                card.tint === "amber"
                  ? "bg-amber-400/15"
                  : card.tint === "emerald"
                    ? "bg-emerald-400/15"
                    : card.tint === "sky"
                      ? "bg-sky-400/15"
                      : "bg-rose-400/15"
              }`}
            />
            <p className="relative text-xs uppercase tracking-[0.3em] text-slate-400">
              {card.label}
            </p>
            <p className="relative mt-4 text-3xl font-semibold text-white">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Revenue trend</h2>
            <p className="text-xs text-slate-400">Daily revenue from confirmed bookings · last 14 days</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-amber-200">{formatINR(totalRevenue)}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">30-day total</p>
          </div>
        </div>
        <div className="mt-6 h-64 w-full">
          {revenueDays.some((d) => d.revenue > 0) ? (
            <AreaChart
              data={revenueDays.map((d) => ({
                x: shortDayLabel(d.day),
                y: d.revenue,
              }))}
              format="inr-compact"
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-slate-400">
              No revenue data in the last 14 days.
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">Top services</h2>
          <p className="text-xs text-slate-400">By booking count · last 30 days</p>
          <div className="mt-6">
            <HorizontalBarChart
              rows={topServices.map((s) => ({
                label: s.name,
                value: s.count,
                sub: `${s.count} bookings · ${formatINR(s.revenue)}`,
              }))}
            />
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">Booking sources</h2>
          <p className="text-xs text-slate-400">Where bookings come from</p>
          <div className="mt-6">
            {totalSources === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-400">
                No bookings yet.
              </p>
            ) : (
              <DonutChart slices={sourceSlices} total={totalSources} totalLabel="bookings" />
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Peak hours</h2>
            <p className="text-xs text-slate-400">All 24 hours · hover bars for counts</p>
          </div>
          {peakHour.value > 0 && (
            <p className="text-sm text-amber-200">
              Busiest at{" "}
              <span className="font-semibold">
                {new Date(0, 0, 0, peakHour.hour).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  hour12: true,
                })}
              </span>{" "}
              · {peakHour.value} bookings
            </p>
          )}
        </div>
        <div className="mt-6">
          {totalBookings === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-400">
              No bookings yet.
            </p>
          ) : (
            <HourlyBarsChart hours={allHours} />
          )}
        </div>
      </section>
    </div>
  );
}

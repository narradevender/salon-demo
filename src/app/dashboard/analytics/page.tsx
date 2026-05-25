import {
  DASHBOARD_SALON_ID,
  daysAgoIso,
  fetchAppointments,
  formatINR,
} from "@/lib/dashboard";

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

export default async function AnalyticsPage() {
  const fromIso = daysAgoIso(29); // last 30 days inclusive
  const appointments = await fetchAppointments(DASHBOARD_SALON_ID, { fromIso });

  const nonCancelled = appointments.filter((a) => a.status !== "cancelled");

  // Top services by booking count
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
  const topServicesMax = topServices[0]?.count || 1;

  // Revenue by day (last 14 days)
  const revenueDays: { day: string; revenue: number; count: number }[] = [];
  for (let offset = 13; offset >= 0; offset--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - offset);
    revenueDays.push({ day: d.toISOString().slice(0, 10), revenue: 0, count: 0 });
  }
  const revenueIndex = new Map(revenueDays.map((entry) => [entry.day, entry]));
  for (const appt of nonCancelled) {
    const key = dayKey(appt.scheduled_start);
    const bucket = revenueIndex.get(key);
    if (bucket) {
      bucket.revenue += Number(appt.price || 0);
      bucket.count += 1;
    }
  }
  const maxDailyRevenue = Math.max(...revenueDays.map((d) => d.revenue), 1);

  // Peak hours (by booking count)
  const hourCounts = new Array(24).fill(0) as number[];
  for (const appt of nonCancelled) {
    const hour = new Date(appt.scheduled_start).getHours();
    hourCounts[hour] += 1;
  }
  const maxHour = Math.max(...hourCounts, 1);
  const peakHourRows = hourCounts
    .map((count, hour) => ({ hour, count }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Source split (whatsapp vs web vs others)
  const sourceCounts = new Map<string, number>();
  for (const appt of nonCancelled) {
    sourceCounts.set(appt.source, (sourceCounts.get(appt.source) || 0) + 1);
  }
  const totalSources = [...sourceCounts.values()].reduce((sum, n) => sum + n, 0) || 1;
  const sourceRows = [...sourceCounts.entries()]
    .map(([source, count]) => ({
      source,
      count,
      percent: Math.round((count / totalSources) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  // Headline numbers
  const totalRevenue = nonCancelled.reduce((sum, a) => sum + Number(a.price || 0), 0);
  const totalBookings = nonCancelled.length;
  const cancelledCount = appointments.length - nonCancelled.length;
  const avgTicket = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

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
          { label: "Total bookings", value: totalBookings.toString() },
          { label: "Revenue (30d)", value: formatINR(totalRevenue) },
          { label: "Avg ticket", value: formatINR(avgTicket) },
          { label: "Cancellations", value: cancelledCount.toString() },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{card.label}</p>
            <p className="mt-4 text-3xl font-semibold text-white">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">Top services</h2>
          <p className="text-xs text-slate-400">By booking count</p>
          {topServices.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-400">
              No bookings yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {topServices.map((service) => (
                <li key={service.name}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium text-white">{service.name}</span>
                    <span className="text-xs text-slate-400">
                      {service.count} bookings • {formatINR(service.revenue)}
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${(service.count / topServicesMax) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">Booking sources</h2>
          <p className="text-xs text-slate-400">Where bookings come from</p>
          {sourceRows.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-400">
              No bookings yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {sourceRows.map((row) => (
                <li key={row.source}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium text-white capitalize">{row.source}</span>
                    <span className="text-xs text-slate-400">
                      {row.count} ({row.percent}%)
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-emerald-400"
                      style={{ width: `${row.percent}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-white">Revenue last 14 days</h2>
        <p className="text-xs text-slate-400">Daily revenue from confirmed bookings</p>
        <div className="mt-6 flex h-48 items-end gap-2">
          {revenueDays.map((entry) => {
            const heightPct = entry.revenue > 0 ? (entry.revenue / maxDailyRevenue) * 100 : 2;
            return (
              <div key={entry.day} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-amber-500/60 to-amber-300"
                  style={{ height: `${heightPct}%` }}
                  title={`${formatINR(entry.revenue)} (${entry.count} bookings)`}
                />
                <span className="text-[10px] text-slate-500">{shortDayLabel(entry.day)}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-white">Peak hours</h2>
        <p className="text-xs text-slate-400">When customers book most</p>
        {peakHourRows.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-400">
            No bookings yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {peakHourRows.map((row) => (
              <li key={row.hour}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium text-white">
                    {new Date(0, 0, 0, row.hour).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      hour12: true,
                    })}
                  </span>
                  <span className="text-xs text-slate-400">{row.count} bookings</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-sky-400"
                    style={{ width: `${(row.count / maxHour) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

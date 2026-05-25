import { supabaseService } from "@/lib/supabase-service";
import {
  DASHBOARD_SALON_ID,
  fetchAppointments,
  formatDateTime,
  formatINR,
  formatTime,
  startOfTodayIso,
  endOfTodayIso,
  statusBadgeClasses,
} from "@/lib/dashboard";

async function getOverviewStats() {
  const todayStart = startOfTodayIso();
  const todayEnd = endOfTodayIso();
  const nowIso = new Date().toISOString();

  const [todayBookings, upcoming, customers, revenueToday] = await Promise.all([
    supabaseService
      .from("appointments")
      .select("id,price,status", { count: "exact" })
      .eq("salon_id", DASHBOARD_SALON_ID)
      .gte("scheduled_start", todayStart)
      .lte("scheduled_start", todayEnd),
    supabaseService
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("salon_id", DASHBOARD_SALON_ID)
      .eq("status", "confirmed")
      .gte("scheduled_start", nowIso),
    supabaseService
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("salon_id", DASHBOARD_SALON_ID),
    supabaseService
      .from("appointments")
      .select("price")
      .eq("salon_id", DASHBOARD_SALON_ID)
      .eq("status", "confirmed")
      .gte("scheduled_start", todayStart)
      .lte("scheduled_start", todayEnd),
  ]);

  const todayRevenue = (revenueToday.data || []).reduce(
    (sum, row) => sum + Number(row.price || 0),
    0,
  );

  return {
    todayBookingsCount: todayBookings.count ?? 0,
    upcomingCount: upcoming.count ?? 0,
    customersCount: customers.count ?? 0,
    todayRevenue,
  };
}

export default async function DashboardOverviewPage() {
  const [stats, todaySchedule, recentBookings] = await Promise.all([
    getOverviewStats(),
    fetchAppointments(DASHBOARD_SALON_ID, {
      fromIso: startOfTodayIso(),
      toIso: endOfTodayIso(),
      limit: 20,
    }),
    fetchAppointments(DASHBOARD_SALON_ID, { limit: 5 }),
  ]);

  const todaySorted = [...todaySchedule].sort(
    (a, b) => new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime(),
  );

  const cards = [
    { label: "Bookings today", value: stats.todayBookingsCount.toString() },
    { label: "Upcoming appointments", value: stats.upcomingCount.toString() },
    { label: "Revenue today", value: formatINR(stats.todayRevenue) },
    { label: "Total customers", value: stats.customersCount.toString() },
  ];

  return (
    <div className="space-y-8">
      <header className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Owner dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Welcome back.</h1>
        <p className="mt-2 text-sm text-slate-300">Here&apos;s what&apos;s happening at your salon today.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur-xl"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{card.label}</p>
            <p className="mt-4 text-3xl font-semibold text-white">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur-xl xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Today&apos;s schedule</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
              {todaySorted.length} appointments
            </span>
          </div>
          {todaySorted.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-400">
              No appointments scheduled for today.
            </p>
          ) : (
            <ul className="divide-y divide-white/5">
              {todaySorted.map((appt) => (
                <li key={appt.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {appt.customer?.name ?? "Unknown"}
                      <span className="ml-2 text-slate-400">• {appt.service?.name ?? "Service"}</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatTime(appt.scheduled_start)} – {formatTime(appt.scheduled_end)}
                      {appt.customer?.phone ? ` • ${appt.customer.phone}` : ""}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${statusBadgeClasses(appt.status)}`}
                  >
                    {appt.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur-xl">
          <h2 className="text-xl font-semibold text-white">Recent bookings</h2>
          {recentBookings.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-400">
              No bookings yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {recentBookings.map((appt) => (
                <li key={appt.id} className="rounded-xl border border-white/5 bg-slate-950/40 p-3">
                  <p className="text-sm font-medium text-white">{appt.customer?.name ?? "Unknown"}</p>
                  <p className="mt-1 text-xs text-slate-400">{appt.service?.name ?? "Service"}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDateTime(appt.scheduled_start)}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-500">{formatINR(Number(appt.price))}</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusBadgeClasses(appt.status)}`}
                    >
                      {appt.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

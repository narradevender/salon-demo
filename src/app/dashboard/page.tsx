import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Salon Dashboard | Salon Demo",
};

export default async function DashboardPage() {
  const supabase = await createServerSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Owner dashboard</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">Welcome back.</h1>
            </div>
            <div className="rounded-full bg-slate-900/80 px-5 py-2 text-sm text-slate-300">Signed in as {session.user.email ?? "owner"}</div>
          </div>
        </header>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Bookings today", value: "12" },
            { label: "Upcoming appointments", value: "34" },
            { label: "Active services", value: "8" },
            { label: "New customers", value: "15" },
          ].map((card) => (
            <div key={card.label} className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{card.label}</p>
              <p className="mt-6 text-4xl font-semibold text-white">{card.value}</p>
            </div>
          ))}
        </div>
        <section className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-white">Recent bookings</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">A live appointment feed with booking details, statuses, and caller notes.</p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur-xl xl:col-span-2">
            <h2 className="text-xl font-semibold text-white">Availability</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">Manage service slots, block dates, and prevent double bookings across your team.</p>
          </div>
        </section>
      </div>
    </main>
  );
}

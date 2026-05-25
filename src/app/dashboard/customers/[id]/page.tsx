import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseService } from "@/lib/supabase-service";
import {
  DASHBOARD_SALON_ID,
  fetchAppointments,
  formatDateTime,
  formatINR,
  statusBadgeClasses,
} from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Customer | Salon Demo",
};

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: customer } = await supabaseService
    .from("customers")
    .select("id,name,phone,email,notes,created_at")
    .eq("id", id)
    .eq("salon_id", DASHBOARD_SALON_ID)
    .single();

  if (!customer) {
    notFound();
  }

  // Fetch this customer's appointments via the shared helper, then filter client-side
  const allAppointments = await fetchAppointments(DASHBOARD_SALON_ID, { limit: 500 });
  const appointments = allAppointments.filter((a) => a.customer?.id === customer.id);

  const validBookings = appointments.filter((a) => a.status !== "cancelled");
  const totalSpend = validBookings.reduce((sum, a) => sum + Number(a.price || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/customers" className="text-xs text-slate-400 hover:text-amber-300">
          ← All customers
        </Link>
      </div>

      <header className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Customer</p>
        <h1 className="mt-2 text-3xl font-semibold">{customer.name}</h1>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
          {customer.phone && <span>📞 {customer.phone}</span>}
          {customer.email && <span>✉️ {customer.email}</span>}
          <span>📅 Joined {new Date(customer.created_at).toLocaleDateString("en-IN")}</span>
        </div>
        {customer.notes && (
          <p className="mt-4 rounded-xl border border-white/10 bg-slate-950/60 p-3 text-sm text-slate-300">
            {customer.notes}
          </p>
        )}
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total bookings", value: validBookings.length.toString() },
          { label: "Total spend", value: formatINR(totalSpend) },
          {
            label: "Cancellations",
            value: (appointments.length - validBookings.length).toString(),
          },
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

      <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="border-b border-white/5 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Booking history</h2>
        </div>
        {appointments.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-400">No bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="px-6 py-3">Service</th>
                  <th className="px-6 py-3">When</th>
                  <th className="px-6 py-3">Source</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-white/5">
                    <td className="px-6 py-3 font-medium text-white">
                      {appt.service?.name ?? "—"}
                    </td>
                    <td className="px-6 py-3 text-slate-300">
                      {formatDateTime(appt.scheduled_start)}
                    </td>
                    <td className="px-6 py-3 text-slate-400">{appt.source}</td>
                    <td className="px-6 py-3">{formatINR(Number(appt.price))}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadgeClasses(appt.status)}`}
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-400">{appt.booking_reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

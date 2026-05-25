import {
  DASHBOARD_SALON_ID,
  fetchAppointments,
  fetchServices,
  formatDateTime,
  formatINR,
  statusBadgeClasses,
} from "@/lib/dashboard";
import BookingsFilters from "@/components/dashboard/BookingsFilters";
import CancelBookingButton from "@/components/dashboard/CancelBookingButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bookings | Salon Demo",
};

function toIsoStart(date: string) {
  if (!date) return undefined;
  return new Date(`${date}T00:00:00`).toISOString();
}

function toIsoEnd(date: string) {
  if (!date) return undefined;
  return new Date(`${date}T23:59:59.999`).toISOString();
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; service?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "all";
  const serviceId = params.service ?? "all";
  const from = params.from ?? "";
  const to = params.to ?? "";

  const [services, appointments] = await Promise.all([
    fetchServices(DASHBOARD_SALON_ID),
    fetchAppointments(DASHBOARD_SALON_ID, {
      status,
      serviceId,
      fromIso: toIsoStart(from),
      toIso: toIsoEnd(to),
    }),
  ]);

  return (
    <div className="space-y-6">
      <header className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Bookings</p>
        <h1 className="mt-2 text-2xl font-semibold">All appointments</h1>
        <p className="mt-1 text-sm text-slate-300">
          Filter by status, service, or date range. Cancel a booking to free up the slot.
        </p>
      </header>

      <BookingsFilters
        services={services}
        current={{ status, serviceId, from, to }}
      />

      <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Appointments</h2>
          <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
            {appointments.length} results
          </span>
        </div>
        {appointments.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-400">
            No appointments match these filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Service</th>
                  <th className="px-6 py-3">When</th>
                  <th className="px-6 py-3">Source</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Reference</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-white/5">
                    <td className="px-6 py-3">
                      <p className="font-medium text-white">{appt.customer?.name ?? "—"}</p>
                      {appt.customer?.phone && (
                        <p className="text-xs text-slate-400">{appt.customer.phone}</p>
                      )}
                    </td>
                    <td className="px-6 py-3">{appt.service?.name ?? "—"}</td>
                    <td className="px-6 py-3 text-slate-300">{formatDateTime(appt.scheduled_start)}</td>
                    <td className="px-6 py-3 text-slate-400">{appt.source}</td>
                    <td className="px-6 py-3 text-slate-200">{formatINR(Number(appt.price))}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadgeClasses(appt.status)}`}
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-400">{appt.booking_reference}</td>
                    <td className="px-6 py-3 text-right">
                      {appt.status === "confirmed" ? (
                        <CancelBookingButton appointmentId={appt.id} />
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
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

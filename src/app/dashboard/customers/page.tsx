import Link from "next/link";
import { supabaseService } from "@/lib/supabase-service";
import { DASHBOARD_SALON_ID, formatINR } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Customers | Salon Demo",
};

type CustomerWithBookings = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  created_at: string;
  bookingCount: number;
  totalSpend: number;
  lastVisit: string | null;
};

type CustomerWithAppointmentsRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  created_at: string;
  appointments: { price: number | null; status: string; scheduled_start: string }[] | null;
};

async function getCustomers(salonId: string, search: string): Promise<CustomerWithBookings[]> {
  let query = supabaseService
    .from("customers")
    .select(`
      id,
      name,
      phone,
      email,
      created_at,
      appointments:appointments(price, status, scheduled_start)
    `)
    .eq("salon_id", salonId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getCustomers error:", error);
    return [];
  }

  const rows = (data || []) as unknown as CustomerWithAppointmentsRow[];

  return rows.map((row) => {
    const appointments = row.appointments || [];
    const valid = appointments.filter((a) => a.status !== "cancelled");
    const totalSpend = valid.reduce((sum, a) => sum + Number(a.price || 0), 0);
    const lastVisit =
      valid.length > 0
        ? [...valid].sort(
            (a, b) =>
              new Date(b.scheduled_start).getTime() - new Date(a.scheduled_start).getTime(),
          )[0].scheduled_start
        : null;

    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      email: row.email,
      created_at: row.created_at,
      bookingCount: valid.length,
      totalSpend,
      lastVisit,
    };
  });
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const search = (params.q ?? "").trim();
  const customers = await getCustomers(DASHBOARD_SALON_ID, search);

  return (
    <div className="space-y-6">
      <header className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Customers</p>
        <h1 className="mt-2 text-2xl font-semibold">All customers</h1>
        <p className="mt-1 text-sm text-slate-300">
          Manage customer details and view their booking history.
        </p>
      </header>

      <form className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          name="q"
          defaultValue={search}
          placeholder="Search by name, phone, or email…"
          className="flex-1 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-300"
        />
        <button
          type="submit"
          className="rounded-xl border border-amber-300/40 bg-amber-400/15 px-5 py-2.5 text-sm font-medium text-amber-200 hover:bg-amber-400/25"
        >
          Search
        </button>
      </form>

      <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">{customers.length} customers</h2>
        </div>
        {customers.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-400">
            {search ? "No customers match your search." : "No customers yet."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Bookings</th>
                  <th className="px-6 py-3">Total spend</th>
                  <th className="px-6 py-3">Last visit</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-white/5">
                    <td className="px-6 py-3">
                      <p className="font-medium text-white">{customer.name}</p>
                      {customer.email && (
                        <p className="text-xs text-slate-400">{customer.email}</p>
                      )}
                    </td>
                    <td className="px-6 py-3 text-slate-300">{customer.phone ?? "—"}</td>
                    <td className="px-6 py-3">{customer.bookingCount}</td>
                    <td className="px-6 py-3">{formatINR(customer.totalSpend)}</td>
                    <td className="px-6 py-3 text-slate-400">
                      {customer.lastVisit
                        ? new Date(customer.lastVisit).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link
                        href={`/dashboard/customers/${customer.id}`}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-white/10"
                      >
                        View
                      </Link>
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

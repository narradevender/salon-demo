import { supabaseService } from "@/lib/supabase-service";

export const DASHBOARD_SALON_ID = process.env.NEXT_PUBLIC_SALON_ID || "";

export type AppointmentRow = {
  id: string;
  booking_reference: string;
  status: string;
  scheduled_start: string;
  scheduled_end: string;
  price: number;
  source: string;
  notes: string | null;
  created_at: string;
  service: { id: string; name: string } | null;
  customer: { id: string; name: string; phone: string | null; email: string | null } | null;
};

const APPOINTMENT_SELECT = `
  id,
  booking_reference,
  status,
  scheduled_start,
  scheduled_end,
  price,
  source,
  notes,
  created_at,
  service:services(id,name),
  customer:customers(id,name,phone,email)
`;

export type AppointmentFilters = {
  status?: string;
  serviceId?: string;
  fromIso?: string;
  toIso?: string;
  limit?: number;
};

export async function fetchAppointments(salonId: string, filters: AppointmentFilters = {}) {
  let query = supabaseService
    .from("appointments")
    .select(APPOINTMENT_SELECT)
    .eq("salon_id", salonId)
    .order("scheduled_start", { ascending: false });

  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);
  if (filters.serviceId && filters.serviceId !== "all") query = query.eq("service_id", filters.serviceId);
  if (filters.fromIso) query = query.gte("scheduled_start", filters.fromIso);
  if (filters.toIso) query = query.lte("scheduled_start", filters.toIso);
  if (filters.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) {
    console.error("fetchAppointments error:", error);
    return [];
  }
  return (data || []) as unknown as AppointmentRow[];
}

export async function fetchServices(salonId: string) {
  const { data } = await supabaseService
    .from("services")
    .select("id,name,price,duration_minutes,is_active")
    .eq("salon_id", salonId)
    .order("name", { ascending: true });
  return data || [];
}

export function startOfTodayIso() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

export function endOfTodayIso() {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
}

export function daysAgoIso(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatINR(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function statusBadgeClasses(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    case "cancelled":
      return "bg-rose-500/15 text-rose-300 border-rose-500/30";
    case "completed":
      return "bg-sky-500/15 text-sky-300 border-sky-500/30";
    case "no_show":
      return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    default:
      return "bg-slate-500/15 text-slate-300 border-slate-500/30";
  }
}

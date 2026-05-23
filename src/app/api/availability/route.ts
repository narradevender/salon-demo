import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase-service";
import { availabilityQuerySchema } from "@/lib/validators";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());
  const validation = availabilityQuerySchema.safeParse(searchParams);
  if (!validation.success) {
    return NextResponse.json({ error: "Invalid availability request." }, { status: 400 });
  }

  const { salonId, serviceId, date } = validation.data;
  const startOfDay = `${date}T00:00:00Z`;
  const endOfDay = `${date}T23:59:59Z`;

  const { data, error } = await supabaseService
    .from("availability_slots")
    .select("id,start_time,end_time,is_blocked")
    .eq("salon_id", salonId)
    .eq("service_id", serviceId)
    .gte("start_time", startOfDay)
    .lte("end_time", endOfDay)
    .order("start_time", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ slots: data ?? [] });
}

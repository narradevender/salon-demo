import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase-service";
import { bookingPayloadSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const validation = bookingPayloadSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: "Invalid booking payload." }, { status: 400 });
  }

  const { salonId, serviceId, name, email, phone, slotId, notes } = validation.data;
  const slotCheck = await supabaseService
    .from("availability_slots")
    .select("id,is_blocked,start_time,end_time")
    .eq("id", slotId)
    .eq("salon_id", salonId)
    .single();

  if (slotCheck.error || !slotCheck.data || slotCheck.data.is_blocked) {
    return NextResponse.json({ error: "Selected slot is unavailable." }, { status: 409 });
  }

  const existingAppointment = await supabaseService
    .from("appointments")
    .select("id")
    .eq("slot_id", slotId)
    .neq("status", "cancelled")
    .limit(1)
    .single();

  if (existingAppointment.data) {
    return NextResponse.json({ error: "This slot already has a booking." }, { status: 409 });
  }

  const { data: customer, error: customerError } = await supabaseService
    .from("customers")
    .insert({
      salon_id: salonId,
      name,
      email,
      phone,
      notes: notes ?? null,
    })
    .select("id")
    .single();

  if (customerError) {
    return NextResponse.json({ error: customerError.message }, { status: 500 });
  }

  const { data: appointment, error: appointmentError } = await supabaseService
    .from("appointments")
    .insert({
      salon_id: salonId,
      service_id: serviceId,
      customer_id: customer.id,
      slot_id: slotId,
      booking_reference: `SALON-${Date.now()}`,
      status: "confirmed",
      scheduled_start: slotCheck.data.start_time,
      scheduled_end: slotCheck.data.end_time,
      price: 0,
      notes: notes ?? null,
      source: "web",
    })
    .select("id,booking_reference")
    .single();

  if (appointmentError || !appointment) {
    return NextResponse.json({ error: appointmentError?.message ?? "Unable to create booking." }, { status: 500 });
  }

  return NextResponse.json({ appointment: appointment });
}

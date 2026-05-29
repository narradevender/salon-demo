import { NextResponse } from "next/server";
import { availabilityQuerySchema } from "@/lib/validators";
import { getAvailableSlots } from "@/lib/whatsapp";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());
  const validation = availabilityQuerySchema.safeParse(searchParams);
  if (!validation.success) {
    return NextResponse.json({ error: "Invalid availability request." }, { status: 400 });
  }

  const { salonId, serviceId, date } = validation.data;

  try {
    const slots = await getAvailableSlots(salonId, serviceId, date);
    return NextResponse.json({ slots });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Availability lookup failed." },
      { status: 500 },
    );
  }
}

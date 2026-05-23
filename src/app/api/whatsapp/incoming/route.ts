import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase-service";
import { sendWhatsAppMessage, notifyOwner, getAvailableSlots, formatTimeRange, formatDate } from "@/lib/whatsapp";

const META_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;
const SALON_ID = process.env.NEXT_PUBLIC_SALON_ID || ""; // Default salon for demo
const COFFEE_WEBHOOK_URL = process.env.COFFEE_WEBHOOK_URL;
const SALON_TRIGGER = "#salon";
const SALON_SESSION_TTL_MS = 30 * 60 * 1000;
const salonSessions = new Map<string, number>();

type SalonService = {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
};

type AvailableSlot = {
  id: string;
  start_time: string;
  end_time: string;
  is_blocked?: boolean;
};

type WhatsAppWebhookBody = {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: Array<{
          from: string;
          type: string;
          text?: {
            body?: string;
          };
        }>;
      };
    }>;
  }>;
};

function getIncomingMessage(body: WhatsAppWebhookBody | null) {
  return body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
}

function getMessageText(message: ReturnType<typeof getIncomingMessage>) {
  return message?.type === "text" ? (message.text?.body || "").trim() : "";
}

function hasActiveSalonSession(customerPhone: string) {
  const expiresAt = salonSessions.get(customerPhone);

  if (!expiresAt) return false;
  if (expiresAt < Date.now()) {
    salonSessions.delete(customerPhone);
    return false;
  }

  return true;
}

function rememberSalonSession(customerPhone: string) {
  salonSessions.set(customerPhone, Date.now() + SALON_SESSION_TTL_MS);
}

function isSalonMessage(customerPhone: string, messageText: string) {
  const normalizedText = messageText.toLowerCase();

  return normalizedText.includes(SALON_TRIGGER) || hasActiveSalonSession(customerPhone);
}

async function forwardToCoffeeWebhook(body: WhatsAppWebhookBody) {
  if (!COFFEE_WEBHOOK_URL) {
    console.warn("Coffee webhook URL missing — non-salon WhatsApp message ignored");
    return;
  }

  try {
    const response = await fetch(COFFEE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error("Coffee webhook forward failed:", await response.text());
    }
  } catch (error) {
    console.error("Coffee webhook forward error:", error);
  }
}

async function getSalonServices(salonId: string) {
  const { data } = await supabaseService
    .from("services")
    .select("id,name,price,duration_minutes")
    .eq("salon_id", salonId)
    .eq("is_active", true)
    .order("price", { ascending: true });
  return data || [];
}

function buildServicesMenu(services: SalonService[]): string {
  const lines = [
    "👋 Welcome to our salon!",
    "Here are our services:",
    "",
    ...services.map((s, idx) => `${idx + 1}️⃣ ${s.name} - ₹${s.price} (${s.duration_minutes} mins)`),
    "",
    "Reply with a number (1-${services.length}) to see available slots.",
  ];
  return lines.join("\n");
}

function buildSlotsMenu(service: SalonService, slotsGrouped: Record<string, AvailableSlot[]>): string {
  const lines = [
    `✨ *${service.name}* selected`,
    `💰 ₹${service.price} | ⏱️ ${service.duration_minutes} mins`,
    "",
    "📅 Available slots:",
  ];

  let slotIndex = 1;
  Object.entries(slotsGrouped).forEach(([dayLabel, daySlots]) => {
    lines.push("");
    lines.push(`🔵 ${dayLabel}`);
    daySlots.forEach((slot) => {
      const timeRange = formatTimeRange(slot.start_time, slot.end_time);
      lines.push(`  ${slotIndex}. ${timeRange} ✓`);
      slotIndex++;
    });
  });

  lines.push("");
  lines.push("Reply with slot number to book.");
  return lines.join("\n");
}

function getTodayTomorrowDayAfter(): { today: string; tomorrow: string; dayAfter: string } {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  return {
    today: today.toISOString().slice(0, 10),
    tomorrow: tomorrow.toISOString().slice(0, 10),
    dayAfter: dayAfter.toISOString().slice(0, 10),
  };
}

async function groupSlotsByDay(salonId: string, serviceId: string) {
  const { today, tomorrow, dayAfter } = getTodayTomorrowDayAfter();

  const [todaySlots, tomorrowSlots, dayAfterSlots] = await Promise.all([
    getAvailableSlots(salonId, serviceId, today),
    getAvailableSlots(salonId, serviceId, tomorrow),
    getAvailableSlots(salonId, serviceId, dayAfter),
  ]);

  const groupedWithLabels: Record<string, AvailableSlot[]> = {};

  if (todaySlots.length > 0) {
    groupedWithLabels[`Today (${formatDate(today)})`] = todaySlots;
  }
  if (tomorrowSlots.length > 0) {
    groupedWithLabels[`Tomorrow (${formatDate(tomorrow)})`] = tomorrowSlots;
  }
  if (dayAfterSlots.length > 0) {
    groupedWithLabels[`Day After (${formatDate(dayAfter)})`] = dayAfterSlots;
  }

  return { grouped: groupedWithLabels, allSlots: [todaySlots, tomorrowSlots, dayAfterSlots].flat() };
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === META_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Webhook verification failed" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as WhatsAppWebhookBody | null;

  if (!body || !body.entry) {
    return NextResponse.json({ status: "ok" });
  }

  const message = getIncomingMessage(body);

  if (!message) {
    return NextResponse.json({ status: "ok" });
  }

  const customerPhone = message.from;
  const rawMessageText = getMessageText(message);

  if (!isSalonMessage(customerPhone, rawMessageText)) {
    await forwardToCoffeeWebhook(body);
    return NextResponse.json({ status: "ok" });
  }

  rememberSalonSession(customerPhone);

  const messageText = rawMessageText.toLowerCase().replace(SALON_TRIGGER, "").trim();

  const services = await getSalonServices(SALON_ID);

  // Parse message to determine action
  const serviceMatch = messageText.match(/^([1-9])\d*$/);
  const isServiceNumber = serviceMatch && parseInt(serviceMatch[1]) <= services.length;

  // Simple stateless flow based on message content
  // FLOW: Services Menu (default/greeting)
  if (!isServiceNumber && !messageText.includes("@")) {
    const menu = buildServicesMenu(services);
    await sendWhatsAppMessage({ recipientPhone: customerPhone, message: menu });
    return NextResponse.json({ status: "ok" });
  }

  // FLOW: Slots Menu (after service selection)
  if (isServiceNumber) {
    const selectedServiceIdx = parseInt(messageText) - 1;
    const selectedService = services[selectedServiceIdx];

    const { grouped, allSlots } = await groupSlotsByDay(SALON_ID, selectedService.id);

    if (allSlots.length === 0) {
      await sendWhatsAppMessage({
        recipientPhone: customerPhone,
        message: "❌ No slots available. Please try another service or call us.",
      });
      return NextResponse.json({ status: "ok" });
    }

    const slotString = allSlots.map((s) => s.id).join("|");
    const storeResponse = await sendWhatsAppMessage({
      recipientPhone: customerPhone,
      message: `Storing: ${selectedServiceIdx}|${slotString}|${selectedService.id}`,
    });

    if (!storeResponse) {
      console.log("Using message pattern for slot tracking");
    }

    const menu = buildSlotsMenu(selectedService, grouped);
    await sendWhatsAppMessage({ recipientPhone: customerPhone, message: menu });
    return NextResponse.json({ status: "ok" });
  }

  // FLOW: Create Booking (text message = customer name)
  const isTextMessage = messageText && messageText.length > 2 && messageText.length < 100;

  if (isTextMessage) {
    // For demo: create a booking with the provided name
    // In production, you'd track which service/slot was selected via stateful session
    // Get the first available service and next available slot for demo
    if (services.length === 0) {
      await sendWhatsAppMessage({
        recipientPhone: customerPhone,
        message: "❌ No services available. Please try again later.",
      });
      return NextResponse.json({ status: "ok" });
    }

    const defaultService = services[0];
    const { allSlots } = await groupSlotsByDay(SALON_ID, defaultService.id);

    if (allSlots.length === 0) {
      await sendWhatsAppMessage({
        recipientPhone: customerPhone,
        message: "❌ No slots available. Please try again later or call us.",
      });
      return NextResponse.json({ status: "ok" });
    }

    const selectedSlot = allSlots[0];
    const customerName = messageText.charAt(0).toUpperCase() + messageText.slice(1);

    // Verify slot is still available
    const { data: slotData } = await supabaseService
      .from("availability_slots")
      .select("id,start_time,end_time,is_blocked")
      .eq("id", selectedSlot.id)
      .eq("is_blocked", false)
      .single();

    if (!slotData) {
      await sendWhatsAppMessage({
        recipientPhone: customerPhone,
        message: "❌ Selected slot is no longer available. Please select another.",
      });
      return NextResponse.json({ status: "ok" });
    }

    // Create customer
    const { data: customerData, error: customerError } = await supabaseService
      .from("customers")
      .insert({
        salon_id: SALON_ID,
        name: customerName,
        phone: customerPhone,
      })
      .select("id")
      .single();

    if (customerError || !customerData) {
      console.error("Customer creation error:", customerError);
      await sendWhatsAppMessage({
        recipientPhone: customerPhone,
        message: "❌ Booking failed. Please try again.",
      });
      return NextResponse.json({ status: "ok" });
    }

    // Create booking
    const bookingRef = `SALON-${Date.now()}`;
    const { data: appointmentData, error: appointmentError } = await supabaseService
      .from("appointments")
      .insert({
        salon_id: SALON_ID,
        service_id: defaultService.id,
        customer_id: customerData.id,
        slot_id: selectedSlot.id,
        booking_reference: bookingRef,
        status: "confirmed",
        scheduled_start: slotData.start_time,
        scheduled_end: slotData.end_time,
        price: defaultService.price,
        source: "whatsapp",
      })
      .select("id")
      .single();

    if (appointmentError || !appointmentData) {
      console.error("Appointment creation error:", appointmentError);
      await sendWhatsAppMessage({
        recipientPhone: customerPhone,
        message: "❌ Booking failed. Please try again.",
      });
      return NextResponse.json({ status: "ok" });
    }
    // Send confirmation to customer
    const confirmationMsg = [
      "✅ Booking Confirmed!",
      `👤 Name: ${customerName}`,
      `💇 Service: ${defaultService.name}`,
      `📅 Date: ${formatDate(slotData.start_time)}`,
      `🕐 Time: ${formatTimeRange(slotData.start_time, slotData.end_time)}`,
      `💰 Amount: ₹${defaultService.price}`,
      `📋 Reference: ${bookingRef}`,
      "",
      "Thank you! Our team will call you shortly to confirm.",
    ].join("\n");

    await sendWhatsAppMessage({ recipientPhone: customerPhone, message: confirmationMsg });

    // Notify owner
    await notifyOwner({
      customerName,
      customerPhone,
      serviceName: defaultService.name,
      slotDate: formatDate(slotData.start_time),
      slotStartTime: new Date(slotData.start_time).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      slotEndTime: new Date(slotData.end_time).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      price: defaultService.price,
      bookingReference: bookingRef,
    });

    return NextResponse.json({ status: "ok" });
  }

  return NextResponse.json({ status: "ok" });
}

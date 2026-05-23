import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase-service";
import {
  sendWhatsAppImageMessage,
  sendWhatsAppListMessage,
  sendWhatsAppMessage,
  notifyOwner,
  getAvailableSlots,
  formatTimeRange,
  formatDate,
} from "@/lib/whatsapp";

const META_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;
const SALON_ID = process.env.NEXT_PUBLIC_SALON_ID || ""; // Default salon for demo
const COFFEE_WEBHOOK_URL = process.env.COFFEE_WEBHOOK_URL;
const SALON_TRIGGER = "#salon";
const SALON_SESSION_TTL_MS = 30 * 60 * 1000;
const salonSessions = new Map<string, number>();
const bookingSessions = new Map<string, BookingSession>();

const serviceImages: Record<string, string> = {
  "girl hair cut": "https://t3.ftcdn.net/jpg/16/27/26/74/240_F_1627267426_9e78jte19XWwJXBuesYeGOGMcyF2PVEG.jpg",
  "girls hair styling": "https://t4.ftcdn.net/jpg/14/71/76/33/240_F_1471763388_zVwckuVd3xCDG0x4vhFhL7m5PR11L1dl.jpg",
  "boys hair cut": "https://t4.ftcdn.net/jpg/03/27/37/23/240_F_327372387_nDiUJ8UxnzYVwUsT3fHmUImZOL7jDZ9r.jpg",
  "boys facial": "https://t3.ftcdn.net/jpg/02/40/00/52/240_F_240005231_D7yUGbqeG2MZOICkZDYiQdZUUm1sQp6T.jpg",
  "boys hair wash": "https://t4.ftcdn.net/jpg/02/39/85/39/240_F_239853924_ZMGGCae8K7yQtxpTyxad3oun8JiGjFW9.jpg",
};

type SalonService = {
  id: string;
  name: string;
  description: string | null;
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
          interactive?: {
            type?: string;
            list_reply?: {
              id: string;
              title?: string;
              description?: string;
            };
            button_reply?: {
              id: string;
              title?: string;
            };
          };
        }>;
      };
    }>;
  }>;
};

type BookingSession = {
  selectedService?: SalonService;
  selectedSlot?: AvailableSlot;
  awaitingName?: boolean;
  expiresAt: number;
};

function getIncomingMessage(body: WhatsAppWebhookBody | null) {
  return body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
}

function getMessageText(message: ReturnType<typeof getIncomingMessage>) {
  return message?.type === "text" ? (message.text?.body || "").trim() : "";
}

function getInteractiveReplyId(message: ReturnType<typeof getIncomingMessage>) {
  return message?.interactive?.list_reply?.id ?? message?.interactive?.button_reply?.id ?? "";
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

function getBookingSession(customerPhone: string) {
  const session = bookingSessions.get(customerPhone);

  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    bookingSessions.delete(customerPhone);
    return null;
  }

  return session;
}

function rememberBookingSession(customerPhone: string, session: Omit<BookingSession, "expiresAt">) {
  bookingSessions.set(customerPhone, {
    ...session,
    expiresAt: Date.now() + SALON_SESSION_TTL_MS,
  });
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
    .select("id,name,description,price,duration_minutes")
    .eq("salon_id", salonId)
    .eq("is_active", true)
    .order("price", { ascending: true });
  return data || [];
}

function serviceCaption(service: SalonService) {
  return [
    `*${service.name}*`,
    `₹${service.price} | ${service.duration_minutes} mins`,
    service.description,
  ]
    .filter(Boolean)
    .join("\n");
}

async function sendServicesMenu(recipientPhone: string, services: SalonService[]) {
  const servicesWithImages = services.slice(0, 5);

  for (const service of servicesWithImages) {
    const imageUrl = serviceImages[service.name.toLowerCase()];

    if (!imageUrl) continue;

    await sendWhatsAppImageMessage({
      recipientPhone,
      imageUrl,
      caption: serviceCaption(service),
    });
  }

  await sendWhatsAppListMessage({
    recipientPhone,
    header: "Salon Services",
    body: "Choose a service to view available appointment slots.",
    buttonText: "View services",
    sections: [
      {
        title: "Available services",
        rows: services.map((service) => ({
          id: `service_${service.id}`,
          title: service.name.slice(0, 24),
          description: `₹${service.price} • ${service.duration_minutes} mins`,
        })),
      },
    ],
  });
}

async function sendSlotsMenu(recipientPhone: string, service: SalonService, slotsGrouped: Record<string, AvailableSlot[]>) {
  let remainingRows = 10;
  const sections = Object.entries(slotsGrouped)
    .map(([dayLabel, daySlots]) => {
      const rows = daySlots.slice(0, remainingRows).map((slot) => ({
        id: `slot_${slot.id}`,
        title: formatTimeRange(slot.start_time, slot.end_time).slice(0, 24),
        description: "Available",
      }));

      remainingRows -= rows.length;

      return {
        title: dayLabel.slice(0, 24),
        rows,
      };
    })
    .filter((section) => section.rows.length > 0);

  await sendWhatsAppListMessage({
    recipientPhone,
    header: service.name.slice(0, 60),
    body: `₹${service.price} • ${service.duration_minutes} mins\nChoose a slot to continue booking.`,
    buttonText: "View slots",
    sections,
  });
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

  const replyId = getInteractiveReplyId(message);
  const messageText = rawMessageText.toLowerCase().replace(SALON_TRIGGER, "").trim();

  const services = await getSalonServices(SALON_ID);

  if (replyId.startsWith("service_")) {
    const selectedService = services.find((service) => service.id === replyId.replace("service_", ""));

    if (!selectedService) {
      await sendWhatsAppMessage({
        recipientPhone: customerPhone,
        message: "That service is no longer available. Please choose again.",
      });
      await sendServicesMenu(customerPhone, services);
      return NextResponse.json({ status: "ok" });
    }

    const { grouped, allSlots } = await groupSlotsByDay(SALON_ID, selectedService.id);

    if (allSlots.length === 0) {
      await sendWhatsAppMessage({
        recipientPhone: customerPhone,
        message: "No slots are available for this service right now. Please choose another service.",
      });
      await sendServicesMenu(customerPhone, services);
      return NextResponse.json({ status: "ok" });
    }

    rememberBookingSession(customerPhone, { selectedService });
    await sendSlotsMenu(customerPhone, selectedService, grouped);
    return NextResponse.json({ status: "ok" });
  }

  if (replyId.startsWith("slot_")) {
    const bookingSession = getBookingSession(customerPhone);
    const selectedService = bookingSession?.selectedService;
    const selectedSlotId = replyId.replace("slot_", "");

    if (!selectedService) {
      await sendWhatsAppMessage({
        recipientPhone: customerPhone,
        message: "Please choose a service first.",
      });
      await sendServicesMenu(customerPhone, services);
      return NextResponse.json({ status: "ok" });
    }

    const { data: slotData } = await supabaseService
      .from("availability_slots")
      .select("id,start_time,end_time,is_blocked")
      .eq("id", selectedSlotId)
      .eq("salon_id", SALON_ID)
      .eq("service_id", selectedService.id)
      .eq("is_blocked", false)
      .single();

    if (!slotData) {
      await sendWhatsAppMessage({
        recipientPhone: customerPhone,
        message: "That slot is no longer available. Please choose another slot.",
      });
      const { grouped } = await groupSlotsByDay(SALON_ID, selectedService.id);
      await sendSlotsMenu(customerPhone, selectedService, grouped);
      return NextResponse.json({ status: "ok" });
    }

    rememberBookingSession(customerPhone, {
      selectedService,
      selectedSlot: slotData,
      awaitingName: true,
    });

    await sendWhatsAppMessage({
      recipientPhone: customerPhone,
      message: `Great. ${selectedService.name} is available on ${formatDate(slotData.start_time)} at ${formatTimeRange(slotData.start_time, slotData.end_time)}.\n\nPlease reply with your name to confirm the booking.`,
    });
    return NextResponse.json({ status: "ok" });
  }

  if (!messageText || ["hi", "hello", "menu", "services", "book", "booking"].some((word) => messageText.includes(word))) {
    await sendServicesMenu(customerPhone, services);
    return NextResponse.json({ status: "ok" });
  }

  const bookingSession = getBookingSession(customerPhone);
  const isCustomerName =
    bookingSession?.awaitingName &&
    messageText &&
    messageText.length > 1 &&
    messageText.length < 80 &&
    !messageText.includes("@");

  if (isCustomerName && bookingSession.selectedService && bookingSession.selectedSlot) {
    const selectedService = bookingSession.selectedService;
    const selectedSlot = bookingSession.selectedSlot;
    const customerName = rawMessageText.trim();

    const { data: slotData } = await supabaseService
      .from("availability_slots")
      .select("id,start_time,end_time,is_blocked")
      .eq("id", selectedSlot.id)
      .eq("is_blocked", false)
      .single();

    if (!slotData) {
      await sendWhatsAppMessage({
        recipientPhone: customerPhone,
        message: "Selected slot is no longer available. Please choose another slot.",
      });
      const { grouped } = await groupSlotsByDay(SALON_ID, selectedService.id);
      await sendSlotsMenu(customerPhone, selectedService, grouped);
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
        message: "Booking failed. Please try again.",
      });
      return NextResponse.json({ status: "ok" });
    }

    // Create booking
    const bookingRef = `SALON-${Date.now()}`;
    const { data: appointmentData, error: appointmentError } = await supabaseService
      .from("appointments")
      .insert({
        salon_id: SALON_ID,
        service_id: selectedService.id,
        customer_id: customerData.id,
        slot_id: selectedSlot.id,
        booking_reference: bookingRef,
        status: "confirmed",
        scheduled_start: slotData.start_time,
        scheduled_end: slotData.end_time,
        price: selectedService.price,
        source: "whatsapp",
      })
      .select("id")
      .single();

    if (appointmentError || !appointmentData) {
      console.error("Appointment creation error:", appointmentError);
      await sendWhatsAppMessage({
        recipientPhone: customerPhone,
        message: "Booking failed. Please try again.",
      });
      return NextResponse.json({ status: "ok" });
    }
    // Send confirmation to customer
    const confirmationMsg = [
      "Booking confirmed!",
      `Name: ${customerName}`,
      `Service: ${selectedService.name}`,
      `Date: ${formatDate(slotData.start_time)}`,
      `Time: ${formatTimeRange(slotData.start_time, slotData.end_time)}`,
      `Amount: ₹${selectedService.price}`,
      `Reference: ${bookingRef}`,
      "",
      "Thank you! Our team will call you shortly to confirm.",
    ].join("\n");

    await sendWhatsAppMessage({ recipientPhone: customerPhone, message: confirmationMsg });

    // Notify owner
    await notifyOwner({
      customerName,
      customerPhone,
      serviceName: selectedService.name,
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
      price: selectedService.price,
      bookingReference: bookingRef,
    });

    bookingSessions.delete(customerPhone);
    return NextResponse.json({ status: "ok" });
  }

  await sendWhatsAppMessage({
    recipientPhone: customerPhone,
    message: "Please use the menu button to choose a service or type 'services' to start again.",
  });

  return NextResponse.json({ status: "ok" });
}

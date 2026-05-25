import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase-service";
import {
  sendWhatsAppButtonMessage,
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

type BookingStage =
  | "selecting_day"
  | "selecting_slot"
  | "awaiting_name"
  | "awaiting_confirmation";

type BookingSession = {
  selectedService?: SalonService;
  selectedDate?: string; // YYYY-MM-DD
  selectedSlot?: AvailableSlot;
  customerName?: string;
  stage?: BookingStage;
  expiresAt: number;
};

const DAY_KEYS = ["today", "tomorrow", "dayafter"] as const;
type DayKey = (typeof DAY_KEYS)[number];

const DAY_LABELS: Record<DayKey, string> = {
  today: "Today",
  tomorrow: "Tomorrow",
  dayafter: "Day After",
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

function isSalonReplyId(replyId: string) {
  return (
    replyId.startsWith("service_") ||
    replyId.startsWith("slot_") ||
    replyId.startsWith("day_") ||
    replyId.startsWith("confirm_")
  );
}

function isSalonMessage(customerPhone: string, messageText: string, replyId: string) {
  const normalizedText = messageText.toLowerCase();

  if (normalizedText.includes(SALON_TRIGGER)) return true;
  if (isSalonReplyId(replyId)) return true;
  if (hasActiveSalonSession(customerPhone)) return true;
  // If user has a booking session in progress, keep them in the salon flow
  if (getBookingSession(customerPhone)) return true;
  return false;
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
  return (data || []) as SalonService[];
}

async function getServiceById(salonId: string, serviceId: string) {
  const { data } = await supabaseService
    .from("services")
    .select("id,name,description,price,duration_minutes")
    .eq("id", serviceId)
    .eq("salon_id", salonId)
    .eq("is_active", true)
    .single();
  return (data as SalonService) || null;
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

function dateKeyForOffset(offsetDays: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function dateForDayKey(dayKey: DayKey) {
  const offsetByDayKey: Record<DayKey, number> = { today: 0, tomorrow: 1, dayafter: 2 };
  return dateKeyForOffset(offsetByDayKey[dayKey]);
}

async function sendDayPicker(recipientPhone: string, service: SalonService) {
  await sendWhatsAppButtonMessage({
    recipientPhone,
    header: service.name.slice(0, 60),
    body: `₹${service.price} • ${service.duration_minutes} mins\n\nWhich day would you like to book?`,
    buttons: DAY_KEYS.map((dayKey) => ({
      id: `day_${dayKey}`,
      title: `${DAY_LABELS[dayKey]} (${formatDate(dateForDayKey(dayKey))})`,
    })),
  });
}

async function sendSlotsForDay(
  recipientPhone: string,
  service: SalonService,
  dayKey: DayKey,
  slots: AvailableSlot[],
) {
  if (slots.length === 0) {
    await sendWhatsAppMessage({
      recipientPhone,
      message: `No slots are available for ${DAY_LABELS[dayKey]}. Please pick another day.`,
    });
    await sendDayPicker(recipientPhone, service);
    return;
  }

  await sendWhatsAppListMessage({
    recipientPhone,
    header: `${service.name} • ${DAY_LABELS[dayKey]}`.slice(0, 60),
    body: `Choose a time slot for ${DAY_LABELS[dayKey]} (${formatDate(dateForDayKey(dayKey))}).`,
    buttonText: "View slots",
    sections: [
      {
        title: `${DAY_LABELS[dayKey]} slots`.slice(0, 24),
        rows: slots.slice(0, 10).map((slot) => ({
          id: `slot_${slot.id}`,
          title: formatTimeRange(slot.start_time, slot.end_time).slice(0, 24),
          description: "Available",
        })),
      },
    ],
  });
}

async function sendBookingConfirmation(
  recipientPhone: string,
  session: BookingSession,
) {
  const service = session.selectedService!;
  const slot = session.selectedSlot!;
  const name = session.customerName!;

  const summary = [
    "Please review your booking:",
    "",
    `👤 Name: ${name}`,
    `💇 Service: ${service.name}`,
    `📅 Date: ${formatDate(slot.start_time)}`,
    `🕐 Time: ${formatTimeRange(slot.start_time, slot.end_time)}`,
    `💰 Amount: ₹${service.price}`,
    "",
    "Are you sure you want to book?",
  ].join("\n");

  await sendWhatsAppButtonMessage({
    recipientPhone,
    body: summary,
    buttons: [
      { id: "confirm_yes", title: "✅ Confirm" },
      { id: "confirm_no", title: "❌ Cancel" },
    ],
  });
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
  const replyId = getInteractiveReplyId(message);

  if (!isSalonMessage(customerPhone, rawMessageText, replyId)) {
    await forwardToCoffeeWebhook(body);
    return NextResponse.json({ status: "ok" });
  }

  rememberSalonSession(customerPhone);

  const messageText = rawMessageText.toLowerCase().replace(SALON_TRIGGER, "").trim();

  // ────────────────────────────────────────────
  // Step 1: Service selected → show day picker
  // ────────────────────────────────────────────
  if (replyId.startsWith("service_")) {
    const serviceId = replyId.replace("service_", "");
    const selectedService = await getServiceById(SALON_ID, serviceId);

    if (!selectedService) {
      const services = await getSalonServices(SALON_ID);
      await sendWhatsAppMessage({
        recipientPhone: customerPhone,
        message: "That service is no longer available. Please choose again.",
      });
      await sendServicesMenu(customerPhone, services);
      return NextResponse.json({ status: "ok" });
    }

    rememberBookingSession(customerPhone, {
      selectedService,
      stage: "selecting_day",
    });
    await sendDayPicker(customerPhone, selectedService);
    return NextResponse.json({ status: "ok" });
  }

  // ────────────────────────────────────────────
  // Step 2: Day selected → show slots for that day
  // ────────────────────────────────────────────
  if (replyId.startsWith("day_")) {
    const dayKey = replyId.replace("day_", "") as DayKey;

    if (!DAY_KEYS.includes(dayKey)) {
      await sendWhatsAppMessage({
        recipientPhone: customerPhone,
        message: "Sorry, that day is not valid. Please pick again.",
      });
      return NextResponse.json({ status: "ok" });
    }

    const session = getBookingSession(customerPhone);
    const selectedService = session?.selectedService;

    if (!selectedService) {
      const services = await getSalonServices(SALON_ID);
      await sendWhatsAppMessage({
        recipientPhone: customerPhone,
        message: "Please choose a service first.",
      });
      await sendServicesMenu(customerPhone, services);
      return NextResponse.json({ status: "ok" });
    }

    const date = dateForDayKey(dayKey);
    const slots = (await getAvailableSlots(SALON_ID, selectedService.id, date)) as AvailableSlot[];

    rememberBookingSession(customerPhone, {
      ...session,
      selectedService,
      selectedDate: date,
      stage: "selecting_slot",
    });

    await sendSlotsForDay(customerPhone, selectedService, dayKey, slots);
    return NextResponse.json({ status: "ok" });
  }

  // ────────────────────────────────────────────
  // Step 3: Slot selected → ask for name
  // ────────────────────────────────────────────
  if (replyId.startsWith("slot_")) {
    const slotId = replyId.replace("slot_", "");
    const session = getBookingSession(customerPhone);
    let selectedService = session?.selectedService;

    const { data: slotData } = await supabaseService
      .from("availability_slots")
      .select("id,start_time,end_time,is_blocked,service_id")
      .eq("id", slotId)
      .eq("salon_id", SALON_ID)
      .eq("is_blocked", false)
      .single();

    if (!slotData) {
      await sendWhatsAppMessage({
        recipientPhone: customerPhone,
        message: "That slot is no longer available. Please choose another.",
      });

      if (selectedService) {
        await sendDayPicker(customerPhone, selectedService);
      } else {
        const services = await getSalonServices(SALON_ID);
        await sendServicesMenu(customerPhone, services);
      }
      return NextResponse.json({ status: "ok" });
    }

    // Recover service from slot if session was lost
    if (!selectedService && slotData.service_id) {
      selectedService = (await getServiceById(SALON_ID, slotData.service_id)) || undefined;
    }

    if (!selectedService) {
      const services = await getSalonServices(SALON_ID);
      await sendWhatsAppMessage({
        recipientPhone: customerPhone,
        message: "Please choose a service first.",
      });
      await sendServicesMenu(customerPhone, services);
      return NextResponse.json({ status: "ok" });
    }

    rememberBookingSession(customerPhone, {
      ...session,
      selectedService,
      selectedSlot: {
        id: slotData.id,
        start_time: slotData.start_time,
        end_time: slotData.end_time,
        is_blocked: slotData.is_blocked,
      },
      stage: "awaiting_name",
    });

    await sendWhatsAppMessage({
      recipientPhone: customerPhone,
      message: `Great. ${selectedService.name} is available on ${formatDate(slotData.start_time)} at ${formatTimeRange(slotData.start_time, slotData.end_time)}.\n\nPlease reply with your name to continue.`,
    });
    return NextResponse.json({ status: "ok" });
  }

  // ────────────────────────────────────────────
  // Step 5: Confirmation buttons (yes/no)
  // ────────────────────────────────────────────
  if (replyId === "confirm_no") {
    bookingSessions.delete(customerPhone);
    await sendWhatsAppMessage({
      recipientPhone: customerPhone,
      message: "Booking cancelled. Type 'services' or '#salon' to start again.",
    });
    return NextResponse.json({ status: "ok" });
  }

  if (replyId === "confirm_yes") {
    const session = getBookingSession(customerPhone);
    const selectedService = session?.selectedService;
    const selectedSlot = session?.selectedSlot;
    const customerName = session?.customerName;

    if (!selectedService || !selectedSlot || !customerName) {
      await sendWhatsAppMessage({
        recipientPhone: customerPhone,
        message: "Your booking session has expired. Please start again.",
      });
      const services = await getSalonServices(SALON_ID);
      await sendServicesMenu(customerPhone, services);
      return NextResponse.json({ status: "ok" });
    }

    // Re-verify the slot is still available
    const { data: slotData } = await supabaseService
      .from("availability_slots")
      .select("id,start_time,end_time,is_blocked")
      .eq("id", selectedSlot.id)
      .eq("is_blocked", false)
      .single();

    if (!slotData) {
      await sendWhatsAppMessage({
        recipientPhone: customerPhone,
        message: "Sorry, that slot was just taken. Please pick another slot.",
      });
      await sendDayPicker(customerPhone, selectedService);
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

    // Customer confirmation
    const confirmationMsg = [
      "✅ Booking confirmed!",
      "",
      `Name: ${customerName}`,
      `Service: ${selectedService.name}`,
      `Date: ${formatDate(slotData.start_time)}`,
      `Time: ${formatTimeRange(slotData.start_time, slotData.end_time)}`,
      `Amount: ₹${selectedService.price}`,
      `Reference: ${bookingRef}`,
      "",
      "Thank you! See you soon.",
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

  // ────────────────────────────────────────────
  // Step 4: Name input (text reply while awaiting_name)
  // ────────────────────────────────────────────
  const bookingSession = getBookingSession(customerPhone);
  const isCustomerName =
    bookingSession?.stage === "awaiting_name" &&
    messageText &&
    messageText.length > 1 &&
    messageText.length < 80 &&
    !messageText.includes("@");

  if (isCustomerName && bookingSession.selectedService && bookingSession.selectedSlot) {
    const customerName = rawMessageText.trim();

    rememberBookingSession(customerPhone, {
      ...bookingSession,
      customerName,
      stage: "awaiting_confirmation",
    });

    await sendBookingConfirmation(customerPhone, {
      ...bookingSession,
      customerName,
    });
    return NextResponse.json({ status: "ok" });
  }

  // ────────────────────────────────────────────
  // Fallback: greeting / menu
  // ────────────────────────────────────────────
  if (!messageText || ["hi", "hello", "menu", "services", "book", "booking"].some((word) => messageText.includes(word))) {
    const services = await getSalonServices(SALON_ID);
    await sendServicesMenu(customerPhone, services);
    return NextResponse.json({ status: "ok" });
  }

  await sendWhatsAppMessage({
    recipientPhone: customerPhone,
    message: "Please use the menu button to choose a service or type 'services' to start again.",
  });

  return NextResponse.json({ status: "ok" });
}

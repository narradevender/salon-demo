import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase-service";
import {
  sendWhatsAppMessage,
  sendWhatsAppButtonMessage,
  notifyOwner,
  getAvailableSlots,
  formatTimeRange,
  formatDate,
  verifyMetaSignature,
} from "@/lib/whatsapp";

const META_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;
const SALON_ID = process.env.NEXT_PUBLIC_SALON_ID || "";
const OWNER_PHONE_DIGITS = (process.env.META_OWNER_WHATSAPP_TO || "").replace(/\D/g, "");

// Safety cap: never send more than this many bot replies to the same phone
// within RATE_LIMIT_WINDOW_MS. Counts inbound messages from the phone in the
// window — every inbound triggers at most ~2 outbound, so 10 inbound caps
// outbound around 20/minute, well below Meta's spam thresholds.
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

const BTN_VIEW_SERVICES = "view_services";
const BTN_TALK_OWNER = "talk_owner";

export const dynamic = "force-dynamic";

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

type SessionStep =
  | "idle"
  | "awaiting_service"
  | "awaiting_slot"
  | "awaiting_name";

type WhatsAppButtonReply = {
  id: string;
  title: string;
};

type WhatsAppIncomingMessage = {
  id: string;
  from: string;
  type: string;
  text?: { body?: string };
  interactive?: {
    type: string;
    button_reply?: WhatsAppButtonReply;
    list_reply?: WhatsAppButtonReply;
  };
};

type WhatsAppWebhookBody = {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: WhatsAppIncomingMessage[];
      };
    }>;
  }>;
};

function getIncomingMessage(body: WhatsAppWebhookBody | null): WhatsAppIncomingMessage | undefined {
  return body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
}

function extractText(message: WhatsAppIncomingMessage): string {
  if (message.type === "text") return (message.text?.body || "").trim();
  if (message.type === "interactive") {
    const reply = message.interactive?.button_reply || message.interactive?.list_reply;
    return reply?.title?.trim() || "";
  }
  return "";
}

function extractButtonId(message: WhatsAppIncomingMessage): string | null {
  if (message.type !== "interactive") return null;
  const reply = message.interactive?.button_reply || message.interactive?.list_reply;
  return reply?.id || null;
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function isOwnerPhone(phone: string): boolean {
  if (!OWNER_PHONE_DIGITS) return false;
  return normalizePhone(phone) === OWNER_PHONE_DIGITS;
}

// Atomic "claim" of a message id. Returns true if this caller is the first
// to see this id (race-safe because message_id is a PRIMARY KEY).
async function claimMessage(messageId: string, phone: string): Promise<boolean> {
  const { error } = await supabaseService
    .from("whatsapp_processed_messages")
    .insert({ message_id: messageId, phone });

  if (!error) return true;
  // 23505 = unique_violation: already processed by a parallel webhook retry.
  if ((error as { code?: string }).code === "23505") return false;
  console.error("claimMessage insert error:", error);
  // On unknown error, fail closed (treat as already-processed) so we don't
  // accidentally double-send.
  return false;
}

async function isRateLimited(phone: string): Promise<boolean> {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const { count } = await supabaseService
    .from("whatsapp_processed_messages")
    .select("message_id", { count: "exact", head: true })
    .eq("phone", phone)
    .gte("processed_at", since);
  return (count ?? 0) > RATE_LIMIT_MAX;
}

type Session = {
  phone: string;
  step: SessionStep;
  selected_service_id: string | null;
  selected_slot_id: string | null;
  customer_name: string | null;
};

async function loadSession(phone: string): Promise<Session | null> {
  const { data } = await supabaseService
    .from("whatsapp_sessions")
    .select("phone,step,selected_service_id,selected_slot_id,customer_name,expires_at")
    .eq("phone", phone)
    .maybeSingle();

  if (!data) return null;
  if (new Date(data.expires_at).getTime() < Date.now()) return null;

  return {
    phone: data.phone,
    step: (data.step as SessionStep) ?? "idle",
    selected_service_id: data.selected_service_id,
    selected_slot_id: data.selected_slot_id,
    customer_name: data.customer_name,
  };
}

async function saveSession(session: Session): Promise<void> {
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  await supabaseService.from("whatsapp_sessions").upsert(
    {
      phone: session.phone,
      salon_id: SALON_ID,
      step: session.step,
      selected_service_id: session.selected_service_id,
      selected_slot_id: session.selected_slot_id,
      customer_name: session.customer_name,
      updated_at: new Date().toISOString(),
      expires_at: expiresAt,
    },
    { onConflict: "phone" },
  );
}

async function resetSession(phone: string): Promise<void> {
  await saveSession({
    phone,
    step: "idle",
    selected_service_id: null,
    selected_slot_id: null,
    customer_name: null,
  });
}

async function getSalonServices(salonId: string): Promise<SalonService[]> {
  if (!salonId) {
    console.warn("NEXT_PUBLIC_SALON_ID missing");
    return [];
  }
  const { data, error } = await supabaseService
    .from("services")
    .select("id,name,price,duration_minutes")
    .eq("salon_id", salonId)
    .eq("is_active", true)
    .order("price", { ascending: true });

  if (error) {
    console.error("WhatsApp services fetch failed:", error.message);
    return [];
  }
  return data ?? [];
}

function buildServicesMenu(services: SalonService[]): string {
  if (services.length === 0) return "No services available right now. Please call us.";
  return [
    "Here are our services:",
    "",
    ...services.map(
      (s, i) => `${i + 1}. ${s.name} — Rs.${s.price} (${s.duration_minutes} mins)`,
    ),
    "",
    `Reply with a number (1-${services.length}) to see available slots.`,
  ].join("\n");
}

function getNextThreeDays(): string[] {
  const days: string[] = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

async function groupSlotsByDay(salonId: string, serviceId: string) {
  const [today, tomorrow, dayAfter] = getNextThreeDays();

  const [todaySlots, tomorrowSlots, dayAfterSlots] = await Promise.all([
    getAvailableSlots(salonId, serviceId, today),
    getAvailableSlots(salonId, serviceId, tomorrow),
    getAvailableSlots(salonId, serviceId, dayAfter),
  ]);

  const grouped: Record<string, AvailableSlot[]> = {};
  if (todaySlots.length) grouped[`Today (${formatDate(today)})`] = todaySlots;
  if (tomorrowSlots.length) grouped[`Tomorrow (${formatDate(tomorrow)})`] = tomorrowSlots;
  if (dayAfterSlots.length) grouped[`Day After (${formatDate(dayAfter)})`] = dayAfterSlots;

  return {
    grouped,
    allSlots: [...todaySlots, ...tomorrowSlots, ...dayAfterSlots],
  };
}

function buildSlotsMenu(
  service: SalonService,
  grouped: Record<string, AvailableSlot[]>,
): string {
  const lines = [
    `${service.name} selected`,
    `Rs.${service.price} | ${service.duration_minutes} mins`,
    "",
    "Available slots:",
  ];
  let i = 1;
  for (const [label, slots] of Object.entries(grouped)) {
    lines.push("");
    lines.push(label);
    for (const slot of slots) {
      lines.push(`${i}. ${formatTimeRange(slot.start_time, slot.end_time)}`);
      i++;
    }
  }
  lines.push("");
  lines.push("Reply with the slot number to book.");
  return lines.join("\n");
}

async function sendWelcome(phone: string): Promise<void> {
  await sendWhatsAppButtonMessage({
    recipientPhone: phone,
    body: "Welcome to our salon! How can we help you today?",
    buttons: [
      { id: BTN_VIEW_SERVICES, title: "View Services" },
      { id: BTN_TALK_OWNER, title: "Talk to Owner" },
    ],
  });
}

// Parse a positive integer that matches the full input (not just the first digit).
function parseMenuNumber(input: string, max: number): number | null {
  if (!/^\d+$/.test(input)) return null;
  const n = parseInt(input, 10);
  if (Number.isNaN(n) || n < 1 || n > max) return null;
  return n;
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
  // Read raw body so we can verify the HMAC before parsing JSON.
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!verifyMetaSignature(rawBody, signature)) {
    console.warn("Rejected WhatsApp webhook: invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: WhatsAppWebhookBody | null = null;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ status: "ok" });
  }

  const message = getIncomingMessage(body);
  // Status updates (sent/delivered/read/failed) have no `messages` array — ignore.
  if (!message || !message.id) {
    return NextResponse.json({ status: "ok" });
  }

  const customerPhone = message.from;

  // Drop messages from the salon's own owner number to prevent self-loops
  // during testing (owner phone = customer phone). Account got banned last
  // time because outbound to the same number bounced and Meta retried.
  if (isOwnerPhone(customerPhone)) {
    return NextResponse.json({ status: "ok" });
  }

  try {
    // Idempotency: Meta retries failed webhooks up to 21 times. Skip duplicates.
    // Race-safe via PK conflict.
    if (!(await claimMessage(message.id, customerPhone))) {
      return NextResponse.json({ status: "ok" });
    }

    // Per-phone safety cap. If we're already over the limit, drop silently
    // (don't reply, but still ack 200 so Meta doesn't retry).
    if (await isRateLimited(customerPhone)) {
      console.warn("Rate-limit hit for", customerPhone);
      return NextResponse.json({ status: "ok" });
    }

    await routeMessage(message, customerPhone);
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("WhatsApp webhook handler error:", error);
    // Always ack 200 so Meta doesn't retry and create a duplicate-message storm.
    return NextResponse.json({ status: "ok" });
  }
}

async function routeMessage(message: WhatsAppIncomingMessage, customerPhone: string) {
  const text = extractText(message);
  const buttonId = extractButtonId(message);
  const session = (await loadSession(customerPhone)) ?? {
    phone: customerPhone,
    step: "idle" as SessionStep,
    selected_service_id: null,
    selected_slot_id: null,
    customer_name: null,
  };

  // Interactive button taps short-circuit the state machine.
  if (buttonId === BTN_TALK_OWNER) {
    await sendWhatsAppMessage({
      recipientPhone: customerPhone,
      message: "Thanks! Our team will call you shortly.",
    });
    await notifyOwnerCallback(customerPhone);
    await resetSession(customerPhone);
    return;
  }

  if (buttonId === BTN_VIEW_SERVICES) {
    const services = await getSalonServices(SALON_ID);
    await sendWhatsAppMessage({
      recipientPhone: customerPhone,
      message: buildServicesMenu(services),
    });
    await saveSession({
      phone: customerPhone,
      step: "awaiting_service",
      selected_service_id: null,
      selected_slot_id: null,
      customer_name: null,
    });
    return;
  }

  // Idle + any inbound (text or unknown button) → greet with buttons.
  if (session.step === "idle") {
    await sendWelcome(customerPhone);
    await saveSession({ ...session, step: "idle" });
    return;
  }

  if (session.step === "awaiting_service") {
    const services = await getSalonServices(SALON_ID);
    const num = parseMenuNumber(text, services.length);
    if (!num) {
      await sendWhatsAppMessage({
        recipientPhone: customerPhone,
        message: `Please reply with a number between 1 and ${services.length}.`,
      });
      return;
    }
    const service = services[num - 1];
    const { grouped, allSlots } = await groupSlotsByDay(SALON_ID, service.id);
    if (allSlots.length === 0) {
      await sendWhatsAppMessage({
        recipientPhone: customerPhone,
        message: "No slots available for this service in the next 3 days. Please try another service or call us.",
      });
      return;
    }
    await sendWhatsAppMessage({
      recipientPhone: customerPhone,
      message: buildSlotsMenu(service, grouped),
    });
    await saveSession({
      phone: customerPhone,
      step: "awaiting_slot",
      selected_service_id: service.id,
      selected_slot_id: null,
      customer_name: null,
    });
    return;
  }

  if (session.step === "awaiting_slot") {
    if (!session.selected_service_id) {
      await sendWelcome(customerPhone);
      await resetSession(customerPhone);
      return;
    }
    const { allSlots } = await groupSlotsByDay(SALON_ID, session.selected_service_id);
    const num = parseMenuNumber(text, allSlots.length);
    if (!num) {
      await sendWhatsAppMessage({
        recipientPhone: customerPhone,
        message: `Please reply with a slot number between 1 and ${allSlots.length}.`,
      });
      return;
    }
    const slot = allSlots[num - 1];
    await sendWhatsAppMessage({
      recipientPhone: customerPhone,
      message: "Got it. Please reply with your full name to confirm the booking.",
    });
    await saveSession({
      phone: customerPhone,
      step: "awaiting_name",
      selected_service_id: session.selected_service_id,
      selected_slot_id: slot.id,
      customer_name: null,
    });
    return;
  }

  if (session.step === "awaiting_name") {
    const name = text.replace(/\s+/g, " ").trim();
    if (name.length < 2 || name.length > 80) {
      await sendWhatsAppMessage({
        recipientPhone: customerPhone,
        message: "Please send your full name (2-80 characters).",
      });
      return;
    }
    await finalizeBooking({
      customerPhone,
      customerName: name,
      serviceId: session.selected_service_id!,
      slotId: session.selected_slot_id!,
    });
    await resetSession(customerPhone);
    return;
  }

  // Fallback: anything else → re-greet.
  await sendWelcome(customerPhone);
  await resetSession(customerPhone);
}

async function finalizeBooking(args: {
  customerPhone: string;
  customerName: string;
  serviceId: string;
  slotId: string;
}) {
  const { customerPhone, customerName, serviceId, slotId } = args;

  const { data: service } = await supabaseService
    .from("services")
    .select("id,name,price,duration_minutes")
    .eq("id", serviceId)
    .single();

  const { data: slot } = await supabaseService
    .from("availability_slots")
    .select("id,start_time,end_time,is_blocked")
    .eq("id", slotId)
    .eq("is_blocked", false)
    .maybeSingle();

  if (!service || !slot) {
    await sendWhatsAppMessage({
      recipientPhone: customerPhone,
      message: "That slot is no longer available. Please start over by saying 'Hi'.",
    });
    return;
  }

  const { data: customer, error: customerError } = await supabaseService
    .from("customers")
    .insert({ salon_id: SALON_ID, name: customerName, phone: customerPhone })
    .select("id")
    .single();

  if (customerError || !customer) {
    console.error("Customer creation error:", customerError);
    await sendWhatsAppMessage({
      recipientPhone: customerPhone,
      message: "Booking failed. Please try again later.",
    });
    return;
  }

  const bookingRef = `SALON-${Date.now()}`;
  const { data: appt, error: apptError } = await supabaseService
    .from("appointments")
    .insert({
      salon_id: SALON_ID,
      service_id: service.id,
      customer_id: customer.id,
      slot_id: slot.id,
      booking_reference: bookingRef,
      status: "confirmed",
      scheduled_start: slot.start_time,
      scheduled_end: slot.end_time,
      price: service.price,
      source: "whatsapp",
    })
    .select("id")
    .single();

  if (apptError || !appt) {
    console.error("Appointment creation error:", apptError);
    await sendWhatsAppMessage({
      recipientPhone: customerPhone,
      message: "Booking failed. Please try again later.",
    });
    return;
  }

  await sendWhatsAppMessage({
    recipientPhone: customerPhone,
    message: [
      "Booking Confirmed!",
      `Name: ${customerName}`,
      `Service: ${service.name}`,
      `Date: ${formatDate(slot.start_time)}`,
      `Time: ${formatTimeRange(slot.start_time, slot.end_time)}`,
      `Amount: Rs.${service.price}`,
      `Reference: ${bookingRef}`,
      "",
      "Thank you! Our team will call you shortly to confirm.",
    ].join("\n"),
  });

  await notifyOwner({
    customerName,
    customerPhone,
    serviceName: service.name,
    slotDate: formatDate(slot.start_time),
    slotStartTime: new Date(slot.start_time).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
    slotEndTime: new Date(slot.end_time).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
    price: service.price,
    bookingReference: bookingRef,
  });
}

async function notifyOwnerCallback(customerPhone: string) {
  const ownerPhone = process.env.META_OWNER_WHATSAPP_TO;
  if (!ownerPhone) return;
  if (normalizePhone(ownerPhone) === normalizePhone(customerPhone)) return;
  await sendWhatsAppMessage({
    recipientPhone: ownerPhone,
    message: `Callback request from WhatsApp: ${customerPhone}`,
  });
}

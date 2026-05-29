import crypto from "crypto";
import { supabaseService } from "./supabase-service";

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const META_PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID;
const META_API_VERSION = process.env.META_API_VERSION || "v21.0";
const META_APP_SECRET = process.env.META_APP_SECRET;

if (!META_ACCESS_TOKEN || !META_PHONE_NUMBER_ID) {
  console.warn("⚠️ Meta WhatsApp credentials missing — WhatsApp messaging disabled");
}

// Verifies the X-Hub-Signature-256 header Meta sends on every webhook POST.
// Without this anyone who knows the URL can POST and trigger outbound messages.
export function verifyMetaSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!META_APP_SECRET) {
    console.warn("META_APP_SECRET not set — webhook signature check skipped (insecure)");
    return true;
  }
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;

  const expected = crypto.createHmac("sha256", META_APP_SECRET).update(rawBody).digest("hex");
  const provided = signatureHeader.slice("sha256=".length);

  if (expected.length !== provided.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(provided, "hex"));
  } catch {
    return false;
  }
}

interface SendMessageParams {
  recipientPhone: string;
  message: string;
}

type InteractiveRow = {
  id: string;
  title: string;
  description?: string;
};

type InteractiveSection = {
  title: string;
  rows: InteractiveRow[];
};

async function sendWhatsAppPayload(payload: Record<string, unknown>) {
  if (!META_ACCESS_TOKEN || !META_PHONE_NUMBER_ID) {
    console.warn("Skipping WhatsApp message — credentials not configured");
    return null;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${META_API_VERSION}/${META_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${META_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("WhatsApp send failed:", error);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return null;
  }
}

export async function sendWhatsAppMessage({ recipientPhone, message }: SendMessageParams) {
  if (!META_ACCESS_TOKEN || !META_PHONE_NUMBER_ID) {
    console.warn("Skipping WhatsApp message — credentials not configured");
    return null;
  }

  try {
    const payload: Record<string, unknown> = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientPhone,
      type: "text",
      text: { body: message },
    };

    return sendWhatsAppPayload(payload);
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return null;
  }
}

export async function sendWhatsAppImageMessage({
  recipientPhone,
  imageUrl,
  caption,
}: {
  recipientPhone: string;
  imageUrl: string;
  caption: string;
}) {
  return sendWhatsAppPayload({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipientPhone,
    type: "image",
    image: {
      link: imageUrl,
      caption,
    },
  });
}

export async function sendWhatsAppListMessage({
  recipientPhone,
  header,
  body,
  buttonText,
  sections,
}: {
  recipientPhone: string;
  header?: string;
  body: string;
  buttonText: string;
  sections: InteractiveSection[];
}) {
  return sendWhatsAppPayload({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipientPhone,
    type: "interactive",
    interactive: {
      type: "list",
      header: header ? { type: "text", text: header } : undefined,
      body: { text: body },
      action: {
        button: buttonText,
        sections,
      },
    },
  });
}

type InteractiveButton = {
  id: string;
  title: string;
};

export async function sendWhatsAppButtonMessage({
  recipientPhone,
  header,
  body,
  buttons,
}: {
  recipientPhone: string;
  header?: string;
  body: string;
  buttons: InteractiveButton[];
}) {
  return sendWhatsAppPayload({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipientPhone,
    type: "interactive",
    interactive: {
      type: "button",
      header: header ? { type: "text", text: header } : undefined,
      body: { text: body },
      action: {
        buttons: buttons.slice(0, 3).map((button) => ({
          type: "reply",
          reply: {
            id: button.id,
            title: button.title.slice(0, 20),
          },
        })),
      },
    },
  });
}

export async function sendWhatsAppTemplateMessage({
  recipientPhone,
  templateName,
  languageCode = "en",
  bodyParameters = [],
}: {
  recipientPhone: string;
  templateName: string;
  languageCode?: string;
  bodyParameters?: string[];
}) {
  const components =
    bodyParameters.length > 0
      ? [
          {
            type: "body",
            parameters: bodyParameters.map((value) => ({ type: "text", text: value })),
          },
        ]
      : undefined;

  return sendWhatsAppPayload({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipientPhone,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      ...(components ? { components } : {}),
    },
  });
}

export async function notifyOwner(bookingDetails: {
  customerName: string;
  customerPhone: string;
  serviceName: string;
  slotDate: string;
  slotStartTime: string;
  slotEndTime: string;
  price: number;
  bookingReference: string;
}) {
  const ownerPhone = process.env.META_OWNER_WHATSAPP_TO;
  if (!ownerPhone) {
    console.warn("Owner phone not configured — skipping owner notification");
    return null;
  }

  const templateName = process.env.META_OWNER_NOTIFICATION_TEMPLATE;
  const templateLang = process.env.META_OWNER_NOTIFICATION_TEMPLATE_LANG || "en";

  // Template params (must match the {{1}}..{{7}} placeholders in the approved template)
  const bodyParameters = [
    bookingDetails.customerName,
    bookingDetails.customerPhone,
    bookingDetails.serviceName,
    bookingDetails.slotDate,
    `${bookingDetails.slotStartTime} - ${bookingDetails.slotEndTime}`,
    String(bookingDetails.price),
    bookingDetails.bookingReference,
  ];

  // Prefer approved template — works outside the 24-hour customer service window.
  if (templateName) {
    const result = await sendWhatsAppTemplateMessage({
      recipientPhone: ownerPhone,
      templateName,
      languageCode: templateLang,
      bodyParameters,
    });
    if (result) return result;
    console.warn("Template send failed — falling back to free-form text (requires 24-hour window)");
  }

  const message = `📌 NEW BOOKING REQUEST

👤 Customer: ${bookingDetails.customerName}
📞 Phone: ${bookingDetails.customerPhone}
💇 Service: ${bookingDetails.serviceName}
📅 Date: ${bookingDetails.slotDate}
🕐 Time: ${bookingDetails.slotStartTime} - ${bookingDetails.slotEndTime}
💰 Price: ₹${bookingDetails.price}
📋 Reference: ${bookingDetails.bookingReference}

Please confirm with the customer.`;

  return sendWhatsAppMessage({
    recipientPhone: ownerPhone,
    message,
  });
}

export async function getServiceById(serviceId: string) {
  const { data } = await supabaseService
    .from("services")
    .select("id,name,price,duration_minutes")
    .eq("id", serviceId)
    .single();
  return data;
}

// Standard daily slot times in IST (24h). Used to auto-generate slots for
// the requested date if none exist yet, so the demo never goes stale.
const DEFAULT_IST_SLOT_HOURS = [10, 14, 17];

async function ensureSlotsForDate(salonId: string, serviceId: string, date: string) {
  const startOfDay = `${date}T00:00:00Z`;
  const endOfDay = `${date}T23:59:59Z`;

  const { count } = await supabaseService
    .from("availability_slots")
    .select("id", { count: "exact", head: true })
    .eq("salon_id", salonId)
    .eq("service_id", serviceId)
    .gte("start_time", startOfDay)
    .lte("end_time", endOfDay);

  if ((count ?? 0) > 0) return;

  const { data: service } = await supabaseService
    .from("services")
    .select("duration_minutes")
    .eq("id", serviceId)
    .single();
  if (!service) return;

  const [year, month, day] = date.split("-").map(Number);

  const rows = DEFAULT_IST_SLOT_HOURS
    // IST = UTC+5:30, so H IST on `date` = (H-5):(-30) UTC on `date`.
    .map((istHour) => new Date(Date.UTC(year, month - 1, day, istHour - 5, -30)))
    // Skip times that are already in the past (relevant for "today").
    .filter((start) => start.getTime() > Date.now())
    .map((start) => ({
      salon_id: salonId,
      service_id: serviceId,
      start_time: start.toISOString(),
      end_time: new Date(start.getTime() + service.duration_minutes * 60_000).toISOString(),
    }));

  if (rows.length === 0) return;

  await supabaseService.from("availability_slots").insert(rows);
}

export async function getAvailableSlots(salonId: string, serviceId: string, date: string) {
  await ensureSlotsForDate(salonId, serviceId, date);

  const startOfDay = `${date}T00:00:00Z`;
  const endOfDay = `${date}T23:59:59Z`;

  const { data } = await supabaseService
    .from("availability_slots")
    .select("id,start_time,end_time,is_blocked")
    .eq("salon_id", salonId)
    .eq("service_id", serviceId)
    .gte("start_time", startOfDay)
    .lte("end_time", endOfDay)
    .eq("is_blocked", false)
    .order("start_time", { ascending: true });

  return data || [];
}

export function formatTimeRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  return `${start.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })} - ${end.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })}`;
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });
}

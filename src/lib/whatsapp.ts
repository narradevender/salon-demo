import { supabaseService } from "./supabase-service";

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const META_PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID;
const META_API_VERSION = process.env.META_API_VERSION || "v21.0";

if (!META_ACCESS_TOKEN || !META_PHONE_NUMBER_ID) {
  console.warn("⚠️ Meta WhatsApp credentials missing — WhatsApp messaging disabled");
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

export async function getAvailableSlots(salonId: string, serviceId: string, date: string) {
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

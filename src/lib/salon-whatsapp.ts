import { toWhatsAppNumber } from "@/lib/phone";

const DEFAULT_WHATSAPP_NUMBER = "+917981898151";

export const SALON_TRIGGER_MESSAGE =
  "#SALON Hi, I want to book an appointment. Please share your services list, available slots, prices, and booking confirmation.";

export function getSalonWhatsAppUrl(message: string = SALON_TRIGGER_MESSAGE) {
  const number = toWhatsAppNumber(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? DEFAULT_WHATSAPP_NUMBER,
  );
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

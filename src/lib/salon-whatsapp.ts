import { toWhatsAppNumber } from "@/lib/phone";

const DEFAULT_WHATSAPP_NUMBER = "+917981898151";

export const SALON_TRIGGER_MESSAGE = "Hi";

export function getSalonWhatsAppUrl(message: string = SALON_TRIGGER_MESSAGE) {
  const number = toWhatsAppNumber(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? DEFAULT_WHATSAPP_NUMBER,
  );
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

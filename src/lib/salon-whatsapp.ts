import { toWhatsAppNumber } from "@/lib/phone";

export const SALON_TRIGGER_MESSAGE = "Hi";

export function getSalonWhatsAppUrl(message: string = SALON_TRIGGER_MESSAGE): string {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const number = toWhatsAppNumber(raw);
  if (!number) return "";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

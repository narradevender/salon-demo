import { toWhatsAppNumber } from "@/lib/phone";

export const SALON_TRIGGER_MESSAGE = "Hi";

// Only NEXT_PUBLIC_* env vars are inlined into client bundles. META_OWNER_WHATSAPP_TO
// is server-only, so this fallback only fires when called from a Server Component
// (e.g. the WhatsAppFab on the landing page). Client components must rely on the
// NEXT_PUBLIC_ var.
export function getSalonWhatsAppUrl(message: string = SALON_TRIGGER_MESSAGE): string {
  const raw =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || process.env.META_OWNER_WHATSAPP_TO;
  const number = toWhatsAppNumber(raw);
  if (!number) return "";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

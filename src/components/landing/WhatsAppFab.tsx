import { toWhatsAppNumber } from "@/lib/phone";

const DEFAULT_WHATSAPP_NUMBER = "+917981898151";

export default function WhatsAppFab() {
  const message = encodeURIComponent(
    "Hi, I want to book an appointment. Please share your services list, available slots, prices, and booking confirmation details.",
  );
  const whatsappNumber = toWhatsAppNumber(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? DEFAULT_WHATSAPP_NUMBER
  );

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${message}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-400 sm:bottom-8 sm:right-8"
    >
      <span className="h-10 w-10 rounded-full bg-white/15 p-2 text-white shadow-inner shadow-black/10">WA</span>
      WhatsApp
    </a>
  );
}

import { getSalonWhatsAppUrl } from "@/lib/salon-whatsapp";

const WHATSAPP_LOGO =
  "https://i.pinimg.com/564x/ae/64/6b/ae646b4adeb670a35df6c73ef548904f.jpg";

export default function WhatsAppFab() {
  return (
    <a
      href={getSalonWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Book on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-emerald-500 py-2 pl-2 pr-5 text-sm font-semibold text-white shadow-2xl shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-400 sm:bottom-8 sm:right-8"
    >
      <img
        src={WHATSAPP_LOGO}
        alt=""
        className="h-10 w-10 rounded-full border-2 border-white object-cover"
      />
      Book on WhatsApp
    </a>
  );
}

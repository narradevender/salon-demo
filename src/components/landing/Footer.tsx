import Link from "next/link";
import { Scissors, MessageCircle } from "lucide-react";

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const footerLinks = [
  {
    title: "Salon",
    items: [
      { label: "Services", href: "#services" },
      { label: "Gallery", href: "#gallery" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    title: "Bookings",
    items: [
      { label: "Owner dashboard", href: "/dashboard" },
      { label: "All bookings", href: "/dashboard/bookings" },
      { label: "Analytics", href: "/dashboard/analytics" },
      { label: "Customers", href: "/dashboard/customers" },
    ],
  },
];

export default function Footer({ whatsappUrl }: { whatsappUrl: string }) {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-slate-950 px-6 py-16 text-slate-300 sm:px-8 lg:px-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-amber-200/30 to-transparent"
      />
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-300/40 bg-amber-300/10 text-amber-300">
              <Scissors size={18} />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              Glow <span className="text-amber-300">Studio</span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
            A premium salon experience with automated WhatsApp booking, live availability, and a beautiful
            owner dashboard.
          </p>
          <div className="mt-6 flex gap-3">
            {[
              { icon: InstagramIcon, href: "#", label: "Instagram" },
              { icon: FacebookIcon, href: "#", label: "Facebook" },
              { icon: MessageCircle, href: whatsappUrl || "#", label: "WhatsApp" },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-amber-200/60 hover:bg-white/10 hover:text-amber-200"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {footerLinks.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200/80">
              {col.title}
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              {col.items.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-slate-300 transition-colors hover:text-amber-200"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200/80">Visit us</p>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-400">
            <li>Banjara Hills, Hyderabad</li>
            <li>Mon — Sun, 10am — 9pm</li>
            <li className="text-amber-200">+1 415 523 8886</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Glow Studio. All rights reserved.</p>
        <p className="text-slate-600">Crafted for premium salons in Hyderabad.</p>
      </div>
    </footer>
  );
}

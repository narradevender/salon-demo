import { ArrowRight, MapPin } from "lucide-react";
import { getSalonWhatsAppUrl } from "@/lib/salon-whatsapp";

const heroServices = [
  "Girl Hair Cut",
  "Girls Hair Styling",
  "Boys Hair Cut",
  "Boys Facial",
];

const salonImage =
  "https://lh3.googleusercontent.com/gps-cs-s/APNQkAF1qkhqzGF47w24D7NibhbIBt_oXx7XBs6aV_I7ZTuYfPvYwHR0kSTBTUm3IP6KIqVyQwWKqiXq-9NGaNcohjdukGeO2zXKkG22hvfnV7R2_QnL2Io7s0Ycz4iimndwDEB3ul7pLg=s1360-w1360-h1020-rw";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,214,189,0.18),_transparent_35%),linear-gradient(180deg,#050505_0%,#1b1a1f_100%)] px-6 py-16 text-white sm:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <span className="inline-flex rounded-full bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.3em] text-amber-200/90 shadow-lg shadow-amber-500/10 backdrop-blur-xl">
              NyCAA 14 Salon · Hyderabad
            </span>
            <div className="space-y-6">
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                Style, care, and confidence — all under one roof at <span className="text-amber-300">NyCAA 14</span>.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-amber-100/85 sm:text-xl">
                Premium haircuts, styling, facials, and grooming for men and women. Book your appointment on WhatsApp in seconds.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href={getSalonWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-300/30 transition hover:-translate-y-0.5 hover:bg-amber-200"
              >
                Book Appointment
                <ArrowRight size={18} />
              </a>
              <a
                href="#portfolio"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white/90 transition hover:border-amber-200 hover:text-white"
              >
                View Portfolio
              </a>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <MapPin size={16} className="text-amber-200" />
              <a
                href="https://share.google/q1b0l3sm8EWFrrkqo"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-200"
              >
                Find us on Google Maps
              </a>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
              {heroServices.map((service) => (
                <div
                  key={service}
                  className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
                >
                  <p className="text-sm uppercase tracking-[0.18em] text-amber-200/90">
                    {service}
                  </p>
                  <p className="mt-3 text-base leading-7 text-slate-100/90">
                    Quick WhatsApp booking, transparent pricing, no waiting in line.
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-h-[560px] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-2xl shadow-slate-950/30">
            <img
              src={salonImage}
              alt="NyCAA 14 salon storefront"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
            <div className="relative flex h-full min-h-[560px] flex-col justify-end p-8">
              <div className="max-w-md">
                <span className="text-xs uppercase tracking-[0.3em] text-amber-100/90">
                  Welcome to
                </span>
                <h2 className="mt-4 text-3xl font-semibold text-white">NyCAA 14</h2>
                <p className="mt-3 text-sm leading-6 text-slate-100">
                  A modern neighborhood salon trusted by locals and travellers alike.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

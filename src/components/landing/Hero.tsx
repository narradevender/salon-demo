import Link from "next/link";
import { ArrowRight } from "lucide-react";

const heroServices = [
  "Girl Hair Cut",
  "Girls Hair Styling",
  "Boys Hair Cut",
  "Boys Facial",
];

const bannerImage =
  "https://images.squarespace-cdn.com/content/v1/6091e6edc456d57a746254a2/1850bf2a-85fe-4011-81ef-5e726d5ed752/Salon+Main+IMG_0067.jpg";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,214,189,0.18),_transparent_35%),linear-gradient(180deg,#050505_0%,#1b1a1f_100%)] px-6 py-16 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <span className="inline-flex rounded-full bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.3em] text-amber-200/90 shadow-lg shadow-amber-500/10 backdrop-blur-xl">
              Salon Automation for Hyderabad
            </span>
            <div className="space-y-6">
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                Book appointments, manage staff, and delight clients with a luxury salon experience.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-amber-100/85 sm:text-xl">
                A mobile-first salon booking platform built for premium salons in Hyderabad. Reduce manual calls, prevent double bookings, and keep customers coming back.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-300/30 transition hover:-translate-y-0.5 hover:bg-amber-200"
              >
                Book Appointment
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white/90 transition hover:border-amber-200 hover:text-white"
              >
                Owner Dashboard
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
              {heroServices.map((service) => (
                <div key={service} className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                  <p className="text-sm uppercase tracking-[0.18em] text-amber-200/90">{service}</p>
                  <p className="mt-3 text-base leading-7 text-slate-100/90">Fast online booking, slot management, and smoother guest journeys.</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-h-[560px] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-2xl shadow-slate-950/30">
            <img
              src={bannerImage}
              alt="Luxury salon interior"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
            <div className="relative flex h-full min-h-[560px] flex-col justify-end p-8">
              <div className="max-w-md">
                <span className="text-xs uppercase tracking-[0.3em] text-amber-100/90">Luxury Salon</span>
                <h2 className="mt-4 text-3xl font-semibold text-white">Your salon, elevated.</h2>
                <p className="mt-3 text-sm leading-6 text-slate-100">
                  Real salon ambience, service photos, prices, and WhatsApp booking flow in one demo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

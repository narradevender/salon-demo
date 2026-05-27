"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { motion } from "framer-motion";

const heroServices = [
  { name: "Girl Hair Cut", hint: "Layered & polished" },
  { name: "Girls Hair Styling", hint: "Event-ready" },
  { name: "Boys Hair Cut", hint: "Sharp & clean" },
  { name: "Boys Facial", hint: "Clean glow" },
];

const trustStats = [
  { value: "12k+", label: "Bookings served" },
  { value: "4.9", label: "Average rating" },
  { value: "24/7", label: "WhatsApp booking" },
];

const bannerImage =
  "https://images.squarespace-cdn.com/content/v1/6091e6edc456d57a746254a2/1850bf2a-85fe-4011-81ef-5e726d5ed752/Salon+Main+IMG_0067.jpg";

export default function Hero({ whatsappUrl }: { whatsappUrl: string }) {
  return (
    <section className="relative isolate overflow-hidden px-6 pb-20 pt-28 text-white sm:px-8 sm:pt-32 lg:px-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(252,211,77,0.16),_transparent_55%),linear-gradient(180deg,#050505_0%,#0f0d12_55%,#1b1a1f_100%)]" />
        <div className="hero-blob-a absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-amber-400/20 blur-3xl" />
        <div className="hero-blob-b absolute top-1/3 -right-40 h-[480px] w-[480px] rounded-full bg-rose-400/10 blur-3xl" />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07] [background:radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.7)_1px,_transparent_0)] [background-size:38px_38px]"
        />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-amber-200/95 shadow-lg shadow-amber-500/5 backdrop-blur-xl">
              <Sparkles size={14} className="text-amber-300" />
              Salon Automation for Hyderabad
            </span>

            <div className="space-y-6">
              <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Book appointments, manage staff, and delight clients with a{" "}
                <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-rose-200 bg-clip-text text-transparent">
                  luxury
                </span>{" "}
                salon experience.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-300/90 sm:text-lg">
                A mobile-first salon booking platform built for premium salons in Hyderabad. Reduce manual
                calls, prevent double bookings, and keep customers coming back.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-amber-300 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_10px_40px_-12px_rgba(252,211,77,0.6)] transition-all hover:-translate-y-0.5 hover:bg-amber-200 hover:shadow-[0_20px_60px_-12px_rgba(252,211,77,0.7)]"
              >
                Book Appointment
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </a>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-medium text-white/90 backdrop-blur-xl transition hover:border-amber-200/60 hover:bg-white/10 hover:text-white"
              >
                Owner Dashboard
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {heroServices.map((service) => (
                <div
                  key={service.name}
                  className="group rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-amber-200/30 hover:bg-white/10"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/90">
                    {service.name}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200/85">{service.hint}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative min-h-[560px] overflow-hidden rounded-[2.25rem] border border-white/10 bg-slate-900 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]"
          >
            <img
              src={bannerImage}
              alt="Luxury salon interior"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/10" />
            <div className="absolute inset-x-6 top-6 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-slate-950/50 px-3 py-1 text-xs font-medium text-amber-200 backdrop-blur-md">
                <Star size={12} className="fill-amber-300 text-amber-300" />
                4.9 • 1.2k reviews
              </span>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 backdrop-blur-md">
                Open now
              </span>
            </div>
            <div className="relative flex h-full min-h-[560px] flex-col justify-end p-8">
              <div className="max-w-md">
                <span className="text-xs uppercase tracking-[0.3em] text-amber-100/90">Luxury Salon</span>
                <h2 className="mt-3 text-3xl font-semibold text-white">Your salon, elevated.</h2>
                <p className="mt-3 text-sm leading-7 text-slate-200/90">
                  Real ambience, service photos, prices, and WhatsApp booking — in one demo.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-3">
          {trustStats.map((stat) => (
            <div key={stat.label} className="bg-slate-950/80 p-6 backdrop-blur-xl">
              <p className="text-3xl font-semibold text-amber-200 sm:text-4xl">{stat.value}</p>
              <p className="mt-2 text-sm uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

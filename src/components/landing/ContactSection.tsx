"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Phone, MapPin, Mail, Send, Check } from "lucide-react";

export default function ContactSection({ whatsappUrl }: { whatsappUrl: string }) {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
    window.setTimeout(() => setSent(false), 3500);
  }

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-slate-950 px-6 py-24 text-white sm:px-8 lg:px-12"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-1/3 h-[480px] w-[480px] rounded-full bg-amber-400/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Get in touch</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Start accepting bookings with a premium experience.
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              Build your salon&apos;s online presence and convert walk-in interest into confirmed
              bookings, all from one elegant dashboard.
            </p>

            <div className="mt-10 space-y-3">
              {[
                { icon: Phone, label: "Phone", value: "+1 415 523 8886" },
                { icon: Mail, label: "Email", value: "hello@glowstudio.in" },
                { icon: MapPin, label: "Studio", value: "Banjara Hills, Hyderabad" },
              ].map(({ icon: Icon, label, value }) => (
                <motion.div
                  key={label}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  className="group flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-colors hover:border-amber-200/40"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-300/10 text-amber-200 transition-transform duration-300 group-hover:scale-110">
                    <Icon size={20} />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
                    <p className="mt-1 text-base font-semibold text-white">{value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-200 transition hover:border-emerald-300 hover:bg-emerald-500/20"
            >
              <Send size={16} />
              Or message us on WhatsApp
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-10"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-amber-300/10 blur-3xl"
            />
            <h3 className="relative text-2xl font-semibold text-white">Request a demo</h3>
            <p className="relative mt-2 text-sm text-slate-300">
              We&apos;ll respond within one business day.
            </p>

            <form onSubmit={handleSubmit} className="relative mt-8 space-y-5">
              {[
                { id: "name", label: "Your name", type: "text", placeholder: "Enter your name" },
                { id: "email", label: "Email address", type: "email", placeholder: "hello@example.com" },
                { id: "salon", label: "Salon name", type: "text", placeholder: "Your salon's name" },
              ].map((field) => (
                <div key={field.id} className="group">
                  <label
                    htmlFor={field.id}
                    className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300"
                  >
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    type={field.type}
                    placeholder={field.placeholder}
                    required
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3.5 text-white placeholder:text-slate-500 outline-none transition focus:border-amber-300/80 focus:ring-4 focus:ring-amber-300/10"
                  />
                </div>
              ))}

              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                disabled={sent}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-300 px-5 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_10px_40px_-12px_rgba(252,211,77,0.6)] transition-all hover:-translate-y-0.5 hover:bg-amber-200 hover:shadow-[0_20px_60px_-12px_rgba(252,211,77,0.7)] disabled:opacity-80"
              >
                {sent ? (
                  <>
                    <Check size={16} />
                    Request sent — we&apos;ll be in touch
                  </>
                ) : (
                  <>
                    Request demo
                    <Send size={16} />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { MessageCircle, Calendar, CheckCircle2 } from "lucide-react";
import { cardEnter, staggerParent } from "@/components/motion/variants";

const steps = [
  {
    number: "01",
    icon: MessageCircle,
    title: "Tap the WhatsApp button",
    description:
      "From the website tap the green WhatsApp button — or message our number directly. No app downloads, no logins.",
  },
  {
    number: "02",
    icon: Calendar,
    title: "Pick service & slot",
    description:
      "Our assistant shows live prices and open slots for the next three days. Reply with a number — that's it.",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Confirmed instantly",
    description:
      "You get a booking reference on WhatsApp and our team is notified to prepare for your visit.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-slate-950 px-6 py-24 text-white sm:px-8 lg:px-12"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14 text-center"
        >
          <p className="text-sm uppercase tracking-[0.35em] text-amber-300">How it works</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Book your salon visit in three taps.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Skip the phone tag. Our WhatsApp booking assistant runs 24/7 and replies in seconds with
            real availability from our calendar.
          </p>
        </motion.div>

        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="relative grid gap-6 lg:grid-cols-3"
        >
          {/* Connecting line on lg+ */}
          <div
            aria-hidden
            className="absolute left-12 right-12 top-12 hidden h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent lg:block"
          />

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                variants={cardEnter}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 240, damping: 22 }}
                className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-xl shadow-slate-950/20 backdrop-blur-xl transition-colors hover:border-emerald-300/30"
              >
                <div
                  aria-hidden
                  className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                <div className="relative flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-400/10 text-emerald-300 transition-transform duration-500 group-hover:scale-110">
                    <Icon size={22} />
                  </div>
                  <span className="text-5xl font-semibold tracking-tight text-white/10 transition-colors duration-500 group-hover:text-emerald-200/30">
                    {step.number}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{step.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

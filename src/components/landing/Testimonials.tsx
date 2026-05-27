"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    quote:
      "Our booking load became seamless and clients love the easy online appointment flow. The dashboard is gorgeous.",
    author: "Ayesha",
    role: "Founder, Luxe Studio",
    initials: "AY",
  },
  {
    quote:
      "The dashboard helps me manage appointments, staff, and walk-in clients without calling. WhatsApp booking is a game-changer.",
    author: "Priya",
    role: "Head Stylist",
    initials: "PR",
  },
  {
    quote:
      "Our no-show rate dropped 40% in the first month. Customers reply on WhatsApp and confirm instantly — it just works.",
    author: "Rohit",
    role: "Salon Owner, Banjara Hills",
    initials: "RO",
  },
];

const ROTATE_MS = 6000;

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % testimonials.length),
      ROTATE_MS,
    );
    return () => window.clearInterval(id);
  }, [paused]);

  const active = testimonials[index];

  return (
    <section className="relative overflow-hidden bg-slate-950 px-6 py-24 text-white sm:px-8 lg:px-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-1/4 h-[440px] w-[440px] rounded-full bg-amber-300/8 blur-3xl"
      />

      <div className="relative mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 text-center"
        >
          <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Client praise</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Local salons trust our booking platform.
          </h2>
        </motion.div>

        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative min-h-[300px] sm:min-h-[260px]">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={index}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-2xl shadow-slate-950/20 backdrop-blur-xl sm:p-12"
              >
                <Quote
                  size={56}
                  className="absolute -top-4 left-8 text-amber-300/60"
                  strokeWidth={1.2}
                />
                <div className="flex items-center gap-1 text-amber-300">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className="fill-amber-300" />
                  ))}
                </div>
                <p className="mt-6 text-xl leading-9 text-slate-100 sm:text-2xl">
                  &ldquo;{active.quote}&rdquo;
                </p>
                <footer className="mt-8 flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-300/30 bg-amber-300/10 text-sm font-semibold text-amber-200">
                    {active.initials}
                  </span>
                  <div>
                    <p className="font-semibold text-white">{active.author}</p>
                    <p className="text-sm text-slate-400">{active.role}</p>
                  </div>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Show testimonial ${i + 1}`}
                  className="group relative h-2 w-10 overflow-hidden rounded-full bg-white/10 transition-colors hover:bg-white/20"
                >
                  {index === i && (
                    <motion.span
                      layoutId="testimonial-progress"
                      className="absolute inset-0 rounded-full bg-amber-300"
                      transition={{ type: "spring", stiffness: 280, damping: 32 }}
                    />
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setIndex((i) => (i - 1 + testimonials.length) % testimonials.length)
                }
                aria-label="Previous testimonial"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-200 transition hover:border-amber-200/60 hover:bg-white/10 hover:text-white"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setIndex((i) => (i + 1) % testimonials.length)}
                aria-label="Next testimonial"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-200 transition hover:border-amber-200/60 hover:bg-white/10 hover:text-white"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

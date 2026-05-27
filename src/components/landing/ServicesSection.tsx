"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Clock, IndianRupee } from "lucide-react";
import { cardEnter, staggerParent } from "@/components/motion/variants";

const services = [
  {
    category: "Women",
    name: "Girl Hair Cut",
    description: "Fresh layered cut with wash, sectioning, and blow-dry finish.",
    detail: "Layered fresh cut",
    duration: "45 mins",
    price: "799",
    image:
      "https://t3.ftcdn.net/jpg/16/27/26/74/240_F_1627267426_9e78jte19XWwJXBuesYeGOGMcyF2PVEG.jpg",
  },
  {
    category: "Women",
    name: "Girls Hair Styling",
    description: "Event-ready curls, smooth styling, volume work, and premium finishing.",
    detail: "Event ready style",
    duration: "60 mins",
    price: "1,299",
    image:
      "https://t4.ftcdn.net/jpg/14/71/76/33/240_F_1471763388_zVwckuVd3xCDG0x4vhFhL7m5PR11L1dl.jpg",
  },
  {
    category: "Men",
    name: "Boys Hair Cut",
    description: "Clean haircut with consultation, styling, and sharp finishing.",
    detail: "Sharp clean look",
    duration: "30 mins",
    price: "399",
    image:
      "https://t4.ftcdn.net/jpg/03/27/37/23/240_F_327372387_nDiUJ8UxnzYVwUsT3fHmUImZOL7jDZ9r.jpg",
  },
  {
    category: "Men",
    name: "Boys Facial",
    description: "Deep cleanse, scrub, massage, face mask, and hydration.",
    detail: "Clean glow facial",
    duration: "45 mins",
    price: "899",
    image:
      "https://t3.ftcdn.net/jpg/02/40/00/52/240_F_240005231_D7yUGbqeG2MZOICkZDYiQdZUUm1sQp6T.jpg",
  },
  {
    category: "Men",
    name: "Boys Hair Wash",
    description: "Relaxing hair wash, scalp cleanse, conditioning, and dry finish.",
    detail: "Scalp refresh wash",
    duration: "20 mins",
    price: "299",
    image:
      "https://t4.ftcdn.net/jpg/02/39/85/39/240_F_239853924_ZMGGCae8K7yQtxpTyxad3oun8JiGjFW9.jpg",
  },
];

type Filter = "All" | "Men" | "Women";
const filters: Filter[] = ["All", "Women", "Men"];

export default function ServicesSection({ whatsappUrl }: { whatsappUrl: string }) {
  const [filter, setFilter] = useState<Filter>("All");
  const visible = filter === "All" ? services : services.filter((s) => s.category === filter);

  return (
    <section
      id="services"
      className="relative bg-slate-950 px-6 py-24 text-slate-100 sm:px-8 lg:px-12"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/30 to-transparent"
      />
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.35em] text-amber-300/90">Premium services</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              A visual menu with photos, prices, and live booking.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            Every service shown here is bookable instantly via WhatsApp — same catalog, two surfaces.
          </p>
        </motion.div>

        <div className="mt-10 flex justify-center lg:justify-start">
          <div className="flex rounded-full border border-white/10 bg-white/5 p-1.5 backdrop-blur-xl">
            {filters.map((f) => {
              const active = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`relative z-10 rounded-full px-6 py-2 text-sm font-semibold transition-colors duration-300 ${
                    active ? "text-slate-950" : "text-slate-200 hover:text-white"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="service-filter-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-amber-300 shadow-lg shadow-amber-300/30"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            variants={staggerParent}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {visible.map((service) => (
              <motion.article
                key={`${filter}-${service.name}`}
                variants={cardEnter}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 240, damping: 22 }}
                className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-xl shadow-slate-950/20 backdrop-blur-xl transition-colors hover:border-amber-200/30"
              >
              <div className="relative h-60 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.name}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-slate-950/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-200 backdrop-blur-md">
                  {service.category}
                </span>
                <div className="absolute inset-x-4 bottom-4 flex items-end justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-amber-200/90">{service.detail}</p>
                    <h3 className="mt-1 text-xl font-semibold text-white">{service.name}</h3>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="text-sm leading-7 text-slate-300">{service.description}</p>
                <div className="mt-5 flex items-center justify-between">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-200/10 px-3 py-1 text-amber-200">
                      <Clock size={12} /> {service.duration}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-200/10 px-3 py-1 text-amber-200">
                      <IndianRupee size={12} /> {service.price}
                    </span>
                  </div>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Book ${service.name} on WhatsApp`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-300 text-slate-950 transition-transform duration-300 hover:scale-110 hover:bg-amber-200"
                  >
                    <ArrowUpRight size={18} />
                  </a>
                </div>
              </div>
              </motion.article>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

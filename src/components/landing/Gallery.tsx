"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Category = "mens" | "womens";

type GalleryImage = {
  src: string;
  alt: string;
};

const galleries: Record<Category, GalleryImage[]> = {
  mens: [
    { src: "https://t3.ftcdn.net/jpg/02/39/85/40/240_F_239854082_O0sMF4SOIWJDdwZigTjn7AFtwXJQTkZi.jpg", alt: "Men's grooming session" },
    { src: "https://t3.ftcdn.net/jpg/01/20/88/42/240_F_120884298_LMkqtyBLwgD514jbcyQtLA2L35uP2drE.jpg", alt: "Classic barbershop styling" },
    { src: "https://t4.ftcdn.net/jpg/04/69/68/17/240_F_469681744_FZWt6LKXLoCU4XVv8Cjx6ZFmwNlNLm7x.jpg", alt: "Sharp men's haircut" },
    { src: "https://t4.ftcdn.net/jpg/01/47/62/47/240_F_147624741_ysk2WzgjHxXZ8z41TIQTuy3xH48gYD2N.jpg", alt: "Men's beard trim" },
    { src: "https://t3.ftcdn.net/jpg/01/35/35/12/240_F_135351230_DOWRKVTGMFMwSOrdDJYOsC046CBVbbyf.jpg", alt: "Detailed scissor work" },
    { src: "https://t4.ftcdn.net/jpg/03/27/37/23/240_F_327372387_nDiUJ8UxnzYVwUsT3fHmUImZOL7jDZ9r.jpg", alt: "Modern men's cut" },
    { src: "https://t4.ftcdn.net/jpg/01/92/56/55/240_F_192565527_JKtN6phz6pmCde6BEsrtPhITvGIUv3t5.jpg", alt: "Men's styling finish" },
    { src: "https://t4.ftcdn.net/jpg/02/69/63/35/240_F_269633549_QijCLiqbGdwW1ynHsnul7ELl2trMpn25.jpg", alt: "Premium men's grooming" },
    { src: "https://t4.ftcdn.net/jpg/14/75/68/07/240_F_1475680734_CCjgHAnRXBjMqlBp8MAr3I9EuwjL3j59.jpg", alt: "Salon experience" },
  ],
  womens: [
    { src: "https://media.istockphoto.com/id/1305824214/photo/woman-dyeing-her-hair-at-the-salon.jpg?s=612x612&w=0&k=20&c=Jk2XQqn-5Tf1IeUPhmLYMP1Lq2nSlW_0udRXzc_KAJI=", alt: "Hair coloring service" },
    { src: "https://media.istockphoto.com/id/961867192/photo/cropped-shot-of-female-client-receiving-a-haircut.jpg?s=612x612&w=0&k=20&c=JwUPYNi8aT7vDFevhWQdA8JCaf0Oy0ZVxZ2IswwkJis=", alt: "Women's precision haircut" },
    { src: "https://media.istockphoto.com/id/1783214748/photo/processional-hair-dresser-styling-hair-of-young-woman-in-beauty-salon.jpg?s=612x612&w=0&k=20&c=XMsoEt_3hVWDmHU_FKTYecxv3z3QO2vn_g7P9sCa4h0=", alt: "Professional hair styling" },
    { src: "https://media.istockphoto.com/id/170173618/photo/young-woman-at-the-hairdressers.jpg?s=612x612&w=0&k=20&c=MX2ddKUmQw448zWrXmJiBTG9mCUYR2W_dRk0JRODDRs=", alt: "Women's salon experience" },
    { src: "https://media.istockphoto.com/id/603912306/photo/master-in-the-cabin-removes-facial-hair-strand.jpg?s=612x612&w=0&k=20&c=FdMxBRQyZNn98Cvc7Okg_dmujvsrmBHbBzr3XluzT_8=", alt: "Facial treatment" },
  ],
};

const tabs: { id: Category; label: string }[] = [
  { id: "mens", label: "Men's" },
  { id: "womens", label: "Women's" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 220, damping: 22 },
  },
};

export default function Gallery() {
  const [active, setActive] = useState<Category>("mens");
  const images = galleries[active];
  const label = active === "mens" ? "Men's" : "Women's";

  return (
    <section
      id="gallery"
      className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-24 sm:px-8 lg:px-12"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-10 text-center"
        >
          <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Gallery</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            A glimpse of the experience.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Real moments from the chair. Browse signature looks for men and women.
          </p>
        </motion.div>

        <div className="mb-8 flex justify-center sm:mb-10">
          <div className="relative flex rounded-full border border-white/10 bg-white/5 p-1.5 backdrop-blur-xl">
            {tabs.map((tab) => {
              const isActive = active === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActive(tab.id)}
                  className={`relative z-10 rounded-full px-6 py-2.5 text-sm font-semibold transition-colors duration-300 sm:px-7 ${
                    isActive ? "text-slate-950" : "text-slate-200 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="gallery-tab-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-amber-300 shadow-lg shadow-amber-300/30"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Mobile: horizontal snap carousel with peek of next slide. */}
          <motion.div
            key={`mobile-${active}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 sm:hidden"
          >
            {images.map((image) => (
              <motion.figure
                key={`m-${active}-${image.src}`}
                variants={itemVariants}
                className="group relative aspect-[3/4] w-[78vw] max-w-[320px] shrink-0 snap-start overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900 shadow-2xl shadow-black/40"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                <figcaption className="absolute inset-x-4 bottom-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-200/95">
                    {label}
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-snug text-white">{image.alt}</p>
                </figcaption>
              </motion.figure>
            ))}
            {/* trailing spacer so the last card can fully snap-start */}
            <div className="shrink-0 w-2" aria-hidden />
          </motion.div>

          {/* Tablet+: masonry grid with feature tiles. */}
          <motion.div
            key={`grid-${active}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="hidden auto-rows-[260px] grid-cols-2 gap-4 sm:grid sm:gap-5 md:grid-cols-3 lg:grid-cols-4"
          >
            {images.map((image, index) => {
              const isFeature = index % 5 === 0;
              return (
                <motion.figure
                  key={`g-${active}-${image.src}`}
                  variants={itemVariants}
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  className={`group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900 shadow-2xl shadow-black/30 ${
                    isFeature ? "row-span-2 md:col-span-2" : ""
                  }`}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
                  <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <p className="text-xs uppercase tracking-[0.3em] text-amber-200/90">{label}</p>
                    <p className="mt-2 text-base font-semibold text-white">{image.alt}</p>
                  </figcaption>
                  <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-white/0 transition duration-500 group-hover:ring-amber-300/40" />
                </motion.figure>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Swipe hint on mobile */}
        <p className="mt-2 text-center text-xs text-slate-500 sm:hidden">
          Swipe to see more →
        </p>
      </div>
    </section>
  );
}

const services = [
  {
    category: "Women",
    name: "Girl Hair Cut",
    description: "Fresh layered cut with wash, sectioning, and blow-dry finish.",
    detail: "Layered fresh cut",
    duration: "45 mins",
    price: "INR 799",
    image: "https://t3.ftcdn.net/jpg/16/27/26/74/240_F_1627267426_9e78jte19XWwJXBuesYeGOGMcyF2PVEG.jpg",
  },
  {
    category: "Women",
    name: "Girls Hair Styling",
    description: "Event-ready curls, smooth styling, volume work, and premium finishing.",
    detail: "Event ready style",
    duration: "60 mins",
    price: "INR 1,299",
    image: "https://t4.ftcdn.net/jpg/14/71/76/33/240_F_1471763388_zVwckuVd3xCDG0x4vhFhL7m5PR11L1dl.jpg",
  },
  {
    category: "Men",
    name: "Boys Hair Cut",
    description: "Clean haircut with consultation, styling, and sharp finishing.",
    detail: "Sharp clean look",
    duration: "30 mins",
    price: "INR 399",
    image: "https://t4.ftcdn.net/jpg/03/27/37/23/240_F_327372387_nDiUJ8UxnzYVwUsT3fHmUImZOL7jDZ9r.jpg",
  },
  {
    category: "Men",
    name: "Boys Facial",
    description: "Deep cleanse, scrub, massage, face mask, and hydration.",
    detail: "Clean glow facial",
    duration: "45 mins",
    price: "INR 899",
    image: "https://t3.ftcdn.net/jpg/02/40/00/52/240_F_240005231_D7yUGbqeG2MZOICkZDYiQdZUUm1sQp6T.jpg",
  },
  {
    category: "Men",
    name: "Boys Hair Wash",
    description: "Relaxing hair wash, scalp cleanse, conditioning, and dry finish.",
    detail: "Scalp refresh wash",
    duration: "20 mins",
    price: "INR 299",
    image: "https://t4.ftcdn.net/jpg/02/39/85/39/240_F_239853924_ZMGGCae8K7yQtxpTyxad3oun8JiGjFW9.jpg",
  },
];

export default function ServicesSection() {
  return (
    <section className="bg-slate-950 px-6 py-20 text-slate-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.35em] text-amber-300/80">Premium services</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              A visual salon menu with photos, prices, and quick service details.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            The same catalog is used for the website showcase and WhatsApp service flow.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <div key={service.name} className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-lg shadow-slate-950/10 backdrop-blur-xl">
              <img src={service.image} alt={service.name} className="h-56 w-full object-cover" />
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200/80">{service.category}</p>
                <h3 className="mt-3 text-xl font-semibold text-white">{service.name}</h3>
                <p className="mt-2 text-sm font-medium text-amber-100">{service.detail}</p>
                <p className="mt-4 text-sm leading-7 text-slate-300">{service.description}</p>
                <div className="mt-6 flex flex-wrap gap-3 text-sm text-amber-200">
                  <span className="rounded-full bg-amber-200/10 px-3 py-1">{service.duration}</span>
                  <span className="rounded-full bg-amber-200/10 px-3 py-1">{service.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

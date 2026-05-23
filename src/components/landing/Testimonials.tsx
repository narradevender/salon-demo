const testimonials = [
  {
    quote: "Our booking load became seamless and clients love the easy online appointment flow.",
    author: "Ayesha, Salon Owner",
    role: "Founder, Luxe Studio",
  },
  {
    quote: "The dashboard helps me manage appointments, staff, and walk-in clients without calling.",
    author: "Priya, Bridal Expert",
    role: "Head Stylist",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-slate-950 px-6 py-20 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Client praise</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight">Local salons trust our booking platform.</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {testimonials.map((item) => (
            <blockquote key={item.author} className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-xl shadow-slate-950/15 backdrop-blur-xl">
              <p className="text-lg leading-8 text-slate-100">“{item.quote}”</p>
              <footer className="mt-6 text-sm text-slate-400">
                <p className="font-semibold text-white">{item.author}</p>
                <p>{item.role}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Phone, MapPin } from "lucide-react";

export default function ContactSection() {
  return (
    <section className="bg-slate-950 px-6 py-20 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Get in touch</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight">Start accepting appointments with a premium experience.</h2>
            <p className="mt-6 max-w-xl text-sm leading-7 text-slate-300">
              Build your salon’s online presence and convert walk-in interest into confirmed bookings, all from one elegant dashboard.
            </p>
            <div className="mt-10 space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-amber-300/15 text-amber-200">
                  <Phone size={20} />
                </span>
                <div>
                  <p className="text-sm text-slate-400">Phone</p>
                  <p className="text-base font-semibold text-white">+1 415 523 8886</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-amber-300/15 text-amber-200">
                  <MapPin size={20} />
                </span>
                <div>
                  <p className="text-sm text-slate-400">Hyderabad Studio</p>
                  <p className="text-base font-semibold text-white">Banjara Hills, Hyderabad</p>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-xl shadow-slate-950/10 backdrop-blur-xl">
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="text-sm font-medium text-slate-200">
                  Your name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-300/10"
                />
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-medium text-slate-200">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="hello@example.com"
                  className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-300/10"
                />
              </div>
              <button type="submit" className="inline-flex w-full items-center justify-center rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200">
                Request demo
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

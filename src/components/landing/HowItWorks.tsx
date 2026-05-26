const steps = [
  {
    number: "01",
    title: "Tap the WhatsApp button",
    description:
      "From the website, tap the green WhatsApp button — or message our number directly. No app downloads, no logins.",
  },
  {
    number: "02",
    title: "Pick service & slot",
    description:
      "Our assistant shows live prices and open slots for the next three days. Reply with a number — that's it.",
  },
  {
    number: "03",
    title: "Confirmed instantly",
    description:
      "You get a booking reference on WhatsApp and our team is notified to prepare for your visit.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-slate-950 px-6 py-20 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-300">How it works</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight">
            Book your salon visit in three taps on WhatsApp.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Skip the phone tag. Our WhatsApp booking assistant runs 24/7 and replies in seconds with real
            availability from our calendar.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-xl shadow-slate-950/15 backdrop-blur-xl transition hover:border-emerald-400/30 hover:bg-white/10"
            >
              <span className="text-5xl font-semibold tracking-tight text-emerald-300/70">
                {step.number}
              </span>
              <h3 className="mt-6 text-xl font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

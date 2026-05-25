import { ArrowUpRight } from "lucide-react";
import { getSalonWhatsAppUrl } from "@/lib/salon-whatsapp";

const insideImages = [
  {
    src: "https://lh3.googleusercontent.com/p/AF1QipO4Bo_LPs4YwL28Z9lfu5OluvHlsUYQYYH3PRR1=w800-h600-n-k-no-nu",
    alt: "Inside NyCAA 14 salon",
  },
];

const ownerImage =
  "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGyKBOurHe7eAu8lq4zaFqsWt_fghl5TeuV2vcwSkUpGSlTe7irtJK7ZOdSJYOKTbXm-RieVWaqlaxl3YZ1TPcNVaLt6207zck_4eKPD1WNvnolKjyrfnfMfroyQn6vuL7tTtdhF-Qwdo8=s1360-w1360-h1020-rw";

const customerImages = [
  {
    src: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHDktWEe8BTRpA5lGhsUCE705Pc5KMyc98pmM6zkfgoWuccFv9RnT5PNMAIWoFjog-xe-Ua6g1ulZacn2qSRd5KyNnNDfsCzt-BXcMU2ENr0L3GKBH_MvMbF0bCJvy8KctMb3RruHVJ1Mo=w800-h600-n-k-no-nu",
    alt: "Owner with a happy customer",
  },
  {
    src: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGQOMSjHhxQ8nyPNcxr6uVXtTmBA8WEcwC74ZV05zowaSaqCuAPORB8Un3HrzzEVKR6Fc-NWCt8dqjWyGpSUuNGwR-S9n8uFBMN8a4t05ZOXbBTFbVqzOOZFF6AKkwh_rkg-a1d=w800-h600-n-k-no-nu",
    alt: "International guest at NyCAA 14",
  },
  {
    src: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHIEDu0mb9Ivw7FmHdZTSOdnint4c0MbJtV2Xy9OOcFEJRNHcpjakpwjQG4fiss3v-_-aENQgFwBQWR0PYfgRbNrALk_78OG60cnfNiwG793cbnAg8uQpuPNP4aTDVXUos5aujE=w800-h1320-n-k-no-nu",
    alt: "Fresh styling at NyCAA 14",
  },
];

const ownerPost = {
  src: "https://lh3.googleusercontent.com/p/AF1QipMPgOFil_p-bDM2bUNqO5HaB39GOYJFY-lgQlIM=s1360-w1360-h1020-rw",
  alt: "Boys facial wash benefits — poster by NyCAA 14",
};

const STREET_VIEW_URL =
  "https://www.google.com/local/place/fid/0x3bcb919e7e96df39:0x363c56a7d88ad4d4/photosphere?iu=https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid%3DcvNOoulLp2LLsYnNh5CsWg%26cb_client%3Dlu.gallery.gps%26w%3D160%26h%3D106%26yaw%3D73.14782%26pitch%3D0%26thumbfov%3D100&ik=CAISFmN2Tk9vdWxMcDJMTHNZbk5oNUNzV2c%3D";

export default function Portfolio() {
  return (
    <section
      id="portfolio"
      className="relative scroll-mt-20 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-24 sm:px-8 lg:px-12"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl space-y-20">
        <header className="text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Portfolio</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Inside NyCAA 14.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Step into our space, meet our owner, and see the people we&apos;ve had the pleasure of styling.
          </p>
        </header>

        <div className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">Our space</p>
              <h3 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Inside the salon</h3>
            </div>
            <a
              href={STREET_VIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-amber-100 transition hover:border-amber-200 hover:text-white sm:inline-flex"
            >
              Take a 360° tour
              <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {insideImages.map((image) => (
              <figure
                key={image.src}
                className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900 shadow-2xl shadow-black/30"
              >
                <img src={image.src} alt={image.alt} loading="lazy" className="h-72 w-full object-cover" />
              </figure>
            ))}
            <a
              href={STREET_VIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex h-72 flex-col items-center justify-center gap-3 overflow-hidden rounded-[1.75rem] border border-amber-300/40 bg-amber-300/10 p-6 text-center transition hover:bg-amber-300/15"
            >
              <span className="text-3xl">🌐</span>
              <p className="text-base font-semibold text-amber-100">Explore in 360°</p>
              <p className="text-xs text-slate-300">Open on Google Street View</p>
              <ArrowUpRight size={18} className="text-amber-200 transition group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <figure className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-2xl shadow-black/30">
            <img
              src={ownerImage}
              alt="Owner of NyCAA 14 salon"
              loading="lazy"
              className="h-[460px] w-full object-cover"
            />
          </figure>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">Meet the founder</p>
            <h3 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
              The owner behind the chair.
            </h3>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Hands-on every day, our founder personally trains the team and curates the experience at NyCAA 14. Whether you&apos;re here for a quick wash or a full styling, you&apos;re in expert hands.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-200/80">Years of experience</p>
                <p className="mt-2 text-2xl font-semibold text-white">10+</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-200/80">Happy clients</p>
                <p className="mt-2 text-2xl font-semibold text-white">5,000+</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">Guests</p>
            <h3 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Customer moments</h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
              From the neighbourhood to international travellers — guests trust NyCAA 14 for a polished, friendly experience.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {customerImages.map((image) => (
              <figure
                key={image.src}
                className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900 shadow-2xl shadow-black/30"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className="h-80 w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-200/90">
                    {image.alt}
                  </p>
                </div>
              </figure>
            ))}
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">From our owner</p>
            <h3 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
              Tips, education, and care advice.
            </h3>
            <p className="mt-4 text-base leading-7 text-slate-300">
              We share grooming tips, treatment benefits, and aftercare guidance so you can keep that fresh-from-the-salon look longer.
            </p>
            <a
              href={getSalonWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-amber-200"
            >
              Book on WhatsApp
              <ArrowUpRight size={16} />
            </a>
          </div>
          <figure className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-2xl shadow-black/30">
            <img
              src={ownerPost.src}
              alt={ownerPost.alt}
              loading="lazy"
              className="h-[460px] w-full object-cover"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}

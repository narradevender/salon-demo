import { Phone, MapPin, Compass } from "lucide-react";

const MAPS_URL = "https://share.google/q1b0l3sm8EWFrrkqo";
const STREET_VIEW_URL =
  "https://www.google.com/local/place/fid/0x3bcb919e7e96df39:0x363c56a7d88ad4d4/photosphere?iu=https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid%3DcvNOoulLp2LLsYnNh5CsWg%26cb_client%3Dlu.gallery.gps%26w%3D160%26h%3D106%26yaw%3D73.14782%26pitch%3D0%26thumbfov%3D100&ik=CAISFmN2Tk9vdWxMcDJMTHNZbk5oNUNzV2c%3D";

export default function ContactSection() {
  return (
    <section id="contact" className="scroll-mt-20 bg-slate-950 px-6 py-20 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Visit NyCAA 14</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight">
              Drop by, or book ahead on WhatsApp.
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-7 text-slate-300">
              We&apos;re open every day. Walk-ins welcome — but booking on WhatsApp guarantees your slot.
            </p>
            <div className="mt-10 space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-amber-300/15 text-amber-200">
                  <Phone size={20} />
                </span>
                <div>
                  <p className="text-sm text-slate-400">WhatsApp</p>
                  <p className="text-base font-semibold text-white">+91 79818 98151</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-amber-300/15 text-amber-200">
                  <MapPin size={20} />
                </span>
                <div>
                  <p className="text-sm text-slate-400">Location</p>
                  <a
                    href={MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-semibold text-white hover:text-amber-200"
                  >
                    NyCAA 14, Hyderabad
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-amber-300/15 text-amber-200">
                  <Compass size={20} />
                </span>
                <div>
                  <p className="text-sm text-slate-400">Virtual tour</p>
                  <a
                    href={STREET_VIEW_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-semibold text-white hover:text-amber-200"
                  >
                    Open 360° view
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-xl shadow-slate-950/10 backdrop-blur-xl">
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="block">
              <div className="relative">
                <img
                  src="https://lh3.googleusercontent.com/p/AF1QipO4Bo_LPs4YwL28Z9lfu5OluvHlsUYQYYH3PRR1=w1200-h800-n-k-no-nu"
                  alt="NyCAA 14 location preview"
                  className="h-[420px] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-200">Get directions</p>
                  <p className="mt-2 text-xl font-semibold text-white">View NyCAA 14 on Google Maps</p>
                  <p className="mt-1 text-sm text-slate-300">Tap to open in your maps app.</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

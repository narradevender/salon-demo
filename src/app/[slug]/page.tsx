import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { toWhatsAppNumber } from "@/lib/phone";
import BookingFlow from "@/components/booking/BookingFlow";

export const dynamicParams = true;

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function SalonPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createServerSupabase();
  const whatsappMessage = encodeURIComponent(
    "Hi, I want to book an appointment. Please share your services list, available slots, prices, and booking confirmation details.",
  );
  const { data: salon, error: salonError } = await supabase
    .from("salons")
    .select("id,name,description,whatsapp_number")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (salonError || !salon) {
    return notFound();
  }

  const whatsappNumber = toWhatsAppNumber(
    salon.whatsapp_number ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
  );

  const { data: services } = await supabase
    .from("services")
    .select("id,name,description,duration_minutes,price,benefits")
    .eq("salon_id", salon.id)
    .eq("is_active", true)
    .order("price", { ascending: true });

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_0.9fr] lg:items-center">
            <div className="space-y-5">
              <p className="text-sm uppercase tracking-[0.35em] text-amber-300">{salon.name}</p>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Experience a smoother way to book beauty services.</h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{salon.description ?? "A premium salon experience with automated scheduling, modern customer journeys, and WhatsApp appointment support."}</p>
              <div className="flex flex-wrap items-center gap-4">
                {whatsappNumber && (
                  <a
                    className="inline-flex rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
                    href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    WhatsApp booking
                  </a>
                )}
                <span className="rounded-full bg-white/5 px-4 py-2 text-sm text-slate-300">Live availability included</span>
              </div>
            </div>
            <div className="rounded-[2rem] bg-slate-950/90 p-8 shadow-xl shadow-black/20">
              <h2 className="text-lg font-semibold text-white">Fast booking preview</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">Select a service, choose your date and slot, then confirm instantly.</p>
              <div className="mt-8 grid gap-3">
                {services?.map((service) => (
                  <div key={service.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-white">{service.name}</p>
                        <p className="mt-2 text-sm text-slate-300">{service.description}</p>
                      </div>
                      <p className="text-sm font-semibold text-amber-200">₹{service.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <BookingFlow salonId={salon.id} salonName={salon.name} whatsappNumber={salon.whatsapp_number} services={(services ?? []).map((service) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        duration_minutes: service.duration_minutes,
        price: service.price,
        benefits: service.benefits,
      }))} />
    </main>
  );
}

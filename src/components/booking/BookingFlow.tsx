"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toWhatsAppNumber } from "@/lib/phone";
import { bookingPayloadSchema } from "@/lib/validators";
import type { ServiceCard } from "@/types/salon";

type BookingFormData = z.input<typeof bookingPayloadSchema>;

type Props = {
  salonId: string;
  salonName: string;
  whatsappNumber: string | null;
  services: ServiceCard[];
};

type SlotItem = {
  id: string;
  start_time: string;
  end_time: string;
  is_blocked: boolean;
  display: string;
};

type AvailabilityResponse = {
  slots?: Array<Omit<SlotItem, "display">>;
};

const DEFAULT_WHATSAPP_NUMBER = "+917981898151";

export default function BookingFlow({ salonId, salonName, whatsappNumber, services }: Props) {
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingPayloadSchema),
    defaultValues: {
      salonId,
      serviceId: services[0]?.id ?? "",
      name: "",
      email: "",
      phone: "",
      date: new Date().toISOString().slice(0, 10),
      slotId: "",
      notes: "",
    },
  });

  const serviceId = useWatch({ control: form.control, name: "serviceId" });
  const selectedDate = useWatch({ control: form.control, name: "date" });

  const selectedService = useMemo(
    () => services.find((service) => service.id === serviceId) ?? services[0],
    [services, serviceId]
  );
  const whatsappNumberWithCountryCode = toWhatsAppNumber(
    whatsappNumber ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? DEFAULT_WHATSAPP_NUMBER
  );
  const whatsappMessage = encodeURIComponent(
    `#SALON Hi, I want to book an appointment at ${salonName}. Please share available slots, prices, and confirmation details.${
      selectedService?.name ? ` Service: ${selectedService.name}.` : ""
    } Date: ${selectedDate}.`
  );

  useEffect(() => {
    if (!serviceId || !selectedDate) return;

    fetch(`/api/availability?salonId=${encodeURIComponent(salonId)}&serviceId=${encodeURIComponent(serviceId)}&date=${encodeURIComponent(selectedDate)}`)
      .then((res) => res.json())
      .then((data: AvailabilityResponse) => {
        setSlots(
          (data?.slots ?? []).map((slot) => ({
            id: slot.id,
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_blocked: slot.is_blocked,
            display: new Date(slot.start_time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          }))
        );
        setStatus("idle");
      })
      .catch(() => {
        setStatus("error");
        setMessage("Unable to load available slots. Please try again.");
      });
  }, [serviceId, selectedDate, salonId]);

  const onSubmit = async (values: BookingFormData) => {
    setStatus("loading");
    setMessage("");

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const payload = await response.json();
    if (!response.ok) {
      setStatus("error");
      setMessage(payload?.error ?? "Booking could not be completed.");
      return;
    }

    setStatus("success");
    setMessage("Appointment confirmed! A confirmation email is on the way.");
    form.reset({
      ...values,
      salonId,
      name: values.name,
      email: values.email,
      phone: values.phone,
      serviceId: values.serviceId,
      date: values.date,
      slotId: values.slotId,
      notes: "",
    });
  };

  return (
    <section className="bg-slate-950 px-6 py-20 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_0.9fr] lg:items-start">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Book your appointment</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">Reserve an elegant salon experience in Hyderabad.</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Pick a service, choose an available slot, and confirm instantly. Our system prevents double bookings and maintains live availability.
              </p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/15 backdrop-blur-xl">
              <div className="space-y-4">
                <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-300">
                  <p className="font-semibold text-white">Salon</p>
                  <p>{salonName}</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-4">
                  <p className="text-sm text-slate-300">Selected service</p>
                  <p className="mt-2 text-lg font-semibold text-white">{selectedService?.name}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{selectedService?.description}</p>
                </div>
              </div>
            </div>
          </div>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="text-slate-300">Service</span>
                <select className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none" {...form.register("serviceId")}> 
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm">
                <span className="text-slate-300">Choose date</span>
                <input className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none" type="date" {...form.register("date")} />
              </label>
            </div>
            <label className="space-y-2 text-sm">
              <span className="text-slate-300">Available slot</span>
              <select className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none" {...form.register("slotId")}> 
                <option value="">Select a slot</option>
                {slots.map((slot) => (
                  <option key={slot.id} value={slot.id} disabled={slot.is_blocked}>
                    {slot.display}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="text-slate-300">Name</span>
                <input className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none" type="text" {...form.register("name")} />
              </label>
              <label className="space-y-2 text-sm">
                <span className="text-slate-300">Email</span>
                <input className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none" type="email" {...form.register("email")} />
              </label>
            </div>
            <label className="space-y-2 text-sm">
              <span className="text-slate-300">Phone number</span>
              <input className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none" type="tel" {...form.register("phone")} />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-slate-300">Notes</span>
              <textarea className="min-h-[120px] w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none" {...form.register("notes")} />
            </label>
            <div className="flex items-center justify-between gap-4 text-sm text-slate-300">
              <p>Live slots update on date and service selection.</p>
              <span className="rounded-full bg-white/5 px-3 py-1 text-amber-200">Mobile-first</span>
            </div>
            <button type="submit" className="w-full rounded-full bg-amber-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-200" disabled={status === "loading"}>
              {status === "loading" ? "Confirming..." : "Confirm Booking"}
            </button>
            {message && (
              <div className={`rounded-3xl p-4 text-sm ${status === "success" ? "bg-emerald-500/10 text-emerald-200" : "bg-rose-500/10 text-rose-200"}`}>
                {message}
              </div>
            )}
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
              <p className="font-semibold text-white">Need help?</p>
              <p>Tap WhatsApp to ask for services, slots, prices, and custom requests.</p>
              <a
                href={`https://wa.me/${whatsappNumberWithCountryCode}?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex rounded-full bg-emerald-500 px-4 py-2 font-semibold text-white transition hover:bg-emerald-400"
              >
                Ask on WhatsApp
              </a>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

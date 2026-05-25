import ContactSection from "@/components/landing/ContactSection";
import Hero from "@/components/landing/Hero";
import Navbar from "@/components/landing/Navbar";
import Portfolio from "@/components/landing/Portfolio";
import ServicesSection from "@/components/landing/ServicesSection";
import WhatsAppFab from "@/components/landing/WhatsAppFab";

export const metadata = {
  title: "NyCAA 14 Salon | Hair, Styling & Grooming in Hyderabad",
  description:
    "NyCAA 14 — a premium neighbourhood salon in Hyderabad. Hair, styling, facials, and grooming for men and women. Book on WhatsApp.",
};

export default function Home() {
  return (
    <div className="bg-slate-950 text-slate-100">
      <Navbar />
      <Hero />
      <ServicesSection />
      <Portfolio />
      <ContactSection />
      <WhatsAppFab />
    </div>
  );
}

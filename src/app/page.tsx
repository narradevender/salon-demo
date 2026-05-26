import ContactSection from "@/components/landing/ContactSection";
import Gallery from "@/components/landing/Gallery";
import Hero from "@/components/landing/Hero";
import ServicesSection from "@/components/landing/ServicesSection";
import Testimonials from "@/components/landing/Testimonials";
import WhatsAppFab from "@/components/landing/WhatsAppFab";

export const metadata = {
  title: "Salon Demo | Luxury Salon Booking Platform",
  description: "Mobile-first salon appointment booking SaaS for Hyderabad salons.",
};

export default function Home() {
  return (
    <div className="bg-slate-950 text-slate-100">
      <Hero />
      <ServicesSection />
      <Testimonials />
      <Gallery />
      <ContactSection />
      <WhatsAppFab />
    </div>
  );
}

import ContactSection from "@/components/landing/ContactSection";
import Footer from "@/components/landing/Footer";
import Gallery from "@/components/landing/Gallery";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Navigation from "@/components/landing/Navigation";
import ServicesSection from "@/components/landing/ServicesSection";
import Testimonials from "@/components/landing/Testimonials";
import WhatsAppFab from "@/components/landing/WhatsAppFab";
import { getSalonWhatsAppUrl } from "@/lib/salon-whatsapp";

export const metadata = {
  title: "Glow Studio | Luxury Salon Booking",
  description: "Mobile-first salon appointment booking platform for premium salons in Hyderabad.",
};

export default function Home() {
  const whatsappUrl = getSalonWhatsAppUrl();

  return (
    <div className="bg-slate-950 text-slate-100">
      <Navigation whatsappUrl={whatsappUrl} />
      <Hero whatsappUrl={whatsappUrl} />
      <ServicesSection whatsappUrl={whatsappUrl} />
      <HowItWorks />
      <Testimonials />
      <Gallery />
      <ContactSection whatsappUrl={whatsappUrl} />
      <Footer whatsappUrl={whatsappUrl} />
      <WhatsAppFab href={whatsappUrl} />
    </div>
  );
}

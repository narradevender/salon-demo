export type SalonOverview = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  whatsapp_number: string | null;
  logo_url: string | null;
};

export type ServiceCard = {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  benefits: string | null;
};

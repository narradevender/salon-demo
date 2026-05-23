import { z } from "zod";

export const bookingPayloadSchema = z.object({
  salonId: z.string().uuid(),
  serviceId: z.string().uuid(),
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(8, "Enter a valid phone number"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid date"),
  slotId: z.string().uuid(),
  notes: z.string().max(250).optional(),
});

export const availabilityQuerySchema = z.object({
  salonId: z.string().uuid(),
  serviceId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

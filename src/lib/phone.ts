export function toWhatsAppNumber(phoneNumber: string | null | undefined) {
  const digits = phoneNumber?.replace(/\D/g, "").replace(/^0+/, "") ?? "";

  if (!digits) return "";

  return digits.length === 10 ? `91${digits}` : digits;
}


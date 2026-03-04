import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

export function whatsappUrl(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, "");
  const url = `https://wa.me/55${digits}`;
  return message ? `${url}?text=${encodeURIComponent(message)}` : url;
}

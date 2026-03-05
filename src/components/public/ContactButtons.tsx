"use client";

import { motion } from "framer-motion";
import {
  MessageCircle,
  Phone,
  Mail,
  Instagram,
  ExternalLink,
} from "lucide-react";
import type { ContactFull } from "@/types";
import { formatPhone, whatsappUrl } from "@/lib/utils";

interface ContactButtonsProps {
  contacts: ContactFull[];
}

const iconMap = {
  WHATSAPP: MessageCircle,
  PHONE: Phone,
  EMAIL: Mail,
  INSTAGRAM: Instagram,
  OTHER: ExternalLink,
};

function getContactAriaLabel(contact: ContactFull): string {
  switch (contact.type) {
    case "WHATSAPP":
      return `Enviar mensagem pelo WhatsApp para ${contact.value}`;
    case "PHONE":
      return `Ligar para ${contact.value}`;
    case "EMAIL":
      return `Enviar email para ${contact.value}`;
    case "INSTAGRAM":
      return `Ver perfil no Instagram: ${contact.value}`;
    default:
      return contact.label;
  }
}

function getContactHref(contact: ContactFull): string {
  switch (contact.type) {
    case "WHATSAPP":
      return contact.url || whatsappUrl(contact.value);
    case "PHONE":
      return `tel:+55${contact.value.replace(/\D/g, "")}`;
    case "EMAIL":
      return `mailto:${contact.value}`;
    case "INSTAGRAM":
      return contact.url || `https://instagram.com/${contact.value.replace("@", "")}`;
    default:
      return contact.url || "#";
  }
}

function getContactDisplay(contact: ContactFull): string {
  switch (contact.type) {
    case "WHATSAPP":
    case "PHONE":
      return formatPhone(contact.value);
    default:
      return contact.value;
  }
}

export function ContactButtons({ contacts }: ContactButtonsProps) {
  const visibleContacts = contacts.filter((c) => c.isVisible);
  if (visibleContacts.length === 0) return null;

  return (
    <section id="contato" className="mx-auto max-w-lg px-6 mt-8">
      <div className="flex flex-col gap-2.5">
        {visibleContacts.map((contact, i) => {
          const Icon = iconMap[contact.type] || ExternalLink;
          const isWhatsApp = contact.type === "WHATSAPP";

          return (
            <motion.a
              key={contact.id}
              href={getContactHref(contact)}
              target={
                contact.type === "INSTAGRAM" || contact.type === "OTHER"
                  ? "_blank"
                  : undefined
              }
              rel={
                contact.type === "INSTAGRAM" || contact.type === "OTHER"
                  ? "noopener noreferrer"
                  : undefined
              }
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.1, 0.4) }}
              aria-label={getContactAriaLabel(contact)}
              className={`flex items-center gap-3 rounded-xl h-[52px] px-5 font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                isWhatsApp
                  ? "bg-whatsapp text-white animate-breathe hover:brightness-110"
                  : "bg-surface text-text border border-text/5 hover:border-accent/30 hover:shadow-sm"
              }`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${
                  isWhatsApp ? "text-white" : "text-primary"
                }`}
              />
              <span className="flex-1 text-sm">{contact.label}</span>
              <span
                className={`text-sm ${
                  isWhatsApp ? "text-white/80" : "text-text-muted"
                }`}
              >
                {getContactDisplay(contact)}
              </span>
            </motion.a>
          );
        })}
      </div>
    </section>
  );
}

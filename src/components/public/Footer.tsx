"use client";

import { motion } from "framer-motion";
import { Instagram, Mail, Phone } from "lucide-react";
import type { ContactFull } from "@/types";

interface FooterProps {
  contacts: ContactFull[];
  displayName: string;
}

export function Footer({ contacts, displayName }: FooterProps) {
  const instagram = contacts.find((c) => c.type === "INSTAGRAM" && c.isVisible);
  const email = contacts.find((c) => c.type === "EMAIL" && c.isVisible);
  const phone = contacts.find(
    (c) => (c.type === "PHONE" || c.type === "WHATSAPP") && c.isVisible
  );

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="mt-16 pb-8"
    >
      <div className="mx-auto max-w-lg px-6">
        {/* Divider */}
        <div className="h-px bg-accent/30 mb-8" />

        {/* Social icons */}
        <div className="flex justify-center gap-4 mb-4">
          {instagram?.url && (
            <a
              href={instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-primary/10 p-2.5 text-primary hover:bg-primary hover:text-white transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email.value}`}
              className="rounded-full bg-primary/10 p-2.5 text-primary hover:bg-primary hover:text-white transition-colors"
            >
              <Mail className="h-5 w-5" />
            </a>
          )}
          {phone && (
            <a
              href={`tel:+55${phone.value.replace(/\D/g, "")}`}
              className="rounded-full bg-primary/10 p-2.5 text-primary hover:bg-primary hover:text-white transition-colors"
            >
              <Phone className="h-5 w-5" />
            </a>
          )}
        </div>

        {/* Name */}
        <p className="text-center font-heading text-lg text-primary">
          {displayName}
        </p>

        {/* Attribution */}
        <p className="mt-2 text-center text-xs text-text-muted/60">
          &copy; {new Date().getFullYear()} &middot; Todos os direitos reservados
        </p>
      </div>
    </motion.footer>
  );
}

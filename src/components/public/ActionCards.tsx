"use client";

import { motion } from "framer-motion";
import { Briefcase, MessageCircle, ArrowRight } from "lucide-react";

export function ActionCards() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.2 }}
      className="mx-auto max-w-lg px-6 mt-8 flex flex-col sm:flex-row gap-3"
    >
      <button
        onClick={() => scrollTo("projetos")}
        className="group flex-1 flex items-center gap-4 rounded-2xl bg-primary p-6 text-left text-white transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Briefcase className="h-6 w-6 text-accent shrink-0" />
        <div className="flex-1">
          <span className="text-base font-medium">Portfolio</span>
          <p className="text-xs text-white/60 mt-0.5">Ver projetos</p>
        </div>
        <ArrowRight className="h-5 w-5 text-accent transition-transform group-hover:translate-x-1" />
      </button>

      <button
        onClick={() => scrollTo("contato")}
        className="group flex-1 flex items-center gap-4 rounded-2xl bg-primary p-6 text-left text-white transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <MessageCircle className="h-6 w-6 text-accent shrink-0" />
        <div className="flex-1">
          <span className="text-base font-medium">Contato</span>
          <p className="text-xs text-white/60 mt-0.5">Iniciar projeto</p>
        </div>
        <ArrowRight className="h-5 w-5 text-accent transition-transform group-hover:translate-x-1" />
      </button>
    </motion.div>
  );
}

"use client";

import type { PublicData } from "@/types";
import { ScrollProgress } from "@/components/public/ScrollProgress";
import { HeroSection } from "@/components/public/HeroSection";
import { ActionCards } from "@/components/public/ActionCards";
import { ContactButtons } from "@/components/public/ContactButtons";
import { ProjectsGallery } from "@/components/public/ProjectsGallery";
import { Footer } from "@/components/public/Footer";

interface PublicPageProps {
  data: PublicData;
}

export function PublicPage({ data }: PublicPageProps) {
  const { profile, projects, contacts } = data;

  return (
    <main className="min-h-screen">
      <ScrollProgress />
      <HeroSection profile={profile} />
      <ActionCards />
      <ContactButtons contacts={contacts} />
      <ProjectsGallery projects={projects} />
      <Footer
        contacts={contacts}
        displayName={profile?.displayName || "Fernanda"}
        professionalRegistration={profile?.professionalRegistration}
      />
    </main>
  );
}

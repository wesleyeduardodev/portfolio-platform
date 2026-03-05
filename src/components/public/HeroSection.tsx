"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { ProfileFull } from "@/types";

interface HeroSectionProps {
  profile: ProfileFull | null;
}

export function HeroSection({ profile }: HeroSectionProps) {
  if (!profile) return null;

  return (
    <section className="relative" aria-label="Apresentação">
      {/* Cover Photo */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative h-[45vh] md:h-[50vh] w-full overflow-hidden"
      >
        {profile.coverPhotoUrl ? (
          <Image
            src={profile.coverPhotoUrl}
            alt=""
            role="presentation"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="h-full w-full bg-primary" />
        )}
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, var(--color-bg) 0%, transparent 60%)",
          }}
        />
      </motion.div>

      {/* Profile Photo + Info */}
      <div className="relative mx-auto max-w-lg px-6 -mt-[60px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col items-center"
        >
          {/* Profile Photo */}
          <div className="relative h-[96px] w-[96px] sm:h-[120px] sm:w-[120px] rounded-full border-4 border-white shadow-lg overflow-hidden bg-surface">
            {profile.profilePhotoUrl ? (
              <Image
                src={profile.profilePhotoUrl}
                alt={profile.displayName}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 96px, 120px"
                priority
              />
            ) : (
              <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-heading">
                {profile.displayName.charAt(0)}
              </div>
            )}
          </div>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-4 text-center font-heading text-[32px] md:text-[48px] font-semibold leading-tight text-primary"
          >
            {profile.displayName}
          </motion.h1>

          {/* Title */}
          {profile.title && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-1 text-center text-sm md:text-base text-text-muted tracking-wide"
            >
              {profile.title}
            </motion.p>
          )}

          {/* Bio */}
          {profile.bio && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="mt-3 text-center text-sm text-text-muted/80 leading-relaxed max-w-sm"
            >
              {profile.bio}
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  );
}

import type { Project, Media, Profile, Contact } from "@prisma/client";

export type ProjectWithMedia = Project & {
  media: Media[];
  coverMedia: Media | null;
};

export type ProfileFull = Profile;

export type ContactFull = Contact;

export type PublicData = {
  profile: ProfileFull | null;
  projects: ProjectWithMedia[];
  contacts: ContactFull[];
};

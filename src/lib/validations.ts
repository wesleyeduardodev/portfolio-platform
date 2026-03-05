import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export const profileSchema = z.object({
  displayName: z.string().min(1, "Nome é obrigatório"),
  title: z.string().optional(),
  bio: z.string().optional(),
  professionalRegistration: z.string().optional(),
});

export const projectSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  isVisible: z.boolean(),
  isFeatured: z.boolean(),
});

export const contactSchema = z.object({
  type: z.enum(["WHATSAPP", "PHONE", "EMAIL", "INSTAGRAM", "OTHER"]),
  label: z.string().min(1, "Label é obrigatório"),
  value: z.string().min(1, "Valor é obrigatório"),
  url: z.string().url().optional().or(z.literal("")),
  isVisible: z.boolean(),
});

export const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      sortOrder: z.number().int(),
    })
  ),
});

export const securitySchema = z
  .object({
    email: z.string().email("Email inválido"),
    currentPassword: z.string().min(1, "Senha atual é obrigatória"),
    newPassword: z.string().optional(),
  })
  .refine(
    (data) => !data.newPassword || data.newPassword.length >= 6,
    { message: "Mínimo 6 caracteres", path: ["newPassword"] }
  );

export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type SecurityInput = z.infer<typeof securitySchema>;

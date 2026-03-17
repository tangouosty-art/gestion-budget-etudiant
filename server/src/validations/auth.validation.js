const { z } = require("zod");

const registerSchema = z.object({
  email: z.email("Email invalide").trim().toLowerCase(),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères")
    .max(100, "Le mot de passe est trop long"),
});

const loginSchema = z.object({
  email: z.email("Email invalide").trim().toLowerCase(),
  password: z.string().min(1, "Mot de passe requis"),
});

module.exports = {
  registerSchema,
  loginSchema,
};
const { z } = require("zod");

const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Le titre doit contenir au moins 2 caractères")
    .max(150, "Le titre est trop long"),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  due_date: z.string().optional().or(z.literal("")),
  status: z.enum(["a_faire", "en_cours", "terminee"]).optional(),
});

const updateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Le titre doit contenir au moins 2 caractères")
    .max(150, "Le titre est trop long")
    .optional(),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  due_date: z.string().optional().or(z.literal("")),
  status: z.enum(["a_faire", "en_cours", "terminee"]).optional(),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
};
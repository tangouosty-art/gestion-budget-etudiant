const { z } = require("zod");

const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom de la catégorie doit contenir au moins 2 caractères")
    .max(100, "Le nom de la catégorie est trop long"),
});

module.exports = {
  createCategorySchema,
};
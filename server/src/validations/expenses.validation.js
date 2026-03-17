const { z } = require("zod");

const createExpenseSchema = z.object({
  label: z
    .string()
    .trim()
    .min(2, "Le libellé doit contenir au moins 2 caractères")
    .max(150, "Le libellé est trop long"),
  amount: z.coerce.number().positive("Le montant doit être supérieur à 0"),
  expense_date: z.string().min(1, "La date est obligatoire"),
  category_id: z.coerce.number().int().positive().nullable().optional(),
});

module.exports = {
  createExpenseSchema,
};
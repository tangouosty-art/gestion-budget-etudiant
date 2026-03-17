const { z } = require("zod");

const upsertBudgetSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
  amount: z.coerce.number().min(0, "Le budget doit être positif ou nul"),
});

module.exports = {
  upsertBudgetSchema,
};
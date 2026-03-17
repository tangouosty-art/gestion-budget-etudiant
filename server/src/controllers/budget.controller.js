const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { upsertBudgetSchema } = require("../validations/budget.validation");

const getBudget = asyncHandler(async (req, res) => {
  const year = Number(req.query.year);
  const month = Number(req.query.month);

  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    return res.status(400).json({
      message: "Année ou mois invalide",
    });
  }

  const [rows] = await pool.execute(
    `SELECT id, year, month, amount, created_at, updated_at
     FROM monthly_budgets
     WHERE user_id = ? AND year = ? AND month = ?
     LIMIT 1`,
    [req.user.id, year, month]
  );

  res.json({
    budget: rows[0] || null,
  });
});

const upsertBudget = asyncHandler(async (req, res) => {
  const parsed = upsertBudgetSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: parsed.error.issues[0]?.message || "Données invalides",
    });
  }

  const { year, month, amount } = parsed.data;

  await pool.execute(
    `INSERT INTO monthly_budgets (user_id, year, month, amount)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE amount = VALUES(amount), updated_at = CURRENT_TIMESTAMP`,
    [req.user.id, year, month, amount]
  );

  const [rows] = await pool.execute(
    `SELECT id, year, month, amount, created_at, updated_at
     FROM monthly_budgets
     WHERE user_id = ? AND year = ? AND month = ?
     LIMIT 1`,
    [req.user.id, year, month]
  );

  res.json({
    message: "Budget enregistré avec succès",
    budget: rows[0],
  });
});

module.exports = {
  getBudget,
  upsertBudget,
};
const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { createExpenseSchema } = require("../validations/expenses.validation");

const listExpenses = asyncHandler(async (req, res) => {
  const year = Number(req.query.year);
  const month = Number(req.query.month);

  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    return res.status(400).json({
      message: "Année ou mois invalide",
    });
  }

  const [rows] = await pool.execute(
    `SELECT 
       e.id,
       e.label,
       e.amount,
       e.expense_date,
       e.created_at,
       e.category_id,
       c.name AS category_name
     FROM expenses e
     LEFT JOIN categories c ON c.id = e.category_id
     WHERE e.user_id = ?
       AND YEAR(e.expense_date) = ?
       AND MONTH(e.expense_date) = ?
     ORDER BY e.expense_date DESC, e.id DESC`,
    [req.user.id, year, month]
  );

  const total = rows.reduce((sum, item) => sum + Number(item.amount), 0);

  res.json({
    expenses: rows,
    total,
  });
});

const createExpense = asyncHandler(async (req, res) => {
  const parsed = createExpenseSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: parsed.error.issues[0]?.message || "Données invalides",
    });
  }

  const { label, amount, expense_date, category_id } = parsed.data;

  if (category_id) {
    const [categories] = await pool.execute(
      "SELECT id FROM categories WHERE id = ? AND user_id = ? LIMIT 1",
      [category_id, req.user.id]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        message: "Catégorie introuvable",
      });
    }
  }

  const [result] = await pool.execute(
    `INSERT INTO expenses (user_id, category_id, label, amount, expense_date)
     VALUES (?, ?, ?, ?, ?)`,
    [req.user.id, category_id || null, label, amount, expense_date]
  );

  const [rows] = await pool.execute(
    `SELECT 
       e.id,
       e.label,
       e.amount,
       e.expense_date,
       e.created_at,
       e.category_id,
       c.name AS category_name
     FROM expenses e
     LEFT JOIN categories c ON c.id = e.category_id
     WHERE e.id = ? AND e.user_id = ?
     LIMIT 1`,
    [result.insertId, req.user.id]
  );

  res.status(201).json({
    message: "Dépense créée avec succès",
    expense: rows[0],
  });
});

const deleteExpense = asyncHandler(async (req, res) => {
  const expenseId = Number(req.params.id);

  if (!Number.isInteger(expenseId) || expenseId <= 0) {
    return res.status(400).json({ message: "Identifiant invalide" });
  }

  const [result] = await pool.execute(
    "DELETE FROM expenses WHERE id = ? AND user_id = ?",
    [expenseId, req.user.id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({
      message: "Dépense introuvable",
    });
  }

  res.json({ message: "Dépense supprimée avec succès" });
});

module.exports = {
  listExpenses,
  createExpense,
  deleteExpense,
};
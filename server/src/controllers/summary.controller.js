const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

const getSummary = asyncHandler(async (req, res) => {
  const year = Number(req.query.year);
  const month = Number(req.query.month);

  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    return res.status(400).json({
      message: "Année ou mois invalide",
    });
  }

  const [[budgetRow]] = await pool.execute(
    `SELECT id, year, month, amount
     FROM monthly_budgets
     WHERE user_id = ? AND year = ? AND month = ?
     LIMIT 1`,
    [req.user.id, year, month]
  );

  const [[expenseStats]] = await pool.execute(
    `SELECT 
       COUNT(*) AS expense_count,
       COALESCE(SUM(amount), 0) AS total_expenses
     FROM expenses
     WHERE user_id = ?
       AND YEAR(expense_date) = ?
       AND MONTH(expense_date) = ?`,
    [req.user.id, year, month]
  );

  const [categoryRows] = await pool.execute(
    `SELECT
       c.name AS category_name,
       COALESCE(SUM(e.amount), 0) AS total_amount
     FROM expenses e
     LEFT JOIN categories c ON c.id = e.category_id
     WHERE e.user_id = ?
       AND YEAR(e.expense_date) = ?
       AND MONTH(e.expense_date) = ?
     GROUP BY c.id, c.name
     ORDER BY total_amount DESC`,
    [req.user.id, year, month]
  );

  const budgetAmount = Number(budgetRow?.amount || 0);
  const totalExpenses = Number(expenseStats?.total_expenses || 0);
  const remaining = budgetAmount - totalExpenses;

  res.json({
    summary: {
      year,
      month,
      budget: budgetAmount,
      totalExpenses,
      remaining,
      expenseCount: Number(expenseStats?.expense_count || 0),
      topCategories: categoryRows.map((row) => ({
        categoryName: row.category_name || "Sans catégorie",
        totalAmount: Number(row.total_amount),
      })),
    },
  });
});

module.exports = {
  getSummary,
};
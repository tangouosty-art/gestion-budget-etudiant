const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

const MONTH_LABELS = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];

const getTrends = asyncHandler(async (req, res) => {
  const year = Number(req.query.year);

  if (!Number.isInteger(year)) {
    return res.status(400).json({
      message: "Année invalide",
    });
  }

  const [rows] = await pool.execute(
    `SELECT
       MONTH(expense_date) AS month,
       COALESCE(SUM(amount), 0) AS total_expenses
     FROM expenses
     WHERE user_id = ?
       AND YEAR(expense_date) = ?
     GROUP BY MONTH(expense_date)
     ORDER BY MONTH(expense_date) ASC`,
    [req.user.id, year]
  );

  const map = new Map(
    rows.map((row) => [Number(row.month), Number(row.total_expenses)])
  );

  const trends = Array.from({ length: 12 }, (_, index) => {
    const monthNumber = index + 1;
    return {
      month: monthNumber,
      label: MONTH_LABELS[index],
      totalExpenses: map.get(monthNumber) || 0,
    };
  });

  res.json({
    year,
    trends,
  });
});

module.exports = {
  getTrends,
};
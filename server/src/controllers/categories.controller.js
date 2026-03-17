const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { createCategorySchema } = require("../validations/categories.validation");

const listCategories = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    "SELECT id, name, created_at FROM categories WHERE user_id = ? ORDER BY name ASC",
    [req.user.id]
  );

  res.json({ categories: rows });
});

const createCategory = asyncHandler(async (req, res) => {
  const parsed = createCategorySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: parsed.error.issues[0]?.message || "Données invalides",
    });
  }

  const { name } = parsed.data;

  try {
    const [result] = await pool.execute(
      "INSERT INTO categories (user_id, name) VALUES (?, ?)",
      [req.user.id, name]
    );

    res.status(201).json({
      message: "Catégorie créée avec succès",
      category: {
        id: result.insertId,
        name,
      },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Cette catégorie existe déjà",
      });
    }

    throw error;
  }
});

const deleteCategory = asyncHandler(async (req, res) => {
  const categoryId = Number(req.params.id);

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return res.status(400).json({ message: "Identifiant invalide" });
  }

  const [result] = await pool.execute(
    "DELETE FROM categories WHERE id = ? AND user_id = ?",
    [categoryId, req.user.id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({
      message: "Catégorie introuvable",
    });
  }

  res.json({ message: "Catégorie supprimée avec succès" });
});

module.exports = {
  listCategories,
  createCategory,
  deleteCategory,
};
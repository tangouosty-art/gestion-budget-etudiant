const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const {
  createTaskSchema,
  updateTaskSchema,
} = require("../validations/tasks.validation");

const listTasks = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT id, title, description, due_date, status, created_at, updated_at
     FROM tasks
     WHERE user_id = ?
     ORDER BY
       CASE status
         WHEN 'a_faire' THEN 1
         WHEN 'en_cours' THEN 2
         WHEN 'terminee' THEN 3
       END,
       due_date IS NULL,
       due_date ASC,
       id DESC`,
    [req.user.id]
  );

  res.json({ tasks: rows });
});

const createTask = asyncHandler(async (req, res) => {
  const parsed = createTaskSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: parsed.error.issues[0]?.message || "Données invalides",
    });
  }

  const {
    title,
    description = "",
    due_date = "",
    status = "a_faire",
  } = parsed.data;

  const [result] = await pool.execute(
    `INSERT INTO tasks (user_id, title, description, due_date, status)
     VALUES (?, ?, ?, ?, ?)`,
    [
      req.user.id,
      title,
      description || null,
      due_date || null,
      status,
    ]
  );

  const [rows] = await pool.execute(
    `SELECT id, title, description, due_date, status, created_at, updated_at
     FROM tasks
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [result.insertId, req.user.id]
  );

  res.status(201).json({
    message: "Tâche créée avec succès",
    task: rows[0],
  });
});

const updateTask = asyncHandler(async (req, res) => {
  const taskId = Number(req.params.id);

  if (!Number.isInteger(taskId) || taskId <= 0) {
    return res.status(400).json({ message: "Identifiant invalide" });
  }

  const parsed = updateTaskSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: parsed.error.issues[0]?.message || "Données invalides",
    });
  }

  const updates = parsed.data;

  const [existingRows] = await pool.execute(
    `SELECT id, title, description, due_date, status
     FROM tasks
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [taskId, req.user.id]
  );

  if (existingRows.length === 0) {
    return res.status(404).json({
      message: "Tâche introuvable",
    });
  }

  const existing = existingRows[0];

  const title = updates.title ?? existing.title;
  const description =
    updates.description !== undefined ? updates.description || null : existing.description;
  const dueDate =
    updates.due_date !== undefined ? updates.due_date || null : existing.due_date;
  const status = updates.status ?? existing.status;

  await pool.execute(
    `UPDATE tasks
     SET title = ?, description = ?, due_date = ?, status = ?
     WHERE id = ? AND user_id = ?`,
    [title, description, dueDate, status, taskId, req.user.id]
  );

  const [rows] = await pool.execute(
    `SELECT id, title, description, due_date, status, created_at, updated_at
     FROM tasks
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [taskId, req.user.id]
  );

  res.json({
    message: "Tâche mise à jour avec succès",
    task: rows[0],
  });
});

const deleteTask = asyncHandler(async (req, res) => {
  const taskId = Number(req.params.id);

  if (!Number.isInteger(taskId) || taskId <= 0) {
    return res.status(400).json({ message: "Identifiant invalide" });
  }

  const [result] = await pool.execute(
    `DELETE FROM tasks WHERE id = ? AND user_id = ?`,
    [taskId, req.user.id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({
      message: "Tâche introuvable",
    });
  }

  res.json({ message: "Tâche supprimée avec succès" });
});

module.exports = {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
};
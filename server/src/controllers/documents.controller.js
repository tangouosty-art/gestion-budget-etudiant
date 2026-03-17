const fs = require("fs/promises");
const path = require("path");
const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { createDocumentSchema } = require("../validations/documents.validation");
const { uploadsRoot } = require("../middlewares/upload");

function buildFolderTree(folderPaths) {
  const root = {};

  for (const folderPath of folderPaths) {
    const segments = folderPath.split("/").filter(Boolean);
    let current = root;
    let currentPath = "";

    for (const segment of segments) {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;

      if (!current[segment]) {
        current[segment] = {
          name: segment,
          path: currentPath,
          children: {},
        };
      }

      current = current[segment].children;
    }
  }

  function toArray(node) {
    return Object.values(node).map((item) => ({
      name: item.name,
      path: item.path,
      children: toArray(item.children),
    }));
  }

  return toArray(root);
}

const listDocuments = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT
       id,
       title,
       folder_path,
       note,
       file_name,
       original_name,
       mime_type,
       file_size,
       created_at,
       updated_at
     FROM documents
     WHERE user_id = ?
     ORDER BY folder_path ASC, created_at DESC`,
    [req.user.id]
  );

  res.json({ documents: rows });
});

const getDocumentTree = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT DISTINCT folder_path
     FROM documents
     WHERE user_id = ?
     ORDER BY folder_path ASC`,
    [req.user.id]
  );

  const folderPaths = rows.map((row) => row.folder_path);
  const tree = buildFolderTree(folderPaths);

  res.json({ tree });
});

const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      message: "Aucun fichier envoyé",
    });
  }

  const parsed = createDocumentSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: parsed.error.issues[0]?.message || "Données invalides",
    });
  }

  const { title = "", folder_path, note = "" } = parsed.data;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const insertedDocuments = [];

    for (const file of req.files) {
      const finalTitle =
        req.files.length === 1 && title ? title : file.originalname;

      const [result] = await connection.execute(
        `INSERT INTO documents
         (
           user_id,
           title,
           folder_path,
           note,
           file_name,
           original_name,
           mime_type,
           file_size,
           storage_path
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          finalTitle,
          folder_path,
          note || null,
          file.filename,
          file.originalname,
          file.mimetype,
          file.size,
          file.path,
        ]
      );

      const [rows] = await connection.execute(
        `SELECT
           id,
           title,
           folder_path,
           note,
           file_name,
           original_name,
           mime_type,
           file_size,
           created_at,
           updated_at
         FROM documents
         WHERE id = ? AND user_id = ?
         LIMIT 1`,
        [result.insertId, req.user.id]
      );

      insertedDocuments.push(rows[0]);
    }

    await connection.commit();

    res.status(201).json({
      message:
        req.files.length > 1
          ? "Documents importés avec succès"
          : "Document importé avec succès",
      documents: insertedDocuments,
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

const downloadDocument = asyncHandler(async (req, res) => {
  const documentId = Number(req.params.id);

  if (!Number.isInteger(documentId) || documentId <= 0) {
    return res.status(400).json({ message: "Identifiant invalide" });
  }

  const [rows] = await pool.execute(
    `SELECT id, original_name, storage_path
     FROM documents
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [documentId, req.user.id]
  );

  if (rows.length === 0) {
    return res.status(404).json({
      message: "Document introuvable",
    });
  }

  const document = rows[0];
  const absolutePath = path.resolve(document.storage_path);

  if (!absolutePath.startsWith(uploadsRoot)) {
    return res.status(403).json({
      message: "Accès interdit",
    });
  }

  await fs.access(absolutePath);
  res.download(absolutePath, document.original_name);
});

const deleteDocument = asyncHandler(async (req, res) => {
  const documentId = Number(req.params.id);

  if (!Number.isInteger(documentId) || documentId <= 0) {
    return res.status(400).json({ message: "Identifiant invalide" });
  }

  const [rows] = await pool.execute(
    `SELECT id, storage_path
     FROM documents
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [documentId, req.user.id]
  );

  if (rows.length === 0) {
    return res.status(404).json({
      message: "Document introuvable",
    });
  }

  const document = rows[0];

  await pool.execute(
    `DELETE FROM documents
     WHERE id = ? AND user_id = ?`,
    [documentId, req.user.id]
  );

  try {
    await fs.unlink(document.storage_path);
  } catch (error) {
    // Si le fichier a déjà disparu, on garde quand même la suppression en base
  }

  res.json({ message: "Document supprimé avec succès" });
});

module.exports = {
  listDocuments,
  getDocumentTree,
  uploadDocument,
  downloadDocument,
  deleteDocument,
};
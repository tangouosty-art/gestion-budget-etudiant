const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const uploadsRoot = path.resolve(__dirname, "../../uploads");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user?.id;

    if (!userId) {
      return cb(new Error("Utilisateur non authentifié"));
    }

    const userUploadDir = path.join(
      uploadsRoot,
      "users",
      String(userId),
      "documents"
    );

    ensureDir(userUploadDir);
    cb(null, userUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const uniqueName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
    cb(null, sanitizeFilename(uniqueName));
  },
});

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(
        new Error(
          "Type de fichier non autorisé. Formats acceptés : PDF, images, TXT, DOC, DOCX, XLS, XLSX."
        )
      );
    }

    cb(null, true);
  },
});

module.exports = {
  uploadDocuments: upload.array("files", 10),
  uploadsRoot,
};
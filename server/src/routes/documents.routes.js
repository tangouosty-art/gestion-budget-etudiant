const express = require("express");
const authMiddleware = require("../middlewares/auth");
const { uploadDocuments } = require("../middlewares/upload");
const {
  listDocuments,
  getDocumentTree,
  uploadDocument,
  downloadDocument,
  deleteDocument,
} = require("../controllers/documents.controller");

const router = express.Router();

router.use(authMiddleware);

router.get("/tree", getDocumentTree);
router.get("/", listDocuments);
router.post("/upload", uploadDocuments, uploadDocument);
router.get("/:id/download", downloadDocument);
router.delete("/:id", deleteDocument);

module.exports = router;
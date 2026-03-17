const express = require("express");
const authMiddleware = require("../middlewares/auth");
const {
  listCategories,
  createCategory,
  deleteCategory,
} = require("../controllers/categories.controller");

const router = express.Router();

router.use(authMiddleware);

router.get("/", listCategories);
router.post("/", createCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
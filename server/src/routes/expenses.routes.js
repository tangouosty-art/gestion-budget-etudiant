const express = require("express");
const authMiddleware = require("../middlewares/auth");
const {
  listExpenses,
  createExpense,
  deleteExpense,
} = require("../controllers/expenses.controller");

const router = express.Router();

router.use(authMiddleware);

router.get("/", listExpenses);
router.post("/", createExpense);
router.delete("/:id", deleteExpense);

module.exports = router;
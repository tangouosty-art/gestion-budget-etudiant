const express = require("express");
const authMiddleware = require("../middlewares/auth");
const {
  getBudget,
  upsertBudget,
} = require("../controllers/budget.controller");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getBudget);
router.put("/", upsertBudget);

module.exports = router;
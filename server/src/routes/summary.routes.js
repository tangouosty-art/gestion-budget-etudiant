const express = require("express");
const authMiddleware = require("../middlewares/auth");
const { getSummary } = require("../controllers/summary.controller");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getSummary);

module.exports = router;
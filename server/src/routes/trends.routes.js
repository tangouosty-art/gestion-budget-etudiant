const express = require("express");
const authMiddleware = require("../middlewares/auth");
const { getTrends } = require("../controllers/trends.controller");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getTrends);

module.exports = router;
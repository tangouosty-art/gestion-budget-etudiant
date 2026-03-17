const express = require("express");
const authMiddleware = require("../middlewares/auth");
const {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/tasks.controller");

const router = express.Router();

router.use(authMiddleware);

router.get("/", listTasks);
router.post("/", createTask);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;
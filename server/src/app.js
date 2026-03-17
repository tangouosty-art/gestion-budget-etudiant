const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const env = require("./config/env");

const authRoutes = require("./routes/auth.routes");
const budgetRoutes = require("./routes/budget.routes");
const categoriesRoutes = require("./routes/categories.routes");
const expensesRoutes = require("./routes/expenses.routes");
const summaryRoutes = require("./routes/summary.routes");
const trendsRoutes = require("./routes/trends.routes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");
const tasksRoutes = require("./routes/tasks.routes");
const documentsRoutes = require("./routes/documents.routes");
const { authRateLimiter } = require("./middlewares/rateLimiter");

const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ message: "API OK" });
});

app.use("/api/auth", authRoutes);
app.use("/api/auth", authRateLimiter, authRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/trends", trendsRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/documents", documentsRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
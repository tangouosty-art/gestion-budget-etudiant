const bcrypt = require("bcrypt");
const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { signToken } = require("../utils/jwt");
const {
  registerSchema,
  loginSchema,
} = require("../validations/auth.validation");

const register = asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: parsed.error.issues[0]?.message || "Données invalides",
    });
  }

  const { email, password } = parsed.data;

  const [existingUsers] = await pool.execute(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  if (existingUsers.length > 0) {
    return res.status(409).json({
      message: "Cet email existe déjà",
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [result] = await pool.execute(
    "INSERT INTO users (email, password_hash) VALUES (?, ?)",
    [email, passwordHash]
  );

  const token = signToken({
    userId: result.insertId,
    email,
  });

  return res.status(201).json({
    message: "Compte créé avec succès",
    token,
    user: {
      id: result.insertId,
      email,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: parsed.error.issues[0]?.message || "Données invalides",
    });
  }

  const { email, password } = parsed.data;

  const [users] = await pool.execute(
    "SELECT id, email, password_hash FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  if (users.length === 0) {
    return res.status(401).json({
      message: "Identifiants invalides",
    });
  }

  const user = users[0];

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Identifiants invalides",
    });
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
  });

  return res.json({
    message: "Connexion réussie",
    token,
    user: {
      id: user.id,
      email: user.email,
    },
  });
});

const me = asyncHandler(async (req, res) => {
  const [users] = await pool.execute(
    "SELECT id, email, created_at FROM users WHERE id = ? LIMIT 1",
    [req.user.id]
  );

  if (users.length === 0) {
    return res.status(404).json({
      message: "Utilisateur introuvable",
    });
  }

  return res.json({
    user: users[0],
  });
});

module.exports = {
  register,
  login,
  me,
};
function errorHandler(err, req, res, next) {
  console.error("ERROR:", err);

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "Fichier trop volumineux. Taille maximale : 10 Mo.",
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Erreur interne du serveur";

  res.status(statusCode).json({
    message,
  });
}

module.exports = errorHandler;
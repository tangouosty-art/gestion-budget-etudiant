function notFound(req, res) {
  res.status(404).json({
    message: "Route introuvable",
  });
}

module.exports = notFound;
export function errorHandler(err, req, res, next) {
  console.error("[error]", err.message);

  if (err.message?.includes("Only PDF")) {
    return res.status(400).json({ error: err.message });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({ error: "Validation failed.", detail: err.message });
  }

  res.status(500).json({ error: "Something went wrong on the server." });
}

export function notFound(req, res) {
  res.status(404).json({ error: "Route not found." });
}

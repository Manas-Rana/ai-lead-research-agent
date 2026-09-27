export function notFound(req, res) {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

export function errorHandler(error, req, res, _next) {
  req.log?.error({ err: error }, "Unhandled request error");

  if (error?.name === "ZodError") {
    return res.status(400).json({
      error: "Invalid request data",
      details: error.issues
    });
  }

  if (error?.code === "OPENAI_ERROR") {
    return res.status(502).json({
      error: "The AI research service is temporarily unavailable."
    });
  }

  return res.status(500).json({
    error: "Something went wrong on the server."
  });
}

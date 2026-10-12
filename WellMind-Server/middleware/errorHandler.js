export default function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  const status = Number(err.status) || 500;
  if (status >= 500) {
    console.error("Unhandled error:", err?.name || "Error");
  }
  res.status(status).json({
    success: false,
    message: status >= 500 ? "Server error" : err.message || "Request failed",
  });
}

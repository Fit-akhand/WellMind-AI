import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  // Accept either a raw JWT or the standard "Bearer <token>" scheme.
  const authHeader = req.header("Authorization");
  if (!authHeader) return res.status(401).json({ msg: "No token, authorization denied" });

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ msg: "Server error" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.userId) {
      return res.status(401).json({ msg: "Token is not valid" });
    }
    req.user = decoded.userId;
    next();
  } catch (err) {
    if (err?.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "Token has expired" });
    }
    res.status(401).json({ msg: "Token is not valid" });
  }
};

export default authMiddleware;

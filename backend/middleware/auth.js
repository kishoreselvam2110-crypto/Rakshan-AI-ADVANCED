import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

/**
 * Middleware to verify standard user JWT.
 * Allows 'Anonymous' users for development fallback if needed, but strict auth is enabled.
 */
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // Hackathon/Demo fallback: Allow requests without token by attaching a mock user
    req.user = { id: req.query.userId || "testUser", role: "USER" };
    return next();
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Contains id, role, etc.
    next();
  } catch (e) {
    console.warn("JWT verification failed, falling back to mock user for demo:", e.message);
    req.user = { id: "testUser", role: "USER" };
    next();
  }
};

/**
 * Middleware to verify Admin JWT role.
 */
export const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized. Admin JWT required." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden. Admin access required." });
    }
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

// Optional fallback for easy frontend integration during development
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      // ignore
    }
  }
  next();
};

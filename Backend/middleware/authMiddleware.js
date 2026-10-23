import { verifyFirebaseIdToken } from "../config/firebase.js";

export const verifyToken = async (req, res, next) => {
  const authorization = req.headers.authorization ?? "";
  const match = /^Bearer\s+(\S+)$/i.exec(authorization);

  if (!match) {
    return res.status(401).json({
      success: false,
      error: "A Bearer token is required.",
    });
  }

  try {
    const decoded = await verifyFirebaseIdToken(match[1]);

    req.user = {
      uid: decoded.uid,
      email: decoded.email ?? null,
      role:
        typeof decoded.role === "string"
          ? decoded.role
          : decoded.admin === true
            ? "admin"
            : "user",
      admin: decoded.admin === true,
    };

    return next();
  } catch (error) {
    if (
      error.code === "EVENTRA_FIREBASE_NOT_CONFIGURED"
    ) {
      return res.status(503).json({
        success: false,
        error: "Firebase authentication is not configured.",
      });
    }

    if (
      error.code === "EVENTRA_FIREBASE_INVALID_CONFIG"
    ) {
      return res.status(500).json({
        success: false,
        error: "Firebase authentication configuration is invalid.",
      });
    }

    return res.status(401).json({
      success: false,
      error: "Invalid or expired authentication token.",
    });
  }
};

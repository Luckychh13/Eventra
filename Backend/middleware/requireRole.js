export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication is required.",
      });
    }

    const hasAllowedRole =
      allowedRoles.includes(req.user.role) ||
      (
        allowedRoles.includes("admin") &&
        req.user.admin === true
      );

    if (!hasAllowedRole) {
      return res.status(403).json({
        success: false,
        error: "You do not have permission to access this resource.",
      });
    }

    return next();
  };
};

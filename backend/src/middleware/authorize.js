// src/middleware/authorize.js
export function authorize(allowedRoles = [], { ownership = false } = {}) {
  return (req, res, next) => {
    const user = req.user;

    if (!user || !user.role) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!allowedRoles.includes(user.role)) {
      return res
        .status(403)
        .json({ message: "Access forbidden: insufficient role" });
    }

    if (ownership && user.role === "member") {
      // only enforce self-ownership for members
      if (String(req.params.id) !== String(user.id)) {
        return res
          .status(403)
          .json({ message: "Forbidden: can only access your own profile" });
      }
    }

    next();
  };
}

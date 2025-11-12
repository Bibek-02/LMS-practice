// src/middleware/authorize.js
const POLICY = {
  loans: {
    create: ["admin", "staff"],   // issue
    list:   ["admin", "staff"],
    read:   ["admin", "staff", "member"], // member must own in controller
    return: ["admin", "staff"],
    renew:  ["admin", "staff", "member"], // member must own in controller
  },
  fines: {
    list:  ["admin", "staff"],
    mine:  ["member"],            // handled by controller using req.user.id
    pay:   ["member"],            // member must own in controller
    waive: ["admin"],
  },
};

// Backward compatible: either authorize(['admin','staff']) OR authorize('loans','return')
export function authorize(resourceOrRoles, action, { ownership = false } = {}) {
  return (req, res, next) => {
    const user = req.user;
    if (!user || !user.role) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Resolve allowed roles
    const allowedRoles = Array.isArray(resourceOrRoles)
      ? resourceOrRoles
      : (POLICY[resourceOrRoles]?.[action] || []);

    if (!allowedRoles.length) {
      return res.status(500).json({ message: "RBAC policy not configured" });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: "Access forbidden: insufficient role" });
    }

    // Optional ownership check (only valid when the resource id in URL equals user id—e.g., /members/:id)
    if (ownership && user.role === "member") {
      if (String(req.params.id) !== String(user.id)) {
        return res.status(403).json({ message: "Forbidden: can only access your own profile" });
      }
    }

    next();
  };
}

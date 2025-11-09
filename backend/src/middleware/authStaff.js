// middleware/authStaff.js
import { verifyJWT } from "../utils/jwtUtils.js";
import { fail } from "../utils/apiResponse.js";
import Staff from "../models/staffModel.js";

export const requireStaffAuth = async (req, res, next) => {
  try {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token) return fail(res, "Unauthorized", 401);

    const decoded = verifyJWT(token);
    if (decoded.scope !== "staff") return fail(res, "Unauthorized", 401);

    const s = await Staff.findById(decoded.sub).select("_id email role active");
    if (!s) return fail(res, "Unauthorized", 401);
    if (!s.active) return fail(res, "Forbidden", 403);

    req.user = { id: s._id.toString(), role: s.role, email: s.email };
    next();
  } catch {
    return fail(res, "Unauthorized", 401);
  }
};

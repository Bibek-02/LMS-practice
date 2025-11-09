// middleware/authMember.js
import { verifyJWT } from "../utils/jwtUtils.js";
import { fail } from "../utils/apiResponse.js";
import Member from "../models/memberModel.js";

export const requireMemberAuth = async (req, res, next) => {
  try {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token) return fail(res, "Unauthorized", 401);

    const decoded = verifyJWT(token);
    if (decoded.scope !== "member") return fail(res, "Unauthorized", 401);

    const m = await Member.findById(decoded.sub).select("_id email active");
    if (!m) return fail(res, "Unauthorized", 401);
    if (!m.active) return fail(res, "Forbidden", 403);

    req.user = { id: m._id.toString(), role: "member", email: m.email };
    next();
  } catch {
    return fail(res, "Unauthorized", 401);
  }
};

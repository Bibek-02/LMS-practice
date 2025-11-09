// backend/src/utils/auth/LoginHandler.utils.js
import { fail, ok } from "../apiResponse.js";
import { verifyPassword } from "../passwordUtils.js";
import { signJWT } from "../jwtUtils.js";

/**
 * Factory that returns an Express login handler.
 * Params:
 *  - Model: Mongoose model (Member or Staff)
 *  - safe: function(doc) -> public profile object
 *  - scope: "member" | "staff" (controls token expiry in signJWT)
 *  - rolePicker: function(doc) -> role string for token payload
 */
export const loginHandler = ({ Model, safe, scope, rolePicker }) => {
  return async (req, res) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) return fail(res, "Email and password are required", 400);

      const user = await Model.findOne({ email }).select("+password_hash");
      if (!user) return fail(res, "Invalid credentials", 400);

      const valid = await verifyPassword(password, user.password_hash);
      if (!valid || !user.active) return fail(res, "Invalid credentials", 400);

      const role = rolePicker(user);
      const payload = { sub: user._id.toString(), email: user.email, role };
      const token = signJWT(payload, scope);

      return ok(res, { token, profile: safe(user) }, " Login successful");
    } catch (err) {
      console.error(`${scope} login error:`, err.message);
      return fail(res, "Internal server error", 500);
    }
  };
};

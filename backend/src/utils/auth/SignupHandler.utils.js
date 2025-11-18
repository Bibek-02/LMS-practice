// backend/src/utils/auth/SignupHandler.utils.js
import { ok, fail } from "../apiResponse.js";
import { hashPassword } from "../passwordUtils.js";

export const signupHandler = ({ Model, safe, label, defaults = {} }) => {
  return async (req, res) => {
    try {
      let { full_name, name, email, password } = req.body || {};

        full_name = (full_name || name || "").trim();
        email = (email || "").trim().toLowerCase();

      if (!full_name || !email || !password) {
        return fail(res, "All fields are required", 400);
      }

      const existing = await Model.findOne({ email }).lean();
      if (existing) return fail(res, "Email already in use", 409);

      const password_hash = await hashPassword(password);

      const doc = await Model.create({
        name: full_name, 
        email,
        password_hash, 
        ...defaults 
      });

      return ok(res, { profile: safe(doc) }, `${label} created successfully`, 201);
    } catch (err) {
      console.error(`${label} signup error:`, err.message);
      return fail(res, "Internal server error", 500);
    }
  };
};

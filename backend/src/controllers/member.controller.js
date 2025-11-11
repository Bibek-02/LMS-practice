// src/controllers/member.controller.js
import mongoose from 'mongoose';
import Member from '../models/memberModel.js';
import {ok, fail} from '../utils/apiResponse.js';

const isId = (id) => mongoose.Types.ObjectId.isValid(id);

/**POST /api/members */
export const createMember = async(req, res, next) => {
    try{
        const{name,email, address, password, member_since, expiry_date, active, notes} = req.body ??{};

        if (!name?.trim() || !email?.trim() || !password) {
            return fail(res, "name, email and password are required", 422, {fields: ["name", "email", "password"]});
        }
        // Uniqueness check
        const exists = await Member.findOne({email: email.trim().toLowerCase()}).lean()
        if(exists)
            return fail(res, "Email is already registered", 409, {fields: ["email"]});

        const password_hash = await hashPassword(password);

        const member = await Member.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            address, 
            password_hash,
            member_since,
            expiry_date,
            active, 
            notes
        });

        //Ensuring password never leaks
        const doc = member.toObject ? member.toObject() : member;
        const{ password_hash: _pw, __v, _id, ...rest} = doc;
        const safe = { id: String(_id), ...rest};

        return ok(res, safe, "Member created succesfully", 201);
    }catch (err) {
        if(err?.code === 11000 && err?.keyPattern?.email) {
            err.status = 409;
            err.message = "Email already exists";
        }
        next(err);
    }
}

/** GET /api/members */
export const getMembers = async (req, res, next) => {
  try {
    const url = new URL(req.originalUrl || req.url, `http://${req.headers.host}`);

    const q         = url.searchParams.get("q")?.trim() || "";
    const page      = parseInt(url.searchParams.get("page") || "1", 10);
    const limit     = parseInt(url.searchParams.get("limit") || "10", 10);
    const safePage  = Math.max(1, page);
    const safeLimit = Math.min(50, Math.max(1, limit));
    const skip      = (safePage - 1) * safeLimit;

    const filter = q
      ? {
          $or: [
            { name:  new RegExp(q, "i") },
            { email: new RegExp(q, "i") }
          ]
        }
      : {};

    const [items, total] = await Promise.all([
      Member.find(filter)
        .sort({ member_since: -1 })   
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Member.countDocuments(filter)
    ]);

    const safeItems = items.map(({ _id, __v, password_hash, password, ...rest }) => ({ id: String(_id), ...rest }));

    return ok(res, { items: safeItems, page: safePage, limit: safeLimit, total }, "Members fetched successfully");
  } catch (err) {
    next(err);
  }
};

/** GET /api/members/:id */
export const getMemberById = async(req, res, next) => {
  try {
    const {id} = req.params;
    if(!isId(id)) 
      return fail(res, "Invalid member id", 400);

    const member = await Member.findById(id).lean();
    if (!member)
      return fail(res, "Member not found", 404)

    const {_id, __v, password_hash, password, ...rest} = member;
    const safe = {id: String(_id), ...rest};
    return ok(res, safe, "Member fetched successfully");
  }catch(err){
    next(err);
  }
};


/** PUT /api/members/:id */
export const updateMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isId(id))
      return fail(res, "Invalid member id", 400);

    // --- Role/Ownership check ---
    // Only staff/admin can update others
    // Members can only update their own profile
    if (req.user.role === "member" && String(req.user.id) !== String(id)) {
      return fail(res, "You can only update your own profile", 403);
    }

    if ("password" in req.body) {
      return fail(res, "Use auth endpoint to change password", 400, { fields: ["password"] });
    }

    // Allow different fields depending on role
    let allowed = ["name", "email", "address", "notes"];
    if (req.user.role !== "member") {
      // staff/admin can also modify status/dates
      allowed.push("member_since", "expiry_date", "active");
    }

    // Build payload only from allowed fields
    const payload = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) payload[key] = req.body[key];
    }

    // Validate & normalize
    if ("name" in payload && !payload.name?.trim())
      return fail(res, "name must not be empty", 422, { fields: ["name"] });
    if ("email" in payload && !payload.email?.trim())
      return fail(res, "email must not be empty", 422, { fields: ["email"] });

    if ("name" in payload) payload.name = payload.name.trim();
    if ("email" in payload) payload.email = payload.email.trim().toLowerCase();

    // Ensure email uniqueness
    if ("email" in payload) {
      const exists = await Member.findOne({ email: payload.email, _id: { $ne: id } }).lean();
      if (exists)
        return fail(res, "Email is already registered", 409, { fields: ["email"] });
    }

    const updated = await Member.findByIdAndUpdate(
      id,
      payload,
      { new: true, runValidators: true, context: "query" }
    ).lean();

    if (!updated) return fail(res, "Member not found", 404);

    const { _id, __v, password, password_hash, ...rest } = updated;
    const safe = { id: String(_id), ...rest };

    return ok(res, safe, "Member updated successfully");
  } catch (err) {
    if (err?.code === 11000 && err?.keyPattern?.email) {
      err.status = 409;
      err.message = "Email already exists";
    }
    next(err);
  }
};


/** DELETE /api/members/:id  (?hard=true for hard delete) */
export const deleteMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isId(id)) return fail(res, "Invalid member id", 400);

    const hard = String(req.query.hard || 'false').toLowerCase() === 'true';

    let result;
    if (hard) {
      result = await Member.findByIdAndDelete(id).lean();
      if (!result) return fail(res, "Member not found", 404);
      return ok(res, { id: String(result._id), hardDeleted: true }, "Member hard-deleted successfully");
    } else {
      result = await Member.findByIdAndUpdate(
        id,
        { $set: { active: false } },
        { new: true }
      ).lean();
      if (!result) return fail(res, "Member not found", 404);
      return ok(res, { id: String(result._id), hardDeleted: false }, "Member deactivated successfully");
    }
  } catch (err) {
    next(err);
  }
};
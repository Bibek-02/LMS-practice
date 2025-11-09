// src/controllers/auth.controller.js
import Member from "../models/memberModel.js";
import Staff from "../models/staffModel.js";
import { signupHandler } from "../utils/auth/SignupHandler.utils.js";
import { loginHandler } from "../utils/auth/LoginHandler.utils.js";

const safeMember = (m) => ({
  id: m._id,
  full_name: m.full_name,
  email: m.email,
  active: m.active,
});

const safeStaff = (s) => ({
  id: s._id,
  full_name: s.full_name,
  email: s.email,
  role: s.role,
  active: s.active,
});

const memberRolePicker = () => "member";
const staffRolePicker = (s) => s.role;

// Signups
export const memberSignup = signupHandler({
  Model: Member,
  safe: safeMember,
  label: "Member",
});

export const staffSignup = signupHandler({
  Model: Staff,
  safe: safeStaff,
  label: "Staff",
  defaults: { role: "staff" }, // Default role for staff signups
});

// Logins
export const memberLogin = loginHandler({
  Model: Member,
  safe: safeMember,
  scope: "member",
  rolePicker: memberRolePicker,
});

export const staffLogin = loginHandler({
  Model: Staff,
  safe: safeStaff,
  scope: "staff",
  rolePicker: staffRolePicker,
});

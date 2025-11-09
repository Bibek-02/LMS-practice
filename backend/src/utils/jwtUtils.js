// src/utils/jwtUtils.js
import jwt from "jsonwebtoken";

export const signJWT = (payload, scope) =>
  jwt.sign(
    { ...payload, scope },
    process.env.JWT_SECRET,
    {
      expiresIn:
        scope === "staff"
          ? process.env.JWT_EXPIRES_IN_STAFF || "1d"
          : process.env.JWT_EXPIRES_IN_MEMBER || "7d",
      ...(process.env.JWT_ISS && { issuer: process.env.JWT_ISS }),
    }
  );

export const verifyJWT = (token) => jwt.verify(token, process.env.JWT_SECRET);


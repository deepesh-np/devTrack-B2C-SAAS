import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export interface TokenPayload {
  id: string;
  email: string;
  username?: string | null;
}

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: "7d",
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
};

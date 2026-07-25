import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "devtrack_super_secret_jwt_key_2026",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "placeholder_google_client_id",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder_google_client_secret",
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
  },

  github: {
    clientId: process.env.GITHUB_CLIENT_ID || "placeholder_github_client_id",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "placeholder_github_client_secret",
    callbackUrl: process.env.GITHUB_CALLBACK_URL || "http://localhost:5000/api/auth/github/callback",
  },
};

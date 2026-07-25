import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import { config } from "./env.js";

// ==========================================
// 1. LOCAL STRATEGY (Username/Email + Password)
// ==========================================
passport.use(
  "local",
  new LocalStrategy(
    {
      usernameField: "identifier", // accepts email or username
      passwordField: "password",
    },
    async (identifier, password, done) => {
      try {
        // Find user by email or username
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: identifier.toLowerCase() },
              { username: identifier },
            ],
          },
        });

        if (!user) {
          return done(null, false, { message: "Invalid email/username or password" });
        }

        if (!user.password) {
          return done(null, false, {
            message: "Account was created via social login. Please log in using Google or GitHub.",
          });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Invalid email/username or password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// ==========================================
// 2. GOOGLE OAUTH STRATEGY
// ==========================================
passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value.toLowerCase() : null;
        const name = profile.displayName || `${profile.name?.givenName || ""} ${profile.name?.familyName || ""}`.trim();
        const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

        if (!email) {
          return done(new Error("No email returned from Google account"), undefined);
        }

        // 1. Check if user exists by googleId
        let user = await prisma.user.findUnique({
          where: { googleId },
        });

        if (user) {
          return done(null, user);
        }

        // 2. Check if user exists by email (link Google ID if found)
        user = await prisma.user.findUnique({
          where: { email },
        });

        if (user) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId,
              avatar: user.avatar || avatar,
            },
          });
          return done(null, user);
        }

        // 3. Create new user for Google OAuth
        const baseUsername = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
        const uniqueUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;

        user = await prisma.user.create({
          data: {
            name,
            email,
            username: uniqueUsername,
            googleId,
            avatar,
            provider: "GOOGLE",
          },
        });

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

// ==========================================
// 3. GITHUB OAUTH STRATEGY
// ==========================================
passport.use(
  "github",
  new GitHubStrategy(
    {
      clientID: config.github.clientId,
      clientSecret: config.github.clientSecret,
      callbackURL: config.github.callbackUrl,
      scope: ["user:email"],
    },
    async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
      try {
        const githubId = String(profile.id);
        const name = profile.displayName || profile.username;
        const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

        let email = profile.emails && profile.emails[0] ? profile.emails[0].value.toLowerCase() : null;

        // Fallback email if GitHub returns empty email
        if (!email) {
          email = `${profile.username.toLowerCase()}@users.noreply.github.com`;
        }

        // 1. Check by githubId
        let user = await prisma.user.findUnique({
          where: { githubId },
        });

        if (user) {
          return done(null, user);
        }

        // 2. Check by email (link GitHub ID if found)
        user = await prisma.user.findUnique({
          where: { email },
        });

        if (user) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              githubId,
              avatar: user.avatar || avatar,
            },
          });
          return done(null, user);
        }

        // 3. Create new user for GitHub OAuth
        const usernameCandidate = profile.username || `gh_${githubId}`;
        const existingUsername = await prisma.user.findUnique({ where: { username: usernameCandidate } });
        const finalUsername = existingUsername ? `${usernameCandidate}_${Math.floor(1000 + Math.random() * 9000)}` : usernameCandidate;

        user = await prisma.user.create({
          data: {
            name,
            email,
            username: finalUsername,
            githubId,
            avatar,
            provider: "GITHUB",
          },
        });

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

// ==========================================
// 4. JWT STRATEGY (Protected API Routes)
// ==========================================
passport.use(
  "jwt",
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => {
          if (req && req.cookies && req.cookies.access_token) {
            return req.cookies.access_token;
          }
          return null;
        },
      ]),
      secretOrKey: config.jwtSecret,
    },
    async (jwtPayload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: jwtPayload.id },
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            avatar: true,
            provider: true,
            googleId: true,
            githubId: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export default passport;

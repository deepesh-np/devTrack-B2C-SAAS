import { Request, Response, NextFunction } from "express";
import passport from "../config/passport.js";

export const authenticateJwt = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("jwt", { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        success: false,
        message: info?.message || "Unauthorized access. Valid token or login required.",
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};

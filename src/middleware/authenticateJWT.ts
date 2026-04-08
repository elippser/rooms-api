import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { extractAccessToken } from "../utils/extractAccessToken";

interface JwtPayload {
  userId: string;
  companyId: string;
  role: string;
  email: string;
}

const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const token = extractAccessToken(req);

  if (!token) {
    res.status(401).json({ message: "No token provided", code: "NO_TOKEN" });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ message: "JWT_SECRET not configured" });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = {
      userId: decoded.userId,
      companyId: decoded.companyId,
      role: decoded.role,
      email: decoded.email,
    };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token", code: "INVALID_JWT" });
  }
};

export { authenticateJWT };
export default authenticateJWT;

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  companyId: string;
  role: string;
  email: string;
}

const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  let token: string | undefined;

  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    token = auth.slice(7);
  } else if (req.cookies?.app_token) {
    token = req.cookies.app_token as string;
  }

  if (!token) {
    res.status(401).json({ message: "No token provided" });
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
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export { authenticateJWT };
export default authenticateJWT;

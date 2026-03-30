import { Request, Response, NextFunction } from "express";

const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      res.status(403).json({ message: "Insufficient permissions" });
      return;
    }
    next();
  };
};

export { requireRole };
export default requireRole;

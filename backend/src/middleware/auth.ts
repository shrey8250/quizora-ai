import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1]; // Get token from "Bearer <token>"
  
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET as string);
    next(); 
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired token." });
  }
};
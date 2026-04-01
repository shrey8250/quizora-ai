import { Request, Response, NextFunction } from "express";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(" Global Error Caught:", err.message || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Send a consistent, predictable JSON response back to the frontend
  res.status(statusCode).json({
    success: false,
    error: message,
  });
};
import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

// this is a generic function that takes any zod schema and returns a middleware function
export const validate = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next(); 
    } catch (error) {
        
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Invalid input data",
          // Map over the Zod errors to give the frontend exactly what went wrong
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      // If it's some other weird error, pass it to the global error handler
      next(error); 
    }
  };
};
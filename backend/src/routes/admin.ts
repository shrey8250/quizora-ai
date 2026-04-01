import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Admin } from "../models"; 
import { validate } from "../middleware/validate";
import { signupSchema, loginSchema } from "../schemas/adminSchema";

const router = Router();

router.post("/signup", validate(signupSchema),async (req, res) => {
  try {
    const { username, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);
    
    const newAdmin = await Admin.create({ username, passwordHash });
    const token = jwt.sign({ adminId: newAdmin._id }, process.env.JWT_SECRET as string);
    
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Signup failed" });
  }
});

router.post("/login",validate(loginSchema), async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const admin = await Admin.findOne({ username });
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    
    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET as string);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;
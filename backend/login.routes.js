import express from "express";
import { registerAdmin, loginAdmin, verifyToken } from "./login.controller.js";

const router = express.Router();

router.post("/register", registerAdmin); // One-time use
router.post("/login", loginAdmin);

// Example protected route
router.get("/check", verifyToken, (req, res) => {
  res.json({ message: "Token valid", admin: req.admin });
});

export default router;

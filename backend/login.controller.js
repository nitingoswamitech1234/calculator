import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { initDB } from "./database/db.js";

const SECRET = process.env.JWT_SECRET || "secretkey";

// ✅ Register Admin (one-time use)
export const registerAdmin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Username and password required" });

  try {
    const db = await initDB(); // ✅ get db connection
    const hashed = await bcrypt.hash(password, 10);

    await db.run("INSERT INTO admin (username, password) VALUES (?, ?)", [username, hashed]);

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    if (err.message.includes("UNIQUE"))
      return res.status(400).json({ message: "Admin already exists" });
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

// ✅ Login Admin
export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const db = await initDB(); // ✅ get db connection
    const admin = await db.get("SELECT * FROM admin WHERE username = ?", [username]);

    if (!admin) return res.status(401).json({ message: "Invalid username" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Wrong password" });

    const token = jwt.sign({ id: admin.id, username: admin.username }, SECRET, { expiresIn: "1d" });
    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Database error" });
  }
};

// ✅ Middleware to verify JWT
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.admin = decoded;
    next();
  });
};

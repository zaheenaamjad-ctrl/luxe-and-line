import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);
const router = Router();

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const testHash = (await scryptAsync(password, salt, 64)) as Buffer;
  const storedBuf = Buffer.from(hash, "hex");
  return timingSafeEqual(testHash, storedBuf);
}

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

// POST /auth/register
router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body as { name?: string; email?: string; password?: string };
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required." });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }
    const passwordHash = await hashPassword(password);
    const token = generateToken();
    const [user] = await db.insert(usersTable).values({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      token,
    }).returning();
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    req.log.error({ err }, "Register error");
    res.status(500).json({ error: "Failed to create account." });
  }
});

// POST /auth/login
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    const token = generateToken();
    await db.update(usersTable).set({ token }).where(eq(usersTable.id, user.id));
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ error: "Failed to login." });
  }
});

// GET /auth/me
router.get("/auth/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "No token provided." });
    const [user] = await db.select().from(usersTable).where(eq(usersTable.token, token)).limit(1);
    if (!user) return res.status(401).json({ error: "Invalid or expired token." });
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    req.log.error({ err }, "Auth me error");
    res.status(500).json({ error: "Failed to verify session." });
  }
});

export default router;

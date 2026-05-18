import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { sendWelcomeEmail } from "../mailer";

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
  if (stored.startsWith("google:")) return false;
  try {
    const testHash = (await scryptAsync(password, salt, 64)) as Buffer;
    const storedBuf = Buffer.from(hash, "hex");
    return timingSafeEqual(testHash, storedBuf);
  } catch {
    return false;
  }
}

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

// POST /auth/register
router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body as { name?: string; email?: string; password?: string };
    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email and password are required." }); return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters." }); return;
    }
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "An account with this email already exists." }); return;
    }
    const passwordHash = await hashPassword(password);
    const token = generateToken();
    const [user] = await db.insert(usersTable).values({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      token,
    }).returning();
    sendWelcomeEmail(user.name, user.email).catch(() => {});
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
      res.status(400).json({ error: "Email and password are required." }); return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
    if (!user) {
      res.status(401).json({ error: "Invalid email or password." }); return;
    }
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password." }); return;
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
    if (!token) { res.status(401).json({ error: "No token provided." }); return; }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.token, token)).limit(1);
    if (!user) { res.status(401).json({ error: "Invalid or expired token." }); return; }
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    req.log.error({ err }, "Auth me error");
    res.status(500).json({ error: "Failed to verify session." });
  }
});

// POST /auth/google — verify Google ID token and sign in / register
router.post("/auth/google", async (req, res) => {
  try {
    const { credential } = req.body as { credential?: string };
    if (!credential) { res.status(400).json({ error: "No credential provided." }); return; }

    const tokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!tokenRes.ok) { res.status(401).json({ error: "Invalid Google credential." }); return; }

    const googleUser = await tokenRes.json() as {
      email?: string;
      name?: string;
      given_name?: string;
      aud?: string;
    };

    if (!googleUser.email) { res.status(401).json({ error: "Could not get email from Google." }); return; }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (clientId && googleUser.aud !== clientId) {
      res.status(401).json({ error: "Invalid Google client." }); return;
    }

    const email = googleUser.email.toLowerCase();
    const name = googleUser.name ?? googleUser.given_name ?? email.split("@")[0];
    const newToken = generateToken();

    let [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

    if (!user) {
      const [newUser] = await db.insert(usersTable).values({
        name,
        email,
        passwordHash: `google:${generateToken()}`,
        token: newToken,
      }).returning();
      user = newUser;
      sendWelcomeEmail(name, email).catch(() => {});
    } else {
      await db.update(usersTable).set({ token: newToken }).where(eq(usersTable.id, user.id));
      user = { ...user, token: newToken };
    }

    res.json({ token: user.token!, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    req.log.error({ err }, "Google auth error");
    res.status(500).json({ error: "Google authentication failed." });
  }
});

export default router;

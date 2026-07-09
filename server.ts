import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "./config/database";
import admin from "firebase-admin";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

dotenv.config();

const PORT = 3000;

// Initialize Firebase Admin safely for server-side operations
let adminDb: any = null;
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    if (firebaseConfig.projectId) {
      const adminSdk = admin as any;
      // In Cloud Run environments, credential.applicationDefault() will load automatically.
      // If we are running in local sandbox, we can catch the error and fall back gracefully.
      try {
        adminSdk.initializeApp({
          credential: adminSdk.credential.applicationDefault(),
          projectId: firebaseConfig.projectId
        });
      } catch (credErr) {
        // Fallback initialization without credential parameter (will search environment variables or default to standard)
        console.warn("Could not load applicationDefault credential, initializing with projectId only:", firebaseConfig.projectId);
        adminSdk.initializeApp({
          projectId: firebaseConfig.projectId
        });
      }

      if (firebaseConfig.firestoreDatabaseId) {
        try {
          adminDb = getFirestore(firebaseConfig.firestoreDatabaseId);
        } catch (e) {
          adminDb = getFirestore();
        }
      } else {
        adminDb = getFirestore();
      }
      console.log("Firebase Admin successfully initialized. Firestore target database ID:", firebaseConfig.firestoreDatabaseId || "default");
    }
  }
} catch (error: any) {
  console.error("Firebase Admin initialization failed. Server will run with local database fallbacks only. Error:", error.message);
}

// Sync signed-up custom users to Firestore clients collection
async function syncUserToFirestore(userId: string, name: string, email: string, phone: string) {
  if (!adminDb) {
    console.warn("Firestore Admin DB is not initialized. Skipping sync of user to Firestore:", email);
    return;
  }
  try {
    const clientRef = adminDb.collection("clients").doc(userId);
    await clientRef.set({
      uid: userId,
      name: name,
      email: email,
      phone: phone || "",
      createdAt: FieldValue.serverTimestamp(),
      totalBookings: 0,
      totalSpent: 0
    }, { merge: true });
    console.log(`Synced user [${email}] to Firestore 'clients' collection.`);
  } catch (err) {
    console.error("Failed to sync client to Firestore:", err);
  }
}

// Initialize Gemini SDK with telemetry header requested by standard guides
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  app.use(express.json());

  // Main AI chat proxy endpoint
  app.post("/api/ai", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== "string") {
        res.status(400).json({ reply: "Please provide a valid question or input text." });
        return;
      }

      const openaiKey = process.env.OPENAI_API_KEY;
      const geminiKey = process.env.GEMINI_API_KEY;

      if (!openaiKey && !geminiKey) {
        res.json({
          reply: "Welcome to Dreamscape Tours ZM AI Travel Assistant! 🐆 (API Keys are currently unconfigured. You can supply your live GEMINI_API_KEY or OPENAI_API_KEY inside the Settings > Secrets panel to unlock real-time intelligence)."
        });
        return;
      }

      const systemInstruction = `You are the premium, highly professional, and enthusiastic AI Safari Advisor representing "Dreamscape Tours ZM", Zambia's finest boutique luxury safari and travel tour operator.

Your goal is to answer client queries about our custom African tours, travel logistics, and Zambian wilderness destinations with extreme warmth, elegance, and accuracy. Ensure you suggest trips with prices ONLY in ZMW / ZK (Zambian Kwacha). Do not quote in USD unless specifically requested.

Here is the authoritative information of what Dreamscape Tours ZM offers:

1. DESTINATIONS:
- Shantumbu Falls (Hidden Gem): Situated in Shantumbu Hills just east of Lusaka. Perfect peaceful escape from Lusaka noise. Features rocky escarpment walks, refreshing natural waterfall plunge pools, picnic spots, snacks, and private transport included. Activity level is Moderate. Base cost is exceptionally affordable (ZK 650).
- Victoria Falls (Mosi-oa-Tunya): Livingstone, Southern Province. Adrenaline capital of Africa, basalt gorges, Devil's Pool safe precipice swim (seasonal: Sept-Dec), sunset cruises.
- South Luangwa National Park: Mfuwe, Eastern Province. High leopard density, birthplace of walking safaris, predator night drives.
- Lower Zambezi National Park: Chirundu, Lusaka Province. Eleanor/elephant canoe channels, tiger fishing challenge, pristine island fly camping.
- Lake Tanganyika (Sumbu Coast): Crystal clear endemic cichlid snorkeling, Sumbu shoreline wildlife, beach relaxation.
- Kafue National Park: Busanga marshes, old savannah wilderness, hot air ballooning, tree-climbing lions.

2. CORE TOUR PACKAGES:
- "Hidden Gem Shantumbu Falls Tour" (1 Day, ZK 650): Escarpment trekking, waterfall baths, picnic snacks, private transport from Lusaka.
- "Kafue Wilderness & River Boat Group Tour" (4 Days, ZK 11,000): River boat cruise, elephant/crocodile spot, Busanga lions 4x4, bush-braai under stars, return road shuttle from Lusaka.
- "Weekend Mosi Explorer" (3 Days, ZK 9,100): Guided Victoria Falls canopy walking, Zambezi luxury sunset cruise, Livingstone heritage tour, airport transfers.
- "Luangwa Wild Predator Safari" (7 Days, ZK 22,000): Guided bushwalking safaris, nocturnal spotlighting predator drives, luxury wood chalets, eco-camps.
- "Zambian Rivers & Wilderness Expedition" (12 Days, ZK 43,000): Full pinnacle safari covering South Luangwa, Lower Zambezi, Kafue Busanga, and Victoria Falls with regional charter flights and private bush chefs.

3. SPECIAL TRADITIONAL CEREMONIES PACKAGES (Pricing Not Indicated / Bespoke Quotes on Request):
We arrange premium, fully guided VIP transfers, permits, royal tribal court permissions, luxury camping/lodge stays, and exclusive viewing seats for Zambia's premium cultural ceremonies:
- "Kuomboka Traditional Pageant" (Western Province, April): Witness the Litunga (King of the Lozi people) travel in the giant royal barge (Nalikwanda), paddled by 100 warriors under deep royal drumbeats over rising flooded plains.
- "Nc'wala Thanksgiving Ceremony" (Eastern Province, late February): Observe the Ngoni warrior impasela dance, thanksgiving rites for the fresh harvests, and paramount chief Mpezeni's ancient royal blessings.
- "Umutomboko Conquest Triumph" (Luapula Province, late July): See Mwata Kazembe perform the dramatic sword-slashing Mutomboko conquest dance dressed in heavy layered royal skirts.
- "Shimunenga Cow Pageant & Parade" (Southern Province, Sept/Oct): Experience the Ila people's cattle river-crossings across the wild Kafue Flats with beautiful cultural chants.
- "Likumbi Lya Mize & Makishi Masquerade" (Northwestern Province, August): Unlock the ancient world of the Makishi spirits, featuring beautiful woodcarvings, fire-circles, and initiates' masks.
*Note: Due to variable lunar calendars, royal decrees, and complex flight/transport arrangements, these packages have Bespoke Pricing. Interested guests details can be submitted under "Special Packages" in this applet, or they can chat directly with our expert Banji Luyando.*

4. LOGISTICS AND PAYMENTS:
- Support standard secure cards and popular automated Local Mobile Money transfers (Airtel Money, MTN MoMo, Zamtel) with immediate booking validation.
- Free date rescheduling up to 30 days prior. Fully refundable if canceled 45 days or more prior.
- Assist with visa-free entries (free for USA, UK, EU, Canada, GCC, etc.) and health protocols (Yellow Fever certificate might be needed, malaria prophylaxis recommended).

TONE: Keep your answers elegant, scannable, and extremely welcoming. Do not make up any packages or pricing that are not listed above. Mention that bookings can be made directly in this applet by opening "Book Now" or clicking the WhatsApp shortcut for direct agent support with Banji Luyando. Limit output size to keep responses compact and highly engaging.`;

      // 1. If OpenAI key is present, prioritize gpt-4o-mini
      if (openaiKey) {
        try {
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${openaiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: systemInstruction
                },
                {
                  role: "user",
                  content: message
                }
              ],
              temperature: 0.7
            })
          });

          if (!response.ok) {
            throw new Error(`OpenAI API responded with status ${response.status}`);
          }

          const data: any = await response.json();
          const reply = data.choices?.[0]?.message?.content || "I couldn't process this trail request.";
          res.json({ reply });
          return;
        } catch (openaiError) {
          console.error("OpenAI API error, falling back to Gemini if available:", openaiError);
          if (!geminiKey) {
            res.status(500).json({ reply: "OpenAI endpoint failure and no backup engine found. Please check credentials." });
            return;
          }
        }
      }

      // 2. Fallback to Gemini if Gemini Key is present (or as primary path if OpenAI is missing)
      if (geminiKey) {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: message,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        const reply = response.text || "I was unable to formulate a response at this moment. Let's try again shortly!";
        res.json({ reply });
        return;
      }

      res.status(500).json({ reply: "No AI services are currently available. Check configuration parameters." });
    } catch (error: any) {
      console.error("AI API Error:", error);
      res.status(500).json({ 
        reply: "We encountered a momentary dust storm on the safari path! Please retry or message our team directly." 
      });
    }
  });

  // ─── AUTHENTICATION & SESSION CONFIG ───
  const JWT_SECRET = process.env.JWT_SECRET || "lucid_trails_secret_key_2026_zambia";
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30d";

  const signToken = (user: any) =>
    jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

  // requireAuth Middleware (User-specified)
  function requireAuth(req: any, res: any, next: any) {
    const authHeader = req.headers.authorization || req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Unauthorized: No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ success: false, message: 'Unauthorized: Invalid token.' });
      return;
    }
  }

  // Authentication Middleware alias for backward-compatibility
  function authenticateToken(req: any, res: any, next: any) {
    requireAuth(req, res, next);
  }

  // Admin Authorization Middleware
  function requireAdmin(req: any, res: any, next: any) {
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({ success: false, message: "Access forbidden. Administrative privileges required." });
      return;
    }
    next();
  }

  // ─── AUTH CONTROLLER ENDPOINTS ───

  // POST /api/register — simple registration endpoint
  app.post("/api/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }

    try {
      // Check if email already exists
      const existing = await query('SELECT * FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        res.status(400).json({ success: false, message: 'Email already registered.' });
        return;
      }

      // Hash password using bcryptjs
      const password_hash = await bcrypt.hash(password, 10);

      // Insert user (role defaults to traveler unless specified)
      const result = await query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role, created_at`,
        [name, email, password_hash, role || 'traveler']
      );

      const user = result.rows[0];
      // Sync to Firestore 'clients' collection for unified admin CRM dashboard
      await syncUserToFirestore(String(user.id), user.name, user.email, "");

      res.status(201).json({ success: true, user });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // POST /api/auth/register — traveler registration
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: "Name, email, and password are required." });
      return;
    }

    try {
      const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
      if (existing.rows.length > 0) {
        res.status(409).json({ success: false, message: "Email already registered." });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const result = await query(
        `INSERT INTO users (name, email, password, phone, role)
         VALUES ($1, $2, $3, $4, 'traveler')
         RETURNING id, name, email, phone, role, created_at`,
        [name, email, hashedPassword, phone || null]
      );

      const user = result.rows[0];
      const token = signToken(user);

      // Sync to Firestore 'clients' collection for unified admin CRM dashboard
      await syncUserToFirestore(String(user.id), user.name, user.email, phone || "");

      res.status(201).json({ success: true, token, user });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // POST /api/login — simple login endpoint requested by user
  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: "Email and password are required." });
      return;
    }

    try {
      // Find user by email
      const result = await query("SELECT * FROM users WHERE email = $1", [email]);
      if (result.rows.length === 0) {
        res.status(401).json({ success: false, message: "Invalid credentials." });
        return;
      }

      const user = result.rows[0];

      // Compare password with support for both password field and password_hash field
      const storedPassword = user.password_hash || user.password;
      const match = await bcrypt.compare(password, storedPassword);
      if (!match) {
        res.status(401).json({ success: false, message: "Invalid credentials." });
        return;
      }

      // ─── CHECK IF SMS MFA IS ENABLED ───
      if (user.mfa_enabled === true || user.mfa_enabled === "true" || user.mfa_enabled === 1) {
        const otp = String(100000 + Math.floor(Math.random() * 900000));
        const expiry = String(Date.now() + 5 * 60 * 1000); // 5 mins
        
        await query(
          "UPDATE users SET temp_otp = $1, temp_otp_expiry = $2 WHERE id = $3 RETURNING *",
          [otp, expiry, user.id]
        );

        console.log(`[SMS MFA MESSAGE] Click-to-Receive dispatched code for ${user.email} (Phone: ${user.phone}): Code is [${otp}].`);

        const tempToken = jwt.sign({ tempUserId: user.id }, JWT_SECRET, { expiresIn: "5m" });

        res.json({
          success: true,
          mfaRequired: true,
          tempToken,
          phone: user.phone || "",
          code: otp
        });
        return;
      }

      // Create JWT token using secret key
      const token = signToken(user);

      res.json({
        success: true,
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // POST /api/mfa/setup — Initiate SMS MFA setup
  app.post("/api/mfa/setup", requireAuth, async (req: any, res) => {
    const { phone } = req.body;
    if (!phone) {
      res.status(400).json({ success: false, message: "Phone number is required for Multi-Factor setup." });
      return;
    }

    try {
      const otp = String(100000 + Math.floor(Math.random() * 900000));
      const expiry = String(Date.now() + 5 * 60 * 1000); // 5 mins

      await query(
        "UPDATE users SET temp_otp = $1, temp_otp_expiry = $2 WHERE id = $3 RETURNING *",
        [otp, expiry, req.user.id]
      );

      console.log(`[SMS MFA SETUP] Verification code sent to ${phone}: [${otp}]`);

      res.json({
        success: true,
        message: "A simulated SMS verification code has been dispatched.",
        code: otp // Returned for sandbox convenience so users don't need real SMS integration to succeed.
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // POST /api/mfa/verify — Verify and enable MFA
  app.post("/api/mfa/verify", requireAuth, async (req: any, res) => {
    const { code, phone } = req.body;
    if (!code || !phone) {
      res.status(400).json({ success: false, message: "Verification parameters missing." });
      return;
    }

    try {
      const result = await query("SELECT * FROM users WHERE id = $1", [req.user.id]);
      if (result.rows.length === 0) {
        res.status(404).json({ success: false, message: "User not found." });
        return;
      }

      const user = result.rows[0];
      const now = Date.now();

      if (!user.temp_otp || user.temp_otp !== String(code) || !user.temp_otp_expiry || Number(user.temp_otp_expiry) < now) {
        res.status(400).json({ success: false, message: "Invalid or expired verification code." });
        return;
      }

      // Update user details
      await query(
        "UPDATE users SET mfa_enabled = $1, phone = $2, temp_otp = $3, temp_otp_expiry = $4 WHERE id = $5 RETURNING *",
        [true, phone, null, null, req.user.id]
      );

      res.json({
        success: true,
        message: "Two-Factor SMS Authentication has been successfully enabled!"
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // POST /api/mfa/disable — Disable MFA
  app.post("/api/mfa/disable", requireAuth, async (req: any, res) => {
    try {
      await query(
        "UPDATE users SET mfa_enabled = $1, temp_otp = $2, temp_otp_expiry = $3 WHERE id = $4 RETURNING *",
        [false, null, null, req.user.id]
      );

      res.json({
        success: true,
        message: "Two-Factor SMS Authentication has been disabled."
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // POST /api/mfa/login-verify — Verify code during login
  app.post("/api/mfa/login-verify", async (req, res) => {
    const { tempToken, code } = req.body;
    if (!tempToken || !code) {
      res.status(400).json({ success: false, message: "Verification token and OTP code are required." });
      return;
    }

    try {
      let decoded: any;
      try {
        decoded = jwt.verify(tempToken, JWT_SECRET);
      } catch (err) {
        res.status(400).json({ success: false, message: "Verification session has expired. Please log in again." });
        return;
      }

      const tempUserId = decoded.tempUserId;
      const result = await query("SELECT * FROM users WHERE id = $1", [tempUserId]);
      if (result.rows.length === 0) {
        res.status(404).json({ success: false, message: "User session not found." });
        return;
      }

      const user = result.rows[0];
      const now = Date.now();

      if (!user.temp_otp || user.temp_otp !== String(code) || !user.temp_otp_expiry || Number(user.temp_otp_expiry) < now) {
        res.status(400).json({ success: false, message: "Incorrect or expired SMS verification code." });
        return;
      }

      // Clear the temporary OTP
      await query(
        "UPDATE users SET temp_otp = $1, temp_otp_expiry = $2 WHERE id = $3 RETURNING *",
        [null, null, user.id]
      );

      const token = signToken(user);
      res.json({
        success: true,
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // POST /api/auth/login — traveler and admin login
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: "Email and password are required." });
      return;
    }

    try {
      const result = await query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      const user = result.rows[0];

      if (!user || !(await bcrypt.compare(password, user.password_hash || user.password))) {
        res.status(401).json({ success: false, message: "Incorrect email or password." });
        return;
      }

      // ─── CHECK IF SMS MFA IS ENABLED ───
      if (user.mfa_enabled === true || user.mfa_enabled === "true" || user.mfa_enabled === 1) {
        const otp = String(100000 + Math.floor(Math.random() * 900000));
        const expiry = String(Date.now() + 5 * 60 * 1000); // 5 mins
        
        await query(
          "UPDATE users SET temp_otp = $1, temp_otp_expiry = $2 WHERE id = $3 RETURNING *",
          [otp, expiry, user.id]
        );

        console.log(`[SMS MFA MESSAGE/AUTH] Code for ${user.email}: Code is [${otp}].`);

        const tempToken = jwt.sign({ tempUserId: user.id }, JWT_SECRET, { expiresIn: "5m" });

        res.json({
          success: true,
          mfaRequired: true,
          tempToken,
          phone: user.phone || "",
          code: otp
        });
        return;
      }

      const token = signToken(user);

      // Never send the password back
      delete user.password;
      delete user.password_hash;

      res.json({ success: true, token, user });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // GET /api/auth/me — get current logged in profile
  app.get("/api/auth/me", requireAuth, async (req: any, res) => {
    try {
      const result = await query(
        "SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1",
        [req.user.id]
      );
      res.json({ success: true, user: result.rows[0] });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // GET /api/admin/clients — fetch live database clients for Elite Explorer CRM Client Directory
  app.get("/api/admin/clients", async (req, res) => {
    try {
      // Fetch all users
      const usersRes = await query("SELECT id, name, email, phone, role, created_at FROM users");
      const users = usersRes.rows.filter((u: any) => u.role !== "admin"); // Focus on customers/travelers

      // Fetch all bookings to compile stats
      const bookingsRes = await query(
        "SELECT b.*, u.name AS user_name, u.email, t.title AS tour_title, t.destination FROM bookings b JOIN users u ON b.user_id = u.id JOIN tours t ON b.tour_id = t.id ORDER BY b.created_at DESC"
      );
      const bookings = bookingsRes.rows;

      const clients = users.map((u: any) => {
        const userBookings = bookings.filter((b: any) => String(b.user_id) === String(u.id));
        const totalBookings = userBookings.length;
        const totalSpent = userBookings
          .filter((b: any) => b.status !== "cancelled")
          .reduce((sum: number, b: any) => sum + Number(b.total_price || 0), 0);

        const paidCount = userBookings.filter((b: any) => b.status === "confirmed").length;
        const outstandingCount = userBookings.filter((b: any) => b.status === "pending").length;

        return {
          uid: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || "",
          createdAt: u.created_at,
          totalBookings,
          totalSpent,
          billingSummary: {
            totalInvoices: totalBookings,
            paid: paidCount,
            outstanding: outstandingCount
          }
        };
      });

      res.json({ success: true, clients });
    } catch (err: any) {
      console.error("Error in GET /api/admin/clients:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // DELETE /api/admin/clients/:id — delete/purge a client from elite database
  app.delete("/api/admin/clients/:id", async (req, res) => {
    try {
      const clientId = req.params.id;
      await query("DELETE FROM users WHERE id = $1", [clientId]);
      res.json({ success: true, message: "Client profile successfully purged from Elite database." });
    } catch (err: any) {
      console.error("Error in DELETE /api/admin/clients:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  });


  // ─── BOOKINGS CONTROLLER ENDPOINTS ───

  // POST /api/bookings — logged-in traveler books a tour
  app.post("/api/bookings", requireAuth, async (req: any, res) => {
    const { tour_id, seats, notes } = req.body;

    if (!tour_id || !seats) {
      res.status(400).json({ success: false, message: "tour_id and seats are required." });
      return;
    }

    try {
      // Check tour exists and has enough seats
      const tourResult = await query(
        "SELECT * FROM tours WHERE id = $1 AND is_active = true",
        [tour_id]
      );

      if (tourResult.rows.length === 0) {
        res.status(404).json({ success: false, message: "Tour not found." });
        return;
      }

      const tour = tourResult.rows[0];

      if (tour.available_seats < seats) {
        res.status(400).json({
          success: false,
          message: `Only ${tour.available_seats} seat(s) available.`
        });
        return;
      }

      const total_price = tour.price * seats;

      // Create booking and reduce available seats in one transaction
      await query("BEGIN");

      const booking = await query(
        `INSERT INTO bookings (user_id, tour_id, seats, total_price, notes, status)
         VALUES ($1, $2, $3, $4, $5, 'pending')
         RETURNING *`,
        [req.user.id, tour_id, seats, total_price, notes || null]
      );

      await query(
        "UPDATE tours SET available_seats = available_seats - $1 WHERE id = $2",
        [seats, tour_id]
      );

      await query("COMMIT");

      res.status(201).json({ success: true, booking: booking.rows[0] });
    } catch (err: any) {
      await query("ROLLBACK");
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // GET /api/bookings/my — traveler sees their own bookings
  app.get("/api/bookings/my", requireAuth, async (req: any, res) => {
    try {
      const result = await query(
        `SELECT b.*, t.title AS tour_title, t.destination, t.departure_date, t.image_url
         FROM bookings b
         JOIN tours t ON b.tour_id = t.id
         WHERE b.user_id = $1
         ORDER BY b.created_at DESC`,
        [req.user.id]
      );

      res.json({ success: true, bookings: result.rows });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // GET /api/bookings — admin sees all bookings
  app.get("/api/bookings", requireAuth, requireAdmin, async (req, res) => {
    try {
      const result = await query(
        `SELECT b.*, u.name AS user_name, u.email, t.title AS tour_title, t.destination
         FROM bookings b
         JOIN users u ON b.user_id = u.id
         JOIN tours t ON b.tour_id = t.id
         ORDER BY b.created_at DESC`
      );

      res.json({ success: true, count: result.rows.length, bookings: result.rows });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // PATCH /api/bookings/:id/status — admin confirms or cancels
  app.patch("/api/bookings/:id/status", requireAuth, requireAdmin, async (req, res) => {
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "cancelled"];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: "Status must be pending, confirmed, or cancelled." });
      return;
    }

    try {
      // If cancelling, return the seats
      const existing = await query("SELECT * FROM bookings WHERE id = $1", [req.params.id]);
      if (existing.rows.length === 0) {
        res.status(404).json({ success: false, message: "Booking not found." });
        return;
      }

      const booking = existing.rows[0];

      await query("BEGIN");

      const result = await query(
        `UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [status, req.params.id]
      );

      // Restore seats if cancelling a non-cancelled booking
      if (status === "cancelled" && booking.status !== "cancelled") {
        await query(
          "UPDATE tours SET available_seats = available_seats + $1 WHERE id = $2",
          [booking.seats, booking.tour_id]
        );
      }

      await query("COMMIT");

      res.json({ success: true, booking: result.rows[0] });
    } catch (err: any) {
      await query("ROLLBACK");
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // DELETE /api/bookings/:id — traveler cancels their own booking or admin cancels any
  app.delete("/api/bookings/:id", requireAuth, async (req: any, res) => {
    try {
      const result = await query(
        "SELECT * FROM bookings WHERE id = $1",
        [req.params.id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ success: false, message: "Booking not found." });
        return;
      }

      const booking = result.rows[0];
      const requestedId = booking.user_id;

      if (req.user.role !== 'admin' && req.user.id !== requestedId) {
        res.status(403).json({ success: false, message: "Access forbidden. You do not have permission to cancel this booking." });
        return;
      }

      if (booking.status === "cancelled") {
        res.status(400).json({ success: false, message: "Booking is already cancelled." });
        return;
      }

      await query("BEGIN");

      await query(
        "UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2",
        ["cancelled", req.params.id]
      );

      await query(
        "UPDATE tours SET available_seats = available_seats + $1 WHERE id = $2",
        [booking.seats, booking.tour_id]
      );

      await query("COMMIT");

      res.json({ success: true, message: "Booking cancelled successfully." });
    } catch (err: any) {
      await query("ROLLBACK");
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ─── TOURS CONTROLLER ENDPOINTS ───

  // GET /api/tours — public, anyone can browse
  app.get("/api/tours", async (req: any, res) => {
    try {
      const { destination, min_price, max_price, duration } = req.query;

      let sql = 'SELECT * FROM tours WHERE is_active = true';
      const params = [];
      let idx = 1;

      if (destination) {
        sql += ` AND destination ILIKE $${idx++}`;
        params.push(`%${destination}%`);
      }
      if (min_price) {
        sql += ` AND price >= $${idx++}`;
        params.push(Number(min_price));
      }
      if (max_price) {
        sql += ` AND price <= $${idx++}`;
        params.push(Number(max_price));
      }
      if (duration) {
        sql += ` AND duration_days = $${idx++}`;
        params.push(Number(duration));
      }

      sql += ' ORDER BY created_at DESC';

      const result = await query(sql, params);
      res.json({ success: true, count: result.rows.length, tours: result.rows });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // GET /api/tours/:id — public
  app.get("/api/tours/:id", async (req: any, res) => {
    try {
      const result = await query('SELECT * FROM tours WHERE id = $1 AND is_active = true', [req.params.id]);

      if (result.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Tour not found.' });
        return;
      }

      res.json({ success: true, tour: result.rows[0] });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // POST /api/tours — admin only
  app.post("/api/tours", requireAuth, requireAdmin, async (req: any, res) => {
    const { title, description, destination, duration_days, price, max_seats, image_url, departure_date } = req.body;

    if (!title || !destination || !price || !departure_date) {
      res.status(400).json({ success: false, message: 'Title, destination, price, and departure date are required.' });
      return;
    }

    try {
      const result = await query(
        `INSERT INTO tours (title, description, destination, duration_days, price, max_seats, available_seats, image_url, departure_date)
         VALUES ($1, $2, $3, $4, $5, $6, $6, $7, $8)
         RETURNING *`,
        [title, description, destination, duration_days || 1, price, max_seats || 10, image_url || null, departure_date]
      );

      res.status(201).json({ success: true, tour: result.rows[0] });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // PATCH /api/tours/:id — admin only
  app.patch("/api/tours/:id", requireAuth, requireAdmin, async (req: any, res) => {
    const { title, description, destination, duration_days, price, max_seats, image_url, departure_date, is_active } = req.body;

    try {
      const result = await query(
        `UPDATE tours SET
          title          = COALESCE($1, title),
          description    = COALESCE($2, description),
          destination    = COALESCE($3, destination),
          duration_days  = COALESCE($4, duration_days),
          price          = COALESCE($5, price),
          max_seats      = COALESCE($6, max_seats),
          image_url      = COALESCE($7, image_url),
          departure_date = COALESCE($8, departure_date),
          is_active      = COALESCE($9, is_active),
          updated_at     = NOW()
         WHERE id = $10
         RETURNING *`,
        [title, description, destination, duration_days, price, max_seats, image_url, departure_date, is_active, req.params.id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Tour not found.' });
        return;
      }

      res.json({ success: true, tour: result.rows[0] });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // DELETE /api/tours/:id — admin only (soft delete)
  app.delete("/api/tours/:id", requireAuth, requireAdmin, async (req: any, res) => {
    try {
      await query('UPDATE tours SET is_active = false WHERE id = $1', [req.params.id]);
      res.json({ success: true, message: 'Tour deactivated.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Serve frontend assets using Vite middleware or compiled static files
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Dreamscape Tours ZM server running on port ${PORT}`);
  });
}

startServer();

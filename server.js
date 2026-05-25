/**
 * server.js
 *
 * The Lighthouse Restaurant — Express Application Server
 *
 * Responsibilities:
 *  - Serves all existing static files (HTML, CSS, JS, images) from the project root
 *  - Serves the admin dashboard at /admin
 *  - Mounts the reservation REST API at /api/reservations
 *  - Manages admin session authentication
 *
 * Usage:
 *   npm start          — production
 *   npm run dev        — development (auto-restarts on file changes via --watch)
 *
 * Environment Variables:
 *   PORT             — HTTP port to listen on (default: 3000)
 *   SESSION_SECRET   — Secret key for signing session cookies (default: insecure dev key)
 *   ADMIN_USER       — Admin dashboard username (default: "admin")
 *   ADMIN_PASS       — Admin dashboard password (default: "lighthouse2026")
 *
 * ─────────────────────────────────────────────────────────────────────────
 * FUTURE IMPROVEMENTS:
 *  - Email Notifications: Integrate Nodemailer + an SMTP provider (Gmail App
 *    Password or SendGrid) to send confirmation emails to customers when a
 *    reservation is created and when the admin confirms it.
 *    See: https://nodemailer.com/about/
 *  - Production Hardening: Add helmet.js for HTTP security headers, cors for
 *    cross-origin policy, and compression for gzip responses.
 *  - HTTPS: Use a reverse proxy (Nginx/Caddy) or a platform like Railway or
 *    Render that handles SSL termination automatically.
 *  - Auth Upgrade: Replace simple session auth with OAuth 2.0 or JWT-based
 *    auth for a stateless, scalable architecture.
 *  - Rate Limiting: Add express-rate-limit on /admin/login and POST
 *    /api/reservations to mitigate brute-force and spam attacks.
 * ─────────────────────────────────────────────────────────────────────────
 */

const express = require("express");
const session = require("express-session");
const path = require("path");

const db = require("./db/database");
const reservationRoutes = require("./routes/reservations");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ─────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "lighthouse-dev-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 8 * 60 * 60 * 1000,
    },
  })
);

// ── Routes ─────────────────────────────────────────────────────────────────

app.use("/admin", adminRoutes);
app.use("/api/reservations", reservationRoutes);
app.use(express.static(path.join(__dirname)));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ── Global Error Handler ───────────────────────────────────────────────────

app.use((err, req, res, _next) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({ error: "An unexpected server error occurred." });
});

// ── Async Startup ──────────────────────────────────────────────────────────
// sql.js loads its WASM binary asynchronously, so we await DB initialisation
// before accepting any HTTP connections.

(async () => {
  try {
    await db.initialize();

    app.listen(PORT, () => {
      console.log("");
      console.log("  🌊  The Lighthouse — Reservation Server");
      console.log("  ─────────────────────────────────────────");
      console.log(`  Site:   http://localhost:${PORT}`);
      console.log(`  Admin:  http://localhost:${PORT}/admin`);
      console.log(`  API:    http://localhost:${PORT}/api/reservations`);
      console.log("");
      console.log("  Admin credentials:");
      console.log(`    Username: ${process.env.ADMIN_USER || "admin"}`);
      console.log(`    Password: ${process.env.ADMIN_PASS || "lighthouse2026"}`);
      console.log("");
      console.log("  Press Ctrl+C to stop the server.");
      console.log("");
    });
  } catch (err) {
    console.error("  ❌  Failed to start server:", err);
    process.exit(1);
  }
})();

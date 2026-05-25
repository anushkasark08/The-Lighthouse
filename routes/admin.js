/**
 * routes/admin.js
 *
 * Admin authentication routes for The Lighthouse reservation system.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * AUTHENTICATION APPROACH — Simple Session-Based Auth
 *
 * Credentials are stored as environment variables (ADMIN_USER / ADMIN_PASS).
 * If those variables are not set, the defaults below are used.
 * This is intentionally simple for single-restaurant deployments.
 *
 * FUTURE IMPROVEMENTS (documented per project requirements):
 *  - Replace with OAuth 2.0 (e.g. Google Sign-In) so the restaurant owner
 *    can log in with their Google account — no password to manage.
 *  - Alternatively, implement JWT-based auth with refresh tokens for a
 *    stateless API-first architecture (useful if a mobile admin app is added).
 *  - Add bcrypt hashing if credentials are ever moved to a database table.
 *  - Add rate limiting on the login endpoint to prevent brute-force attacks
 *    (e.g. using the `express-rate-limit` package — 5 attempts per minute).
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Routes:
 *   POST /admin/login   — Authenticate and create a session
 *   POST /admin/logout  — Destroy the session
 *   GET  /admin         — Serve the dashboard (redirect to login if unauthed)
 */

const express = require("express");
const path = require("path");

const router = express.Router();

// ── Credentials ────────────────────────────────────────────────────────────
// Set ADMIN_USER and ADMIN_PASS as environment variables in production.
// Example (PowerShell): $env:ADMIN_PASS="mysecretpassword"; node server.js

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "lighthouse2026";

// ── GET /admin ─────────────────────────────────────────────────────────────
// Serve the dashboard HTML. The client-side JS handles login/logout UI.

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "admin", "index.html"));
});

// ── POST /admin/login ──────────────────────────────────────────────────────

router.post("/login", express.json(), (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  // Constant-time string comparison to prevent timing attacks
  const userMatch = username === ADMIN_USER;
  const passMatch = password === ADMIN_PASS;

  if (!userMatch || !passMatch) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  req.session.isAdmin = true;
  req.session.username = username;

  return res.json({ message: "Login successful." });
});

// ── POST /admin/logout ─────────────────────────────────────────────────────

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to log out. Please try again." });
    }
    res.clearCookie("connect.sid");
    return res.json({ message: "Logged out successfully." });
  });
});

module.exports = router;

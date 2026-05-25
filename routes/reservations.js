/**
 * routes/reservations.js
 *
 * Public + Admin REST API endpoints for the reservation system.
 *
 * Public:
 *   POST /api/reservations         — Create a new reservation (from the frontend form)
 *
 * Admin (session-authenticated):
 *   GET  /api/reservations         — List all reservations (filter by ?status=)
 *   GET  /api/reservations/:id     — Get a single reservation
 *   PATCH /api/reservations/:id    — Update status (confirm / cancel)
 *   DELETE /api/reservations/:id   — Delete a reservation
 */

const express = require("express");
const { body, param, query, validationResult } = require("express-validator");
const db = require("../db/database");

const router = express.Router();

// Allowed time slots (must match the HTML <select> options)
const ALLOWED_TIMES = [
  "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00",
  "17:00", "18:00", "19:00", "20:00", "21:00",
];

// ── Middleware ─────────────────────────────────────────────────────────────

/** Require an active admin session for protected routes. */
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ error: "Authentication required." });
}

/** Send the first validation error as a JSON 400 response. */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// ── POST /api/reservations ─────────────────────────────────────────────────
// Public endpoint — called by the frontend reservation form.

router.post(
  "/",
  [
    body("name")
      .trim()
      .notEmpty().withMessage("Name is required.")
      .isLength({ min: 2, max: 100 }).withMessage("Name must be 2–100 characters.")
      .matches(/^[A-Za-z\s'-]+$/).withMessage("Name may only contain letters, spaces, hyphens, and apostrophes."),

    body("email")
      .trim()
      .notEmpty().withMessage("Email is required.")
      .isEmail().withMessage("Please enter a valid email address.")
      .normalizeEmail(),

    body("phone")
      .trim()
      .notEmpty().withMessage("Phone is required.")
      .matches(/^[\d\s\-()+]{7,20}$/).withMessage("Please enter a valid phone number."),

    body("guests")
      .notEmpty().withMessage("Number of guests is required.")
      .isInt({ min: 1, max: 8 }).withMessage("Guests must be between 1 and 8."),

    body("date")
      .notEmpty().withMessage("Date is required.")
      .isISO8601().withMessage("Invalid date format.")
      .custom((value) => {
        const selected = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selected < today) throw new Error("Reservation date must be today or a future date.");
        return true;
      }),

    body("time")
      .notEmpty().withMessage("Time is required.")
      .isIn(ALLOWED_TIMES).withMessage("Please select a valid time slot."),

    body("requests")
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage("Special requests must be under 500 characters.")
      .escape(),
  ],
  handleValidationErrors,
  (req, res) => {
    try {
      const reservation = db.createReservation({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        guests: parseInt(req.body.guests, 10),
        date: req.body.date,
        time: req.body.time,
        requests: req.body.requests || "",
      });

      return res.status(201).json({
        message: "Reservation received! We will contact you within 24 hours to confirm.",
        reservation,
      });
    } catch (err) {
      console.error("Error creating reservation:", err);
      return res.status(500).json({ error: "An unexpected error occurred. Please try again." });
    }
  }
);

// ── GET /api/reservations ──────────────────────────────────────────────────
// Admin — list all reservations, optionally filtered by status.

router.get(
  "/",
  requireAdmin,
  [
    query("status")
      .optional()
      .isIn(["pending", "confirmed", "cancelled"]).withMessage("Invalid status filter."),
  ],
  handleValidationErrors,
  (req, res) => {
    try {
      const reservations = db.getAllReservations(req.query.status || null);
      const counts = db.getStatusCounts();
      return res.json({ reservations, counts });
    } catch (err) {
      console.error("Error fetching reservations:", err);
      return res.status(500).json({ error: "Failed to fetch reservations." });
    }
  }
);

// ── GET /api/reservations/:id ──────────────────────────────────────────────
// Admin — get a single reservation by ID.

router.get(
  "/:id",
  requireAdmin,
  [param("id").isInt({ min: 1 }).withMessage("Invalid reservation ID.")],
  handleValidationErrors,
  (req, res) => {
    const reservation = db.getReservationById(parseInt(req.params.id, 10));
    if (!reservation) return res.status(404).json({ error: "Reservation not found." });
    return res.json({ reservation });
  }
);

// ── PATCH /api/reservations/:id ────────────────────────────────────────────
// Admin — update the status of a reservation.

router.patch(
  "/:id",
  requireAdmin,
  [
    param("id").isInt({ min: 1 }).withMessage("Invalid reservation ID."),
    body("status")
      .notEmpty().withMessage("Status is required.")
      .isIn(["pending", "confirmed", "cancelled"]).withMessage("Status must be pending, confirmed, or cancelled."),
  ],
  handleValidationErrors,
  (req, res) => {
    try {
      const updated = db.updateReservationStatus(
        parseInt(req.params.id, 10),
        req.body.status
      );
      if (!updated) return res.status(404).json({ error: "Reservation not found." });
      return res.json({ message: "Status updated successfully.", reservation: updated });
    } catch (err) {
      console.error("Error updating reservation:", err);
      return res.status(500).json({ error: "Failed to update reservation." });
    }
  }
);

// ── DELETE /api/reservations/:id ───────────────────────────────────────────
// Admin — permanently delete a reservation.

router.delete(
  "/:id",
  requireAdmin,
  [param("id").isInt({ min: 1 }).withMessage("Invalid reservation ID.")],
  handleValidationErrors,
  (req, res) => {
    try {
      const deleted = db.deleteReservation(parseInt(req.params.id, 10));
      if (!deleted) return res.status(404).json({ error: "Reservation not found." });
      return res.json({ message: "Reservation deleted successfully." });
    } catch (err) {
      console.error("Error deleting reservation:", err);
      return res.status(500).json({ error: "Failed to delete reservation." });
    }
  }
);

module.exports = router;

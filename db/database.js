/**
 * db/database.js
 *
 * SQLite database layer using sql.js — a pure JavaScript / WebAssembly port
 * of SQLite that requires NO native compilation (no Visual Studio needed).
 *
 * Persistence strategy:
 *   - On startup:  read `reservations.db` from disk into a sql.js in-memory DB.
 *   - After every write (INSERT / UPDATE / DELETE): export the in-memory DB
 *     and write it back to disk atomically.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * FUTURE IMPROVEMENTS (documented per project requirements):
 *  - Migrate to PostgreSQL for multi-server / high-traffic deployments.
 *    Replace sql.js with the `pg` driver and update all query helpers to use
 *    async/await with parameterised queries.
 *  - Add a migrations framework (e.g. `db-migrate` or `knex`) to manage
 *    schema changes over time without manual SQL edits.
 *  - Use WAL-mode (`PRAGMA journal_mode=WAL`) when moving to better-sqlite3
 *    or PostgreSQL for improved read/write concurrency.
 * ─────────────────────────────────────────────────────────────────────────
 */

const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "reservations.db");

/** The live sql.js Database instance — populated by initialize(). */
let db = null;

// ── Initialisation ─────────────────────────────────────────────────────────

/**
 * Load (or create) the SQLite database and create the schema if needed.
 * Must be awaited once before any other function in this module is called.
 * Called from server.js before app.listen().
 */
async function initialize() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database(); // fresh in-memory DB
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS reservations (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      email       TEXT    NOT NULL,
      phone       TEXT    NOT NULL,
      guests      INTEGER NOT NULL,
      date        TEXT    NOT NULL,
      time        TEXT    NOT NULL,
      requests    TEXT    DEFAULT '',
      status      TEXT    NOT NULL DEFAULT 'pending',
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `);

  persist(); // ensure the file exists on first run
  console.log(`  📦  Database ready: ${DB_PATH}`);
}

// ── Low-level helpers ──────────────────────────────────────────────────────

/**
 * Write the current in-memory database back to disk.
 * Called automatically after every write operation.
 */
function persist() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

/**
 * Execute a write statement (INSERT / UPDATE / DELETE).
 * @param {string} sql
 * @param {any[]} params - positional parameter array
 */
function run(sql, params = []) {
  db.run(sql, params);
  persist();
}

/**
 * Fetch a single row. Returns undefined if not found.
 * @param {string} sql
 * @param {any[]} params
 * @returns {Object|undefined}
 */
function get(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const exists = stmt.step();
  if (!exists) { stmt.free(); return undefined; }
  const row = stmt.getAsObject();
  stmt.free();
  return row;
}

/**
 * Fetch all matching rows as an array.
 * @param {string} sql
 * @param {any[]} params
 * @returns {Object[]}
 */
function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

/**
 * Return the row id of the most recently inserted row.
 * @returns {number}
 */
function lastInsertRowid() {
  const row = get("SELECT MAX(id) AS id FROM reservations");
  return row ? row.id : null;
}

// ── Public query functions ─────────────────────────────────────────────────

/**
 * Insert a new reservation with status 'pending'.
 * @param {{ name, email, phone, guests, date, time, requests }} data
 * @returns {Object} The newly created reservation row.
 */
function createReservation(data) {
  run(
    `INSERT INTO reservations (name, email, phone, guests, date, time, requests, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [data.name, data.email, data.phone, data.guests, data.date, data.time, data.requests || ""]
  );
  return getReservationById(lastInsertRowid());
}

/**
 * Return all reservations, optionally filtered by status.
 * Results are ordered by date then time (soonest first).
 * @param {string|null} status
 * @returns {Object[]}
 */
function getAllReservations(status = null) {
  if (status) {
    return all(
      "SELECT * FROM reservations WHERE status = ? ORDER BY date ASC, time ASC",
      [status]
    );
  }
  return all("SELECT * FROM reservations ORDER BY date ASC, time ASC");
}

/**
 * Return a single reservation by its ID, or undefined.
 * @param {number} id
 * @returns {Object|undefined}
 */
function getReservationById(id) {
  return get("SELECT * FROM reservations WHERE id = ?", [id]);
}

/**
 * Update the status of a reservation.
 * @param {number} id
 * @param {'pending'|'confirmed'|'cancelled'} status
 * @returns {Object|undefined} The updated row, or undefined if not found.
 */
function updateReservationStatus(id, status) {
  const before = getReservationById(id);
  if (!before) return undefined;
  run("UPDATE reservations SET status = ? WHERE id = ?", [status, id]);
  return getReservationById(id);
}

/**
 * Delete a reservation by ID.
 * @param {number} id
 * @returns {boolean} true if a row was deleted.
 */
function deleteReservation(id) {
  const before = getReservationById(id);
  if (!before) return false;
  run("DELETE FROM reservations WHERE id = ?", [id]);
  return true;
}

/**
 * Return reservation counts grouped by status.
 * @returns {{ pending: number, confirmed: number, cancelled: number }}
 */
function getStatusCounts() {
  const rows = all("SELECT status, COUNT(*) as count FROM reservations GROUP BY status");
  const counts = { pending: 0, confirmed: 0, cancelled: 0 };
  rows.forEach((r) => { counts[r.status] = r.count; });
  return counts;
}

module.exports = {
  initialize,
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservationStatus,
  deleteReservation,
  getStatusCounts,
};

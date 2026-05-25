# 🌊 The Lighthouse | Fine Dining Restaurant Website

<div align="center">

A premium and fully responsive single-page restaurant website crafted for luxury fine-dining experiences.

Designed with elegant dark aesthetics, immersive visuals, smooth animations, and interactive UI elements to deliver a sophisticated digital presence for modern culinary brands.

🏆 Officially part of **GirlScript Summer of Code 2026 (GSSoC'26)**

</div>

---

## ✨ Features

### 🎨 Premium UI & Branding
- **Flawless Light/Dark Modes**: Intelligently adapts text contrast, glassmorphism, and imagery across themes to ensure perfect readability.
- Elegant dark-themed luxury interface with gold accents.
- Premium typography using **Cormorant Garamond** & **Inter**.
- Smooth transitions, parallax scrolling backgrounds, and engaging hover effects.

---

### 📖 Interactive 3D Flipbook Menu
Say goodbye to flat grids! The menu has been completely reimagined as a fully interactive 3D Flipbook.
- **Realistic 3D Physics**: Built with vanilla CSS (`preserve-3d`, `rotateY`, `cubic-bezier` timing) to simulate the weight and physics of real turning pages.
- **Dynamic Shadows**: Employs complex box-shadows to emulate book creases and spine shading.
- **Smart Bookmarks**: Instantly jump to categories like Breakfast, Lunch, Dinner, Drinks, and Desserts via interactive bookmark tabs.
- **Responsive Degradation**: Gracefully scales down to a readable, stacked layout on mobile devices.

---

### 🗓️ Reservation System & Admin Dashboard
- **Live Reservation Booking**: Interactive form with live field validation preventing past-date bookings.
- **Node.js + Express backend** with REST API.
- **SQLite Database** (via sql.js — zero-config, no native compilation needed).
- **Secure Admin Dashboard**: Session-based authentication with a premium dark-themed management interface at `/admin`.
- **Easy Access**: Features a discreet "Admin Login 🔒" button in the footer for staff access.
- View, confirm, cancel, and delete reservations with sortable tables and status filters.

---

### ⚡ Smooth User Experience
- Sticky glassmorphism navbar (with smart transparency handling in light mode).
- Smooth scrolling navigation & Scroll reveal animations.
- Google Maps Integration with custom grayscale styling.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|----------|
| **HTML5 & CSS3** | Semantic structure, 3D Flipbook architecture, layout & animations |
| **JavaScript (ES6+)** | Frontend interactions, 3D Flipbook logic, DOM manipulation |
| **Node.js + Express** | Backend server & REST API |
| **SQLite (sql.js)** | Reservation database (zero-config, WebAssembly) |
| **express-session** | Admin session authentication |
| **express-validator** | Server-side input validation |

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Anushka-Sarkar/the-lighthouse-restaurant.git
```

### 2️⃣ Navigate to the Project Directory
```bash
cd the-lighthouse-restaurant
```

### 3️⃣ Install Dependencies
```bash
npm install
```

### 4️⃣ Start the Server
```bash
npm start
```

This will launch the server. You'll see:
```
  🌊  The Lighthouse — Reservation Server
  ─────────────────────────────────────────
  Site:   http://localhost:3000
  Admin:  http://localhost:3000/admin
  API:    http://localhost:3000/api/reservations
```
Open `http://localhost:3000` in your browser.
> **Tip:** Use `npm run dev` during development — it auto-restarts the server on file changes.

### 5️⃣ Admin Dashboard
Navigate to `http://localhost:3000/admin` (or click the lock icon in the footer) and log in with:
- **Username:** `admin`
- **Password:** `lighthouse2026`

To change credentials, set environment variables before starting:
```bash
# Linux / macOS
export ADMIN_USER="myuser"
export ADMIN_PASS="mysecretpassword"
npm start

# Windows PowerShell
$env:ADMIN_USER="myuser"
$env:ADMIN_PASS="mysecretpassword"
npm start
```

---

## 🎨 Customization

This project uses **CSS Variables** for easy theme customization.
Modify colors inside `style.css`:
```css
:root {
  --color-primary: #c9a962;
  --color-bg: #1a1714;
  --color-text: #f5f2ed;
  --transition: 0.3s ease;
}
```

---

## 🌟 Future Improvements
- ~~Dark/Light mode toggle~~ ✅ Implemented
- ~~Online reservation backend~~ ✅ Implemented
- ~~Interactive 3D Menu~~ ✅ Implemented
- Email notifications (Nodemailer + SMTP / SendGrid)
- OAuth 2.0 or JWT-based admin authentication
- Rate limiting on login and reservation endpoints
- Accessibility improvements (WCAG 2.1 AA)
- Production hardening (helmet.js, CORS, compression, HTTPS)

---

## 🤝 Contributing
Contributions are welcome and appreciated.

### Steps to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature-name`)
3. Commit your changes (`git commit -m "Added new feature"`)
4. Push the branch (`git push origin feature-name`)
5. Open a Pull Request

---

## 📜 License
This project is licensed under the **MIT License**.

---

## 💖 Acknowledgements
Developed with passion by **Anushka Sarkar**

Special thanks to:
- GirlScript Summer of Code 2026
- Open-source contributors ❤️

---

## 🔗 Repository
GitHub Repository:  
https://github.com/Anushka-Sarkar/the-lighthouse-restaurant
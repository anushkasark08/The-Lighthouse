# 🎨 The Lighthouse - Frontend Client
This is the frontend single page React client application for **The Lighthouse**, built with React 19, Vite, and Vanilla CSS.

## 🚀 Getting Started

### 1️⃣ Install Dependencies
Ensure you are in the `frontend` folder:
```bash
npm install
```

### 2️⃣ Run the App
- **Development Server:**
  ```bash
  npm run dev
  ```
  Open `http://localhost:5173` in your browser.

- **Build for Production:**
  ```bash
  npm run build
  ```

---

## 🛠️ Folder Structure
- `src/api/` - Axios client setup with JWT request interceptors
- `src/context/` - Global state providers (Authentication & Live Menu state)
- `src/components/` - Reusable UI elements (Navbar, Footer, Menu cards, etc.)
- `src/pages/` - Application view pages (Home, Menu with filters, Reservation wizard, User Auth, Admin Dashboard)
- `src/index.css` - CSS Variables and global design system

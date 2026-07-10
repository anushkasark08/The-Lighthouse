# 🗄️ The Lighthouse - Backend API
This is the backend API for **The Lighthouse** restaurant web application, built using Node.js, Express, and MongoDB.

## 🚀 Getting Started

### 1️⃣ Configure Environment Variables
Create a `.env` file in the backend directory (or copy `.env.example`):
```bash
cp .env.example .env
```
Update the variables to match your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lighthouse
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Seed the Database (Optional but Recommended)
To seed 18 menu items, tables, and test users:
```bash
npm run seed
```

### 4️⃣ Run the Server
- **Development mode (with nodemon):**
  ```bash
  npm run dev
  ```
- **Production mode:**
  ```bash
  npm start
  ```

---

## 🛠️ Folder Structure
- `src/config/` - Database connection and seed data
- `src/controllers/` - Express controllers (auth, menu, reservations, reviews)
- `src/middleware/` - JWT protection, role authorization, and validation
- `src/models/` - Mongoose schemas (User, MenuItem, Reservation, Review, Table)
- `src/routes/` - API endpoint definitions
- `src/services/` - Helper services (availability checking, email sending)

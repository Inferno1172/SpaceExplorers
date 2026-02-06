# 🚀 CA2 Wellness & Space Adventure Fullstack App

A **full-stack web application** that blends **wellness tracking** with an immersive **space exploration game**. Built with a **Node.js & Express backend** and a **responsive Vanilla JavaScript frontend**.

Users improve their real-world well-being by completing challenges, earning points, and using those points to progress in a virtual space journey—discovering planets, upgrading spacecraft, and unlocking achievements.

**Author:** Khambhati Moiz Huzefa

---

## 📖 Overview

This application demonstrates a complete full-stack architecture. It features a robust **RESTful API** handling secure authentication, game logic, and data persistence, paired with a **dynamic frontend** that provides an engaging user experience through interactive gamification elements.

---

## 📚 Table of Contents

- [Features](#-features)
- [Technologies Used](#-technologies-used)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [License](#-license)

---

## ✨ Features

### 💻 Frontend Experience

- **Responsive Design** – Optimized for both desktop and mobile devices
- **Dynamic IO** – Real-time UI updates using Vanilla JavaScript & DOM manipulation
- **Interactive HUD** – Visual feedback for points, fuel, and game status
- **Space Theming** – Immersive visual design with shop and discovery interfaces

### 🔐 User & Security

- **Secure Auth** – JWT-based session management
- **Protection** – Google reCAPTCHA v2 & Bcrypt password hashing
- **Account Management** – Password reset via email & profile updates

### 🏆 Gamification

- **Leaderboard** – Global ranking system based on total points
- **Achievements** – Unlockable badges for milestones
- **Progression** – Earn points to purchase upgrades and explore further

### 🧠 Wellness Challenges

- **Challenge Board** – View and participate in daily wellness tasks
- **Tracking** – Record completions and view history
- **Community** – See what challenges others are attempting

### 🌌 Space Adventure

- **Planet Discovery** – Unlock new planets as you travel
- **Space Shop** – Purchase upgrades (Fuel Tanks, Thrusters, etc.)
- **Inventory Management** – Equip/Unequip spacecraft modifications

---

## 🛠 Technologies Used

### Frontend

- **HTML5** – Semantic structure
- **CSS3** – Custom responsive styling (Flexbox/Grid)
- **Bootstrap** – Responsive layout and components
- **JavaScript (ES6+)** – DOM manipulation & async API logic
- **Fetch API** – Handling client-server communication

### Backend

- **Node.js** & **Express** – Server-side logic and API routing
- **MySQL** (via `mysql2`) – Relational database for persistent storage
- **JWT** – JSON Web Tokens for stateless authentication
- **Bcrypt** – Security hashing algorithm
- **Nodemailer** – Email service integration
- **Axios** – Make external API requests e.g. Google reCAPTCHA
- **Crypto** – Create a password reset token that lasts 1 hour

### Dev Tools

- **Nodemon** – Development server monitoring
- **Git** – Version control

---

## 📁 Project Structure

```
BED-CA2-MOIZ/
├─ public/                   # Frontend Static Files
│  ├─ assets/                # Images & Icons
│  ├─ css/                   # Stylesheets
│  ├─ js/                    # Frontend Logic (API, DOM, Auth)
│  ├─ index.html             # Landing Page
│  ├─ login.html             # Auth Pages
│  ├─ discover.html          # Game Pages
│  └─ ...
│
├─ src/                      # Backend Source Code
│  ├─ configs/               # Database Configuration
│  ├─ controllers/           # Route Logic
│  ├─ middleware/            # Auth & Validation
│  ├─ models/                # SQL Queries
│  ├─ routes/                # API Definitions
│  ├─ services/              # External Services (Email, etc.)
│  └─ app.js                 # Express App Setup
│
├─ .env                      # Environment Config
├─ package.json              # Dependencies
└─ README.md                 # Documentation
```

---

## ⚡ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Inferno1172/SpaceExplorers
cd bed-ca2-moiz
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Setup Database

- Create a MySQL database (default: `ca2`)
- Run the initialization scripts:

```bash
npm run init_tables
```

### 4️⃣ Configure Environment

Create a `.env` file in the root directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=ca2_db

JWT_SECRET=your_jwt_secret
RECAPTCHA_SECRET_KEY=your_recaptcha_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

PORT=3000
```

### 5️⃣ Run the Application

```bash
npm run dev
```

🚀 **App is live at:** `http://localhost:3000`

### NPM Scripts

- `npm run init_tables` — Creates the database schema and initial tables by running `src/configs/createSchema.js` followed by `src/configs/initTables.js`. Make sure your MySQL server is running and the database connection settings in `.env` are correct before running this.
- `npm run dev` — Start the development server with `nodemon` (auto-restarts on file changes). For a production start use `npm start` which runs `node index.js`.

---

## 🔐 Environment Variables

| Variable               | Description                             |
| :--------------------- | :-------------------------------------- |
| `DB_HOST`              | Database host (e.g., localhost)         |
| `DB_USER`              | Database username                       |
| `DB_PASSWORD`          | Database password                       |
| `DB_DATABASE`          | Name of the database                    |
| `JWT_SECRET`           | Secret key for signing tokens           |
| `RECAPTCHA_SECRET_KEY` | Google reCAPTCHA v2 Secret              |
| `EMAIL_USER`           | Email address for sending notifications |
| `EMAIL_PASSWORD`       | App password for the email account      |

---

## 🚀 API Endpoints

This application exposes a total of **22** API endpoints across the `users`, `challenges`, and `space` features (all mounted under the `/api` prefix).

### 👤 User Management

- `POST /api/users/register` — Register new user
- `POST /api/users/login` — Login and receive JWT
- `POST /api/users/forgot-password` — Request password reset
- `POST /api/users/reset-password` — Reset password with token
- `GET  /api/users/leaderboard` — View leaderboard
- `GET  /api/users` — Get all users (requires auth)
- `PUT  /api/users/:user_id` — Update user (self-only)
- `GET  /api/users/:user_id` — Get specific user (requires auth)

### 🧩 Challenges

- `POST   /api/challenges/` — Create a new challenge
- `GET    /api/challenges/` — List all challenges
- `PUT    /api/challenges/:challenge_id` — Update a challenge (owner only)
- `DELETE /api/challenges/:challenge_id` — Delete a challenge (owner only)
- `POST   /api/challenges/:challenge_id/completions` — Create a completion
- `GET    /api/challenges/:challenge_id/completions` — Get completions for a challenge
- `GET    /api/challenges/:challenge_id/my-completions` — Get your completions for a challenge

### 🌌 Space Systems

- `GET  /api/space/journey/:user_id` — Get a user's space journey
- `POST /api/space/discover` — Discover a new planet
- `GET  /api/space/shop` — Browse spacecraft shop
- `POST /api/space/shop/purchase` — Purchase an upgrade
- `GET  /api/space/spacecraft/:user_id` — Get user's spacecraft and upgrades
- `PUT  /api/space/spacecraft/toggle` — Toggle upgrade equipped status
- `GET  /api/space/achievements/:user_id` — Get user's achievements

---

## 📌 License

Licensed under the **ISC License**.

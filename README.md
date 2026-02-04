# 🚀 CA2 Wellness & Space Adventure Fullstack App

A **full-stack web application** that blends **wellness tracking** with an immersive **space exploration game**. Built with a **Node.js & Express backend** and a **responsive Vanilla JavaScript frontend**.

Users improve their real-world well-being by completing challenges, earning points, and using those points to progress in a virtual space journey—discovering planets, upgrading spacecraft, and unlocking achievements.

**Author:** Khambhati Moiz Huzefa

---

## 📖 Overview

This application demonstrates a complete full-stack architecture. It features a robust **RESTful API** handling secure authentication, game logic, and data persistence, paired with a **dynamic frontend** that provides an engaging user experience through interactive gamification elements.

---

## 📚 Table of Contents

* [Features](#-features)
* [Technologies Used](#-technologies-used)
* [Project Structure](#-project-structure)
* [Installation & Setup](#-installation--setup)
* [Environment Variables](#-environment-variables)
* [API Endpoints](#-api-endpoints)
* [License](#-license)

---

## ✨ Features

### 💻 Frontend Experience
* **Responsive Design** – Optimized for both desktop and mobile devices
* **Dynamic IO** – Real-time UI updates using Vanilla JavaScript & DOM manipulation
* **Interactive HUD** – Visual feedback for points, fuel, and game status
* **Space Theming** – Immersive visual design with shop and discovery interfaces

### 🔐 User & Security
* **Secure Auth** – JWT-based session management
* **Protection** – Google reCAPTCHA v2 & Bcrypt password hashing
* **Account Management** – Password reset via email & profile updates

### 🏆 Gamification
* **Leaderboard** – Global ranking system based on total points
* **Achievements** – Unlockable badges for milestones
* **Progression** – Earn points to purchase upgrades and explore further

### 🧠 Wellness Challenges
* **Challenge Board** – View and participate in daily wellness tasks
* **Tracking** – Record completions and view history
* **Community** – See what challenges others are attempting

### 🌌 Space Adventure
* **Planet Discovery** – Unlock new planets as you travel
* **Space Shop** – Purchase upgrades (Fuel Tanks, Thrusters, etc.)
* **Inventory Management** – Equip/Unequip spacecraft modifications

---

## 🛠 Technologies Used

### Frontend
* **HTML5** – Semantic structure
* **CSS3** – Custom responsive styling (Flexbox/Grid)
* **JavaScript (ES6+)** – DOM manipulation & async API logic
* **Fetch API** – Handling client-server communication

### Backend
* **Node.js** & **Express** – Server-side logic and API routing
* **MySQL** (via `mysql2`) – Relational database for persistent storage
* **JWT** – JSON Web Tokens for stateless authentication
* **Bcrypt** – Security hashing algorithm
* **Nodemailer** – Email service integration

### Dev Tools
* **Nodemon** – Development server monitoring
* **Git** – Version control

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
git clone https://github.com/ST0503-BED/bed-ca2-moiz.git
cd bed-ca2-moiz
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Setup Database

* Create a MySQL database (default: `ca2`)
* Run the initialization scripts:

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

---

## 🔐 Environment Variables

| Variable | Description |
| :--- | :--- |
| `DB_HOST` | Database host (e.g., localhost) |
| `DB_USER` | Database username |
| `DB_PASSWORD` | Database password |
| `DB_DATABASE` | Name of the database |
| `JWT_SECRET` | Secret key for signing tokens |
| `RECAPTCHA_SECRET_KEY` | Google reCAPTCHA v2 Secret |
| `EMAIL_USER` | Email address for sending notifications |
| `EMAIL_PASSWORD` | App password for the email account |

---

## 🚀 API Endpoints

### 👤 User Management
* `POST /api/users/register` – Create account
* `POST /api/users/login` – Authenticate & get token
* `GET /api/users/leaderboard` – View top players

### 🧩 Challenges
* `GET /api/challenges` – List all active challenges
* `POST /api/challenges/:id` – Complete a challenge
* `GET /api/challenges/:id` – View completion history

### 🌌 Space Systems
* `GET /api/space/journey/:id` – Get player journey data
* `POST /api/space/discover` – Trigger planet discovery
* `GET /api/space/shop` – Fetch available upgrades
* `POST /api/space/purchase` – Buy items using points

---

## 📌 License

Licensed under the **ISC License**.

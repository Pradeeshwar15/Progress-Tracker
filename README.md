# 🚀 My 90-Day Journey — Personal Progress Tracker (V2 Cloud & PWA)

A private, high-performance **90-Day Placement Preparation & Routine Consistency Tracker** unified with **Aptitude Mastery**, **LeetCode Grind**, and **DSA Blueprint Patterns**.

Evolved into a secure, multi-device, cloud-synced Progressive Web Application (PWA) powered by **Supabase Authentication**, **Supabase PostgreSQL**, **Row Level Security (RLS)**, and **Service Worker App Shell Caching**.

---

## 🌟 Key Features

- **🔐 Supabase Authentication**: Email/Password Sign Up, Login, Logout, and session persistence across devices.
- **⚡ Cloud PostgreSQL Database**: Schedules, daily checklist tasks, historical completion logs, and reflection notes synced in real-time.
- **🛡️ Row Level Security (RLS)**: Enforced at the database level (`auth.uid() = user_id`) guaranteeing data privacy and security.
- **📦 Automatic LocalStorage V1 Migration**: One-click import prompt on first login to transfer existing offline V1 schedules, tasks, and notes to your cloud account.
- **📱 Installable PWA**: Install on Android, iOS, Chrome, and Edge for a native standalone app experience.
- **📶 Offline Support & Network Indicator**: Service worker app shell caching with real-time `Cloud Synced` / `Offline Mode` status pill.
- **📚 Integrated Study Hub**: Aptitude topics, 52 FAANG LeetCode problem patterns, and 10 core DSA algorithmic blueprints.

---

## 🚀 Complete Step-by-Step Setup Guide

Follow these 4 simple steps to finish setting up your cloud database and run your application:

### Step 1: Create a Free Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and click **Start your project** (or log in).
2. Click **New Project** and select your organization.
3. Enter a **Name** (e.g. `90-day-placement-tracker`) and set a strong **Database Password**.
4. Choose your nearest **Region** and click **Create new project** (takes ~1 minute to provision).

---

### Step 2: Set Up the Database Tables & RLS Security

1. In your Supabase Dashboard left menu, click **SQL Editor** (`>_`).
2. Click **New Query**.
3. Open [`supabase_schema.sql`](./supabase_schema.sql) from this folder, copy all contents, paste into the SQL Editor, and click **Run**.
4. You will see `Success. No rows returned`. This creates:
   - `profiles`, `tasks`, `schedules`, `completions`, and `daily_notes` tables.
   - Row Level Security (RLS) policies for user data isolation.
   - Automatic profile creation trigger upon user signup.

---

### Step 3: Get Your API Credentials & Configure App

1. In your Supabase Dashboard left menu, click **Project Settings** (gear icon) $\rightarrow$ **API**.
2. Copy your **Project URL** (e.g., `https://xyzpdqcompany.supabase.co`).
3. Copy your **anon public** API key under `Project API keys`.
4. Update your local `.env` file (or input credentials directly into the App UI):
   ```env
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-public-key
   ```
5. Alternatively, open [`index.html`](./index.html) in your browser, click **Settings & Cloud** in the sidebar/header, paste your URL and Anon Key, and click **Save Settings**.

---

### Step 4: Run Locally & Test

1. Open [`index.html`](./index.html) in Chrome, Edge, or any modern web browser.
2. Click **Login / Sign Up** in the top header.
3. Select **Create Account**, enter your name, email, and password.
4. If you have previous V1 offline data, click **Import Data to Cloud** when prompted!
5. Add or check off schedule items and tasks. Notice the instant cloud sync!

---

## 📱 PWA Installation

- **Desktop (Chrome/Edge)**: Click the **Install Icon** in the browser address bar (or menu $\rightarrow$ *Install My 90-Day Journey*).
- **Android**: Tap the 3 dots menu $\rightarrow$ **Add to Home screen** / **Install app**.
- **iPhone / iOS**: Tap the **Share** button in Safari $\rightarrow$ **Add to Home Screen**.

---

## 🌐 Deploy to Vercel (Optional)

To access your tracker from anywhere via a custom URL (e.g., `my90dayjourney.vercel.app`):

1. Push this repository to **GitHub**.
2. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. In **Environment Variables**, add:
   - `SUPABASE_URL`: Your Supabase Project URL
   - `SUPABASE_ANON_KEY`: Your Supabase Anon Key
5. Click **Deploy**. Your V2 PWA is live on the web!

---

## 📄 File Structure Overview

```text
placement-tracker/
├── index.html            # Main V2 application UI & SPA view engine
├── supabase_schema.sql   # Complete PostgreSQL schema & RLS policies
├── manifest.json         # PWA Manifest configuration
├── service-worker.js     # Service Worker for offline app shell caching
├── js/
│   ├── supabase-config.js # Supabase client initialization
│   ├── auth.js            # Auth service (SignUp, Login, Logout, Session)
│   ├── db-service.js      # PostgreSQL CRUD operations
│   └── migration.js       # LocalStorage to Supabase import handler
├── .env.example          # Environment variable template
├── .env                  # Local environment file
└── README.md             # Setup guide documentation
```

---

## 💡 Support & Tips

- **Backup**: You can use the **Export** button in the sidebar anytime to download a offline JSON backup of your data.
- **Offline Usage**: The app shell opens even without internet access. When reconnected, data syncs automatically with Supabase.

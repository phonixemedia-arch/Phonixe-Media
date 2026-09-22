# Phonixe Media — MERN Stack Application & Admin CMS

A premium, modern, full-stack **MERN** web application and Content Management System built for **Phonixe Media**, a 360° social media growth agency specializing in coaches (Tarot, Numerology, Vastu, Spiritual, Relationship, and Life coaches).

---

## 🚀 Quick Start Guide

### 1. Run the Full Application (Single Command)
Ensure Node.js is installed, open your terminal in this directory, and run:

```bash
npm start
```

This boots the Express backend server on port `5000` which serves both the REST APIs and the React client.

- **🌐 Live Landing Page:** [http://localhost:5000](http://localhost:5000)
- **🛡️ Admin Login Portal:** [http://localhost:5000/#/admin/login](http://localhost:5000/#/admin/login)
- **📦 Health Check API:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Default Admin Credentials

- **Login ID / Username:** `admin`
- **Password:** `phonixe@2026`
*(Password can be changed anytime under the **Security** tab in the Admin Dashboard)*

---

## 🌟 Features & Architecture

### 1. Dynamic Agency Landing Page
- **Charcoal & Phoenix Gold Luxury Palette:** Layered obsidian charcoal (`#07080A`, `#0C0D11`) paired with gold metallic gradients (`#FFD700`, `#E5A93C`, `#FF5A1F`).
- **Smooth Scroll Animations:** `IntersectionObserver`-powered scroll reveals and smooth count-up number animations.
- **Niche-Specific Strategy Cards:** Tailored for Tarot Readers, Numerologists, Vastu Consultants, Akashic Record Readers, Spiritual Healers, and Relationship Mentors.
- **Interactive Booking Modal:** Captures lead information into the backend database CRM and generates a 1-click pre-filled WhatsApp link.
- **Floating WhatsApp Button & Sticky Mobile Bar:** Continuous conversion touchpoints across desktop and mobile.

### 2. Full Administrative Control Panel (`#/admin/dashboard`)
- **📊 Overview:** Live analytics, pending inquiries counter, and quick agency metrics.
- **📥 Inbound Leads CRM:** Complete table of strategy call requests (Prospect Name, WhatsApp, Instagram handle, Coaching Niche, Goal, Notes) with 1-click **"Chat on WhatsApp"** follow-up and status updates (`New`, `Contacted`, `Qualified`, `Closed`).
- **✍️ Content & Branding Editor:** Live editing of Hero title, subhead, trust points, WhatsApp number, email, and social media handles.
- **🛠️ Services Manager:** Add, edit, or remove services with custom badges and deliverable checklists.
- **📈 Case Studies CMS:** Full CRUD management of client case studies with before/after points, reach, and leads.
- **💬 Testimonials CMS:** Add, edit, and delete client reviews and 5-star ratings.
- **❓ FAQ Manager:** Customize questions and answers in the accordion.
- **🔢 Stats & Counters:** Update the 50+, 100K+, 500+, 360° counter statistics.
- **🔐 Security:** Update admin password.

---

## 🗄️ Database Flexibility (MongoDB + Zero-Config Fallback)

- **MongoDB Support:** Connects automatically to `process.env.MONGO_URI` or `mongodb://127.0.0.1:27017/phonixemedia`.
- **Automatic Embedded Fallback:** If MongoDB is not running locally, the server seamlessly initializes an embedded JSON database (`server/data/db.json`). This ensures the app boots up and performs all CRUD and authentication operations with **zero configuration required**.

---

## 🛠️ Development & Building

- **Run in Development Mode:**
  - Backend: `npm run dev:server` (runs on `http://localhost:5000`)
  - Frontend: `npm run dev:client` (runs Vite dev server on `http://localhost:3000` with API proxy)
- **Rebuild Frontend Bundle:**
  ```bash
  npm run build
  ```
  *(Compiles the React application directly into `server/public/` ready for production deployment)*

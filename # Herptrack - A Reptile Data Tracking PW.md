# Herptrack - A Reptile Data Tracking PWA - Project Requirements

## 📌 Purpose

Develop a **Progressive Web Application (PWA)** designed for reptile breeders and keepers to log and track detailed data about their reptiles. The app will provide features for managing:

- Morph Details  
- Biological Information  
- Breeding History  
- Lineage Tracking  
- Health Records  
- Growth Progress  

---

## 🧱 Tech Stack

### 🖥️ Frontend

- **Framework:** Next.js 15 (TypeScript)
- **Styling:** Tailwind CSS version 4
- **UI Components:** [shadcn/ui](https://ui.shadcn.com)
- **Charts & Data Visualization:** [Recharts](https://recharts.org/) (integrated with shadcn/ui)
- **State Management:** Zustand


### 🔧 Backend

- **Framework:** Next.js

### 🗄️ Database

- **Platform:** Supabase  
- **Engine:** PostgreSQL  

---

## ⚙️ Core Features

### 1. 🧬 Morph & Biological Data

- Reptile Name
- Species
- Morph
- Sex
- Hatch Date
- Acquisition Date
- Current Status (Active, Sold, Deceased)

### 2. ❤️ Health Tracking

- Vet Visits (Date, Notes, Medications)
- Illness and Treatment Logs
- Medication Schedule
- Shedding Records
- Feeding Refusals

### 3. 📈 Growth Tracking

- Weight and Length Entries (Date-based)
- Photo Uploads with Timestamps (optional)
- Visual Growth Charts using **Recharts + shadcn/ui**
- Target Growth Comparison

### 4. 👫 Breeding History

- Pairing Records (Reptile A × Reptile B)
- Mating Dates and Notes
- Clutch Info (Egg Count, Hatch Date, Success Rate)
- Incubation Details (Temperature, Humidity)

### 5. 🌳 Lineage Tracking

- Visual Lineage Tree
- Parent-Child Genetic Links
- Trait Inheritance Overview
- Lineage Browsing by Morph/Genetics

---

## 📲 PWA Requirements

- Offline-First Functionality
- Installable App (manifest + icon support)
- Data Sync on Reconnect
- Mobile-Optimized UI/UX

---

## ✅ MVP Checklist

- [/] User Authentication via Supabase (Email/OAuth)
- [/] Reptile Profile CRUD
- [/] Health Tracking Module
- [ ] Growth Tracker with Recharts Visualizations
- [ ] Breeding History & Lineage UI

---

## 🔐 Authentication & Access Control

- **Auth Provider:** Supabase Auth
- **User Roles:**
  - **Admin:** Full access to all reptiles and system controls
  - **User:** Access to personal reptile data only

---


# PROJECTPULSE
### *Agile Project & Team Collaboration Suite*

**ProjectPulse** is an enterprise-grade Agile project management, sprint execution, and team collaboration platform built on the **MERN** stack (MongoDB, Express.js, React.js, Node.js). 

Designed from the ground up with a human-crafted editorial visual identity (Deep Forest Green, Warm Terracotta, Muted Gold, and Warm Alabaster), ProjectPulse avoids generic SaaS clones in favor of ergonomic typography, responsive layouts, and robust role-based workflows.

---

## 🌟 Key Features

- **🔐 Robust JWT Authentication & Role Guards**:
  - 5 distinct user roles: *Organization Admin*, *Project Manager*, *Team Lead*, *Developer / Member*, *Stakeholder*.
  - BCrypt password hashing, session expiration handling, and protected routes.
- **🏢 Multi-Organization & Member Invitation Engine**:
  - Organization settings, workspace branding, and member role governance.
  - Invitation tokens with real-time status tracking (*Pending*, *Accepted*, *Expired*).
- **📋 Dynamic Kanban Board with Optimistic Updates**:
  - 5 Agile columns: `BACKLOG`, `TO DO`, `IN PROGRESS`, `REVIEW`, `DONE`.
  - Drag-and-drop task movements with immediate visual responsiveness and MongoDB persistence.
  - Story points, priority tags, due dates, blockers, and assignee avatars.
- **⚡ Sprint Management & Iteration Cadence**:
  - Plan sprints, set commitment goals, activate sprints, and complete iterations with automatic backlog rollover.
  - Sprint burndown metrics and velocity calculation.
- **🚩 Milestone & Roadmap Tracking**:
  - Strategic product delivery gates, progress tracking, and deadline countdowns.
  - Gantt-style visual timeline of sprints and milestones.
- **🐞 Defect & Issue Tracker**:
  - Severity classification (*Minor*, *Major*, *Critical*, *Blocker*).
  - Triage workflows, resolution notes, and regression audit trails.
- **💬 Polymorphic Commenting & 📎 File Attachments**:
  - Comment on Tasks, Issues, and Projects with author avatars and real-time updates.
  - Upload file attachments up to 15MB via Multer with safe MIME-type validation.
- **👥 Team Capacity & Workload Analytics**:
  - Cross-functional squad rosters (Product Engineering, Design & UX, QA & Reliability).
  - Workload balance charts comparing completed vs pending deliverables per engineer.
- **📊 Interactive Recharts Analytics & Reports**:
  - Task status distribution, issue severity donut charts, and sprint burndown graphs.
- **🔔 Notification Center & Activity Audit Feed**:
  - Live in-app notifications with unread badge counters.
  - Chronological audit trail of all project modifications.

---

## 🏗️ Architecture & Technology Stack

```
ProjectPulse/
│
├── frontend/                     # React 18 + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/           # Recharts workload & burndown charts
│   │   │   ├── common/           # Button, Input, Modal, Badge, Avatar, etc.
│   │   │   ├── kanban/           # KanbanBoard, KanbanColumn, TaskCard, TaskDetailModal
│   │   │   └── timeline/         # Gantt roadmap schedule
│   │   ├── context/              # AuthContext, ToastContext, NotificationContext
│   │   ├── layouts/              # MainLayout, Sidebar, Navbar, AuthLayout
│   │   ├── pages/                # Dashboard, Projects, Tasks, Teams, Issues, Reports, Settings
│   │   ├── routes/               # AppRoutes & ProtectedRoute guards
│   │   ├── services/             # Axios API service clients
│   │   ├── index.css             # Tailwind design tokens & custom theme
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Node.js + Express MVC REST API
│   ├── src/
│   │   ├── config/               # MongoDB Mongoose & JWT setup
│   │   ├── controllers/          # Business logic handlers for all entities
│   │   ├── middleware/           # JWT auth, role authorization, Multer upload, error handler
│   │   ├── models/               # Mongoose schemas with compound indexes
│   │   ├── routes/               # Express API endpoints
│   │   ├── services/             # Activity logger & notification dispatcher
│   │   ├── utils/                # Database seed script
│   │   ├── validators/           # Express-validator input schemas
│   │   ├── app.js
│   │   └── server.js
│   ├── uploads/                  # Multer stored attachments
│   ├── req.http                  # VS Code REST Client test suite
│   ├── package.json
│   └── .env.example
│
├── README.md
└── .gitignore
```

---

## 🔑 Demo Accounts for All 5 Roles

The database seed script generates realistic enterprise workspace data with demo credentials:

| Role | Name | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **👑 Organization Admin** | Elena Rostova | `admin@projectpulse.com` | `Admin@123` | Full workspace governance, user creation, role assignment, project deletion |
| **📋 Project Manager** | Marcus Vance | `pm@projectpulse.com` | `Pm@123` | Create projects, milestones, sprints, assign deliverables, manage risks |
| **⚡ Team Lead** | Aria Thorne | `lead@projectpulse.com` | `Lead@123` | Review code deliverables, start/complete sprints, monitor team capacity |
| **💻 Developer** | Devon Reed | `dev@projectpulse.com` | `Dev@123` | Move Kanban cards, update status, add comments, upload attachments |
| **📊 Stakeholder** | Sophia Chen | `stakeholder@projectpulse.com` | `Stakeholder@123` | Read-only executive access to milestones, reports, and delivery timeline |

*Note: The login page includes a **One-Click Demo Credentials** bar for instant testing of any role!*

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0+ (Tested on v24.x)
- **MongoDB**: Local instance running at `mongodb://localhost:27017` or MongoDB Atlas URI

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Setup environment configuration
cp .env.example .env

# Populate database with realistic seed data
npm run seed

# Start backend REST API server (Port 5000)
npm run dev
```

The backend server will connect to MongoDB and start on `http://localhost:5000`.
Health endpoint: `http://localhost:5000/api/health`.

### 2. Frontend Setup

```bash
# In a separate terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite development server (Port 5173)
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🧪 REST Client Testing (`backend/req.http`)

The `backend/req.http` file contains a complete suite of requests ready to execute with the **VS Code REST Client** extension:

1. Open `backend/req.http` in VS Code.
2. Click **"Send Request"** on the `# @name loginAdmin` request to capture the JWT token variable `{{token}}`.
3. Execute any test request across Authentication, Projects, Milestones, Sprints, Kanban Tasks, Issues, Comments, Notifications, and Reports.

---

## 🎨 Design System & Color Palette

- **Primary Brand (Forest Green)**: `#2F6B5F` — *Used for primary CTAs, active indicators, and high priority tags.*
- **Secondary Brand (Warm Terracotta)**: `#C86B4A` — *Used for sprint actions, defect alerts, and secondary buttons.*
- **Accent Brand (Muted Gold)**: `#C7A35A` — *Used for team badges and milestones.*
- **Background (Warm Alabaster)**: `#F7F5F0` — *Soft, eye-friendly editorial background for long working sessions.*
- **Surface Cards**: `#FFFFFF` / `#FFFDF9` with subtle `#E8E3D8` borders and soft drop shadows.

---

## 📄 License
MIT License © 2026 ProjectPulse. Built for modern agile engineering organizations.

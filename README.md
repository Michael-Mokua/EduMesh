# EduMesh

An offline-first education platform built for environments with unreliable connectivity — students, teachers, and administrators can keep working locally and everything syncs automatically once a connection is available.

## The problem it addresses

Most edtech platforms assume constant internet access. EduMesh is built around the opposite assumption: connectivity is intermittent, so the app has to work fully offline and reconcile state later without losing data or creating conflicts.

## Architecture

**Frontend** — React 18 + TypeScript + Vite, styled with Tailwind CSS v4, animated with Framer Motion.

**Local-first data layer** — All app data (subjects, lessons, quiz submissions, attendance, messages, skill progress, XP/badges) is mirrored into an IndexedDB store via Dexie, so every dashboard reads and writes locally first, instantly, with no network round-trip required.

**Sync engine** — A custom queue-based sync system (`syncEngine.ts`) tracks pending actions in an IndexedDB `sync_queue`, listens for `online`/`offline` browser events, and flushes the queue with exponential backoff (2s → 5s → 15s → 30s → 60s) and a retry cap, so actions taken offline reliably reach the server once connectivity returns without duplicate submissions.

**On-device AI personalization** — `aiPersonalization.ts` runs a small TensorFlow.js neural network entirely in the browser (no server round-trip) that takes a student's XP, level, streak, and quiz history as input and outputs a recommended difficulty multiplier and an at-risk probability score, so the app can adapt to each learner without needing connectivity or a backend inference service. The model persists locally via `localstorage://` and is created fresh per-device if none exists yet.

**PWA / offline delivery** — Configured with `vite-plugin-pwa` and Workbox background sync, so the app installs like a native app and continues functioning with cached content when offline.

**Backend** — Node.js/Express API (`EduMesh Enterprise`, v2.0.0) backed by SQLite, with:
- JWT authentication (bcrypt-hashed passwords, 30-day tokens, role-based access: student/teacher/admin)
- Content management (subjects, lessons, quizzes) with versioning
- Teacher analytics endpoint (student counts, submission counts, average scores)
- Basic in-memory rate limiting (200 req/min per IP)
- Health check endpoint

## Role-based dashboards

The frontend ships distinct views for each stakeholder in a school system:
- **Student** — Dashboard, Quiz, Skill Tree (gamified mastery tracking), Content Library, Marketplace
- **Teacher** — Teacher Dashboard with class analytics
- **Admin** — Admin Panel (user/role management)
- **County / National** — County Dashboard and National Dashboard, for aggregated oversight above the individual school level
- **Parent** — Parent Portal

## Gamification

XP and leveling (every 500 XP = one level), streak tracking, a skill-tree mastery system per subject, and a badge system (bronze/silver/gold/platinum) to drive engagement.

## Tech stack

React 18 · TypeScript · Vite · Tailwind CSS v4 · Dexie (IndexedDB) · TensorFlow.js · Workbox · Framer Motion · Node.js · Express · SQLite · JWT · bcrypt

## Status

Actively developed prototype. Core auth, content delivery, quiz system, offline sync, and the on-device personalization model are functional; attendance and messaging tables exist in the schema with API routes stubbed in for expansion.

## Getting started

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

**Backend**
```bash
cd server
npm install
cp .env.example .env   # fill in your own JWT_SECRET
npm run dev
```

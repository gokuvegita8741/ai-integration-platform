AI Integration Platform

A full-stack monorepo that runs a Next.js frontend and a Python (FastAPI) backend together, designed for AI integrations, with clean dependency isolation and one command to run the entire system.

🧠 What is this project?

This project is a platform, not a single app.

It combines:

Frontend (UI)  → Next.js (React, Node.js)
Backend (API) → FastAPI (Python)
AI Layer      → Python AI libraries (OpenAI, etc.)


All of these are managed inside one repository using modern tooling.

🏗️ Project Structure (visual overview)
ai-integration-platform/
│
├── apps/
│   ├── web/              → Next.js frontend
│   │   ├── node_modules/ → Frontend dependencies (auto-generated)
│   │   └── package.json
│   │
│   └── api/              → FastAPI backend (Python / AI)
│       ├── .venv/        → Python virtual environment (auto-generated)
│       └── pyproject.toml
│
├── node_modules/         → Root Node dependencies (auto-generated)
│
├── package.json          → Root command center
├── turbo.json            → Task orchestration rules
├── pnpm-workspace.yaml   → Workspace scope definition
├── pnpm-lock.yaml        → Locked Node dependency graph
│
├── .turbo/               → Turbo cache & daemon (auto-generated)
└── README.md

📦 What is node_modules (important and commonly misunderstood)
What it is

node_modules is a generated folder where Node.js dependencies are installed.

It contains:

Next.js

React

ESLint

Tailwind

All transitive JS dependencies

There can be multiple node_modules folders:

One at the root (shared tooling like Turbo)

One inside apps/web (frontend dependencies)

Why node_modules exists

Because JavaScript does not bundle dependencies by default.

When you run:

pnpm install


pnpm:

reads package.json

reads pnpm-lock.yaml

installs exact versions

creates node_modules

Why node_modules is NOT committed

Extremely large

OS-specific

Reproducible from lockfile

Changes constantly

Instead, this project commits:

package.json

pnpm-lock.yaml

This guarantees everyone gets the same dependencies, without committing them.

Mental rule

node_modules is output, not source code

🔧 Why this setup exists (the WHY)

This architecture avoids common real-world problems:

Problem	Solution
Frontend & backend run separately	Turbo
Node & Python conflicts	pnpm + Poetry
Version mismatch across machines	Lockfiles
Hard onboarding	Single command (pnpm dev)
AI dependency instability	Poetry isolation
🧩 Core tools and their responsibilities
pnpm (Node.js)

Installs Node dependencies

Manages node_modules

Handles monorepo workspaces

Poetry (Python)

Manages Python dependencies

Creates Python virtual environments

Prevents AI / Python version conflicts

Poetry does NOT install Python itself
Python must exist on the system.

Turbo (Turborepo)

Runs frontend and backend together

Orchestrates tasks in parallel

Handles caching and CI optimization

Turbo does not build apps — it coordinates them.

⚙️ How the system runs (visual execution flow)

When you run:

pnpm dev


This is what happens:

pnpm dev
 └─ turbo run dev --parallel
     ├─ apps/web
     │   └─ next dev
     │       └─ uses apps/web/node_modules
     │       └─ http://localhost:3000
     │
     └─ apps/api
         └─ poetry run uvicorn
             └─ uses apps/api/.venv
             └─ http://localhost:8000


Both services:

start together

reload on changes

run independently but in sync

📄 Root configuration files (what each one does)
package.json (root)

The command center of the platform.

Defines:

how to start everything

how to start frontend only

how to start backend only

how CI runs builds and linting

turbo.json

Defines how tasks behave:

dev → long-running servers

build → ordered & cached

lint → fast & cacheable

pnpm-workspace.yaml

Defines which folders are part of the monorepo:

packages:
  - apps/*
  - packages/*

pnpm-lock.yaml

The exact dependency contract.

Ensures:

same versions

same behavior

same results on every machine

.turbo/

Local Turbo cache:

speeds up commands

safe to delete

never committed

🚀 How to run the project (correct order)
✅ Prerequisites (must already exist)
Tool	Required
Node.js	Yes
pnpm	Yes
Python ≥ 3.11	Yes
Poetry	Yes
1️⃣ Install Node dependencies (root)
pnpm install


Creates:

root node_modules

workspace links

frontend dependencies

2️⃣ Install Python dependencies (API)
cd apps/api
poetry install


Creates:

.venv/

installs FastAPI, AI libs, uvicorn

3️⃣ Run everything together (root)
cd ../../
pnpm dev

🌐 Access the running services
Service	URL
Frontend	http://localhost:3000

Backend API	http://localhost:8000

API Docs	http://localhost:8000/docs
🧪 Run individual parts (optional)

Frontend only:

pnpm dev:web


Backend only:

pnpm dev:api

🔐 Version safety (why this is reliable)

Node deps → pnpm-lock.yaml

Python deps → poetry.lock

Python version → enforced by Poetry

Runtime → isolated environments

This prevents:

“It works on my machine” problems

🧠 Final mental model (read once)
Source code → apps/*
Dependencies → node_modules / .venv
Lockfiles → guarantee consistency
Turbo → runs everything together

✅ One-line summary

This repository is a monorepo that cleanly runs a Next.js frontend and a FastAPI AI backend together, using pnpm for Node dependencies, Poetry for Python dependencies, Turbo for orchestration, and node_modules as generated runtime output.


//How to Run Frontend and Backend Seperately 

1️⃣ Frontend: apps/web (Next.js / Node)
What the frontend is

The frontend is a pure Node.js application built with Next.js (React).

Its responsibilities:

UI

Pages & layouts

Calling backend APIs

Rendering data

It does not care about Python, Poetry, or AI logic.

Frontend folder structure (important files only)
apps/web/
├── app/                    → Next.js App Router (pages, layouts)
├── public/                 → Static assets (images, icons)
├── node_modules/           → Frontend JS dependencies (generated)
├── .next/                  → Next.js build/dev cache (generated)
│
├── package.json             → Frontend commands & dependencies
├── pnpm-lock.yaml           → Frontend dependency lock (local)
├── next.config.ts           → Next.js configuration
├── tsconfig.json            → TypeScript config
├── postcss.config.mjs       → CSS processing
├── eslint.config.mjs        → Lint rules
└── .gitignore

1️⃣ Frontend: apps/web (Next.js / Node)
What the frontend is

The frontend is a pure Node.js application built with Next.js (React).

Its responsibilities:

UI

Pages & layouts

Calling backend APIs

Rendering data

It does not care about Python, Poetry, or AI logic.

Frontend folder structure (important files only)
apps/web/
├── app/                    → Next.js App Router (pages, layouts)
├── public/                 → Static assets (images, icons)
├── node_modules/           → Frontend JS dependencies (generated)
├── .next/                  → Next.js build/dev cache (generated)
│
├── package.json             → Frontend commands & dependencies
├── pnpm-lock.yaml           → Frontend dependency lock (local)
├── next.config.ts           → Next.js configuration
├── tsconfig.json            → TypeScript config
├── postcss.config.mjs       → CSS processing
├── eslint.config.mjs        → Lint rules
└── .gitignore

Frontend package.json — what it controls

This file controls only the frontend.

Typical responsibilities:

next dev → start UI server

React, Next, Tailwind dependencies

TypeScript, ESLint tooling

When you run:

pnpm dev:web


What actually happens:

pnpm --filter web dev
 → apps/web/package.json
 → "dev": "next dev"


That’s it.
No backend. No Python.

2️⃣ Backend: apps/api (FastAPI / Python)
What the backend is

The backend is a pure Python service built with FastAPI.

Its responsibilities:

API endpoints

AI/OpenAI calls

Validation & business logic

Returning JSON to frontend

It does not care about React, Next.js, or Node runtime.

Backend folder structure (important files)
apps/api/
├── app/
│   ├── main.py              → FastAPI app entry point
│   ├── routes/              → API routes
│   ├── services/            → AI / business logic
│   └── models/              → Pydantic models
│
├── .venv/                   → Python virtual environment (generated)
│
├── pyproject.toml           → Python dependencies & rules (Poetry)
├── poetry.lock              → Locked Python dependency graph
├── package.json             → Bridge file for Turbo/pnpm
└── .gitignore

3️⃣ Why backend has BOTH package.json and pyproject.toml

This is very important and often misunderstood.

pyproject.toml (REAL backend config)

This is the true backend configuration.

It defines:

Python version:

requires-python = ">=3.11,<3.13"


Backend dependencies:

fastapi
uvicorn
openai
pydantic


Packaging behavior:

package-mode = false


This file is used by Poetry only.

poetry.lock

This is the exact Python dependency snapshot.

Guarantees:

same AI library versions

same FastAPI behavior

same runtime everywhere

Backend package.json (NOT a real backend config)

This file exists only to integrate with pnpm + Turbo.

It does NOT manage Python dependencies.

Its only purpose:

"scripts": {
  "dev": "poetry run uvicorn app.main:app --reload --port 8000"
}


Think of it as:

a remote control button that pnpm can press

Turbo needs package.json to know:

“this workspace has a dev command”

“run this when pnpm dev is called”

4️⃣ Running frontend ONLY (independent)

From repo root:

pnpm dev:web


Or from frontend folder:

cd apps/web
pnpm dev


What runs:

Next.js dev server

Port: http://localhost:3000

What does NOT run:

FastAPI

Python

AI code

5️⃣ Running backend ONLY (independent)

From repo root:

pnpm dev:api


Or from backend folder:

cd apps/api
poetry run uvicorn app.main:app --reload --port 8000


What runs:

FastAPI server

Port: http://localhost:8000

API docs: http://localhost:8000/docs

What does NOT run:

Next.js

React

Frontend UI

6️⃣ How frontend & backend connect (conceptually)

When both are running:

Browser
  ↓
Next.js (frontend)
  ↓ fetch("/api/...")
FastAPI (backend)
  ↓
OpenAI / AI logic


Frontend never talks to Python directly.
It only talks via HTTP APIs.

7️⃣ Final mental separation (THIS IS THE KEY)

Lock this model in your head:

Frontend (apps/web)
- Node.js
- React / Next.js
- node_modules
- package.json (real)

Backend (apps/api)
- Python
- FastAPI
- .venv
- pyproject.toml (real)

Bridge
- backend/package.json exists ONLY for Turbo

One-line summary

The frontend (apps/web) is a pure Node/Next.js app with its own node_modules, the backend (apps/api) is a pure Python/FastAPI app managed by Poetry, and the backend package.json exists only to let pnpm and Turbo run Python commands—not to manage backend dependencies.


<!--------------------------   Anyone Rnning this project ----------------->



//Install Node.js, pnpm, Python ≥ 3.11, and Poetry on your system.

From the repo root, run pnpm install to install Node (frontend + tooling) dependencies.

Go to the backend folder: cd apps/api.

Run poetry install to create the Python virtual environment and install backend dependencies.

Return to the repo root: cd ../../.

Run pnpm dev to start frontend and backend together.

Frontend starts at http://localhost:3000.

Backend API starts at http://localhost:8000.

API documentation is available at http://localhost:8000/docs.

To run separately, use pnpm dev:web (frontend only) or pnpm dev:api (backend only).
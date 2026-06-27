# Essence — Project Management

> Calm, focused project management for modern teams.

![Essence — Kanban board screenshot placeholder](https://placehold.co/1200x630/f3f4f6/6b7280?text=Essence+Screenshot)

---

## Features

- **Kanban Board** — Drag-and-drop tasks across To Do, In Progress, Review, and Done columns
- **Rich Text Docs** — Full wiki with Tiptap editor, headings, task lists, links, and auto-save
- **Real-time Updates** — Live task changes via Supabase Realtime subscriptions
- **Filtering** — Filter tasks by tag, priority, assignee, or free-text search
- **Multiple Projects** — Each project has its own board, docs, and member list
- **Auth** — Email/password sign up and sign in with Supabase Auth
- **Row Level Security** — Users can only access projects they are members of
- **Responsive** — Works on mobile (sidebar collapses, board scrolls horizontally)

---

## Tech Stack

| Layer       | Choice                        |
|-------------|-------------------------------|
| Framework   | Next.js 16 (App Router)       |
| Language    | TypeScript (strict)           |
| Styling     | Tailwind CSS                  |
| Database    | Supabase (PostgreSQL)         |
| Auth        | Supabase Auth                 |
| Realtime    | Supabase Realtime             |
| Drag & Drop | @hello-pangea/dnd             |
| Rich Text   | Tiptap                        |
| Icons       | Lucide React                  |
| Deployment  | Vercel                        |

---

## Quick Start

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd essence
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase (see next section)

### 4. Add environment variables

```bash
cp .env.local.example .env.local
# Edit .env.local with your real Supabase values
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL Editor, run the schema:
   ```
   Copy the contents of supabase/schema.sql and execute it
   ```
3. (Optional) Load sample data:
   ```
   Edit supabase/seed.sql — replace YOUR_USER_ID with your actual user UUID
   Then execute it in the SQL Editor
   ```
4. Copy your project credentials:
   - Go to **Settings → API**
   - Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
5. Paste them into `.env.local`

---

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push this repo to GitHub
2. Import the repo in Vercel
3. Add the three environment variables in **Project Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy — Vercel will build and serve automatically

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login and register pages (no layout)
│   ├── (app)/               # Authenticated shell (sidebar + main)
│   │   ├── layout.tsx       # App shell with sidebar
│   │   ├── projects/        # Projects list + new project form
│   │   └── projects/[id]/   # Per-project: tasks, docs, settings
│   └── api/                 # REST API routes
│       ├── projects/        # CRUD + members
│       ├── tasks/           # CRUD + move (drag-drop position)
│       └── docs/            # CRUD
├── components/
│   ├── ui/                  # Reusable primitives (Button, Modal, etc.)
│   ├── layout/              # Sidebar, Topbar, ProjectNav
│   ├── projects/            # ProjectCard, ProjectForm
│   ├── tasks/               # KanbanBoard, TaskCard, TaskModal, FilterBar
│   └── docs/                # DocEditor (Tiptap), DocList, DocCard
├── hooks/                   # useAuth, useProjects, useTasks, useMembers, useDocs
└── lib/
    ├── supabase/            # Browser + server Supabase clients
    ├── types.ts             # All TypeScript interfaces
    ├── constants.ts         # Column/tag/priority/color config
    └── utils.ts             # cn(), formatDate(), positionBetween()

supabase/
├── schema.sql               # Full DB schema with RLS policies
└── seed.sql                 # Sample projects, tasks, docs
```

---

## Environment Variables

| Variable                       | Description                  |
|-------------------------------|------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`    | Your Supabase project URL    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key             |
| `SUPABASE_SERVICE_ROLE_KEY`   | Service role key (server-only) |

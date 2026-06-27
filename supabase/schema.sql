create extension if not exists "uuid-ossp";

-- ─── PROFILES ───────────────────────────────────────────────
create table profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  full_name     text not null,
  email         text not null,
  avatar_color  text not null default 'indigo',
  created_at    timestamptz default now()
);

-- ─── PROJECTS ───────────────────────────────────────────────
create table projects (
  id          uuid default uuid_generate_v4() primary key,
  name        text not null,
  description text,
  color       text not null default 'indigo',
  created_by  uuid references profiles(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── PROJECT MEMBERS ────────────────────────────────────────
create table project_members (
  id          uuid default uuid_generate_v4() primary key,
  project_id  uuid references projects(id) on delete cascade,
  user_id     uuid references profiles(id) on delete cascade,
  role        text check (role in ('owner','admin','member')) default 'member',
  joined_at   timestamptz default now(),
  unique(project_id, user_id)
);

-- ─── TASKS ──────────────────────────────────────────────────
create table tasks (
  id          uuid default uuid_generate_v4() primary key,
  project_id  uuid references projects(id) on delete cascade,
  title       text not null,
  description text,
  column      text check (column in ('todo','progress','review','done')) default 'todo',
  tag         text check (tag in ('feature','bug','design','research','devops','other')) default 'feature',
  priority    text check (priority in ('urgent','high','medium','low')) default 'medium',
  position    float not null default 0,
  assignee_id uuid references profiles(id),
  created_by  uuid references profiles(id),
  due_date    date,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── DOCUMENTS ──────────────────────────────────────────────
create table docs (
  id          uuid default uuid_generate_v4() primary key,
  project_id  uuid references projects(id) on delete cascade,
  title       text not null default 'Untitled',
  content     jsonb,
  created_by  uuid references profiles(id),
  updated_by  uuid references profiles(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── TRIGGERS ───────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger projects_updated_at before update on projects
  for each row execute procedure set_updated_at();
create trigger tasks_updated_at before update on tasks
  for each row execute procedure set_updated_at();
create trigger docs_updated_at before update on docs
  for each row execute procedure set_updated_at();

-- ─── AUTO-CREATE PROFILE ON SIGNUP ──────────────────────────
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────
alter table profiles enable row level security;
alter table projects enable row level security;
alter table project_members enable row level security;
alter table tasks enable row level security;
alter table docs enable row level security;

-- Profiles: readable by all authenticated
create policy "profiles_select" on profiles for select using (auth.role() = 'authenticated');
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);

-- Projects: visible to members only
create policy "projects_select" on projects for select using (
  exists (select 1 from project_members where project_id = projects.id and user_id = auth.uid())
);
create policy "projects_insert" on projects for insert with check (auth.role() = 'authenticated');
create policy "projects_update" on projects for update using (
  exists (select 1 from project_members where project_id = projects.id and user_id = auth.uid() and role in ('owner','admin'))
);
create policy "projects_delete" on projects for delete using (
  exists (select 1 from project_members where project_id = projects.id and user_id = auth.uid() and role = 'owner')
);

-- Project members
create policy "members_select" on project_members for select using (
  exists (select 1 from project_members pm2 where pm2.project_id = project_members.project_id and pm2.user_id = auth.uid())
);
create policy "members_insert" on project_members for insert with check (auth.role() = 'authenticated');
create policy "members_delete" on project_members for delete using (
  exists (select 1 from project_members pm2 where pm2.project_id = project_members.project_id and pm2.user_id = auth.uid() and pm2.role in ('owner','admin'))
);

-- Tasks: project members only
create policy "tasks_select" on tasks for select using (
  exists (select 1 from project_members where project_id = tasks.project_id and user_id = auth.uid())
);
create policy "tasks_insert" on tasks for insert with check (
  exists (select 1 from project_members where project_id = tasks.project_id and user_id = auth.uid())
);
create policy "tasks_update" on tasks for update using (
  exists (select 1 from project_members where project_id = tasks.project_id and user_id = auth.uid())
);
create policy "tasks_delete" on tasks for delete using (
  exists (select 1 from project_members where project_id = tasks.project_id and user_id = auth.uid())
);

-- Docs: project members only
create policy "docs_select" on docs for select using (
  exists (select 1 from project_members where project_id = docs.project_id and user_id = auth.uid())
);
create policy "docs_insert" on docs for insert with check (
  exists (select 1 from project_members where project_id = docs.project_id and user_id = auth.uid())
);
create policy "docs_update" on docs for update using (
  exists (select 1 from project_members where project_id = docs.project_id and user_id = auth.uid())
);
create policy "docs_delete" on docs for delete using (
  exists (select 1 from project_members where project_id = docs.project_id and user_id = auth.uid())
);

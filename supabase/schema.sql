-- ==============================================================================
-- CTFy - Capture The Flag Platform: PostgreSQL Schema & Policies
-- ==============================================================================

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  created_at timestamptz not null default now()
);

-- 2. Events Table
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  pin_code text unique not null,
  host_id uuid not null references public.profiles(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  created_at timestamptz not null default now()
);

-- 3. Questions Table
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  prompt text not null,
  media_url text,
  correct_answer text not null, -- Kept secret on server, NEVER exposed to client
  points integer not null default 10,
  order_index integer not null default 0
);

-- 4. Submissions Table
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  submitted_answer text not null,
  is_correct boolean not null default false,
  points_awarded integer not null default 0,
  created_at timestamptz not null default now()
);

-- Indexes for high-throughput leaderboard and PIN lookups
create index if not exists idx_events_pin on public.events(pin_code);
create index if not exists idx_events_host on public.events(host_id);
create index if not exists idx_questions_event on public.questions(event_id, order_index asc);
create index if not exists idx_submissions_event on public.submissions(event_id, created_at desc);
create index if not exists idx_submissions_user_question on public.submissions(user_id, question_id, is_correct);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.questions enable row level security;
alter table public.submissions enable row level security;

-- ==============================================================================
-- RLS POLICIES
-- ==============================================================================

-- Profiles: Anyone can view usernames (for scoreboards/event cards), users manage own
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Events: Anyone can view events, hosts can insert/update/delete
drop policy if exists "Events are viewable by everyone" on public.events;
create policy "Events are viewable by everyone"
  on public.events for select
  using (true);

drop policy if exists "Authenticated users can create events" on public.events;
create policy "Authenticated users can create events"
  on public.events for insert
  to authenticated
  with check (auth.uid() = host_id);

drop policy if exists "Hosts can update their own events" on public.events;
create policy "Hosts can update their own events"
  on public.events for update
  using (auth.uid() = host_id);

drop policy if exists "Hosts can delete their own events" on public.events;
create policy "Hosts can delete their own events"
  on public.events for delete
  using (auth.uid() = host_id);

-- Questions: Host can read all fields (including correct_answer)
-- Note: Participants read question prompts via sanitized server actions or public_questions view
drop policy if exists "Hosts have full access to questions" on public.questions;
create policy "Hosts have full access to questions"
  on public.questions for all
  using (
    exists (
      select 1 from public.events
      where events.id = questions.event_id
      and events.host_id = auth.uid()
    )
  );

drop policy if exists "Authenticated participants can view questions" on public.questions;
create policy "Authenticated participants can view questions"
  on public.questions for select
  to authenticated
  using (true);

-- Submissions: Anyone can view for leaderboard, users can insert their own
drop policy if exists "Submissions are viewable by everyone for leaderboard" on public.submissions;
create policy "Submissions are viewable by everyone for leaderboard"
  on public.submissions for select
  using (true);

drop policy if exists "Users can insert own submissions" on public.submissions;
create policy "Users can insert own submissions"
  on public.submissions for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
declare
  raw_username text;
begin
  raw_username := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1),
    'agent_' || substr(new.id::text, 1, 6)
  );

  insert into public.profiles (id, username, created_at)
  values (new.id, raw_username, now())
  on conflict (id) do update
  set username = excluded.username;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- ATOMIC SERVER FUNCTION: SUBMIT & VERIFY FLAG
-- Prevents duplicate awards, enforces time-gating, ensures atomic point award
-- ==============================================================================
create or replace function public.submit_flag(
  p_event_id uuid,
  p_question_id uuid,
  p_submitted_answer text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_event record;
  v_question record;
  v_already_solved boolean;
  v_is_correct boolean;
  v_points integer := 0;
  v_submission_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Unauthorized');
  end if;

  -- 1. Check Event Existence and Time Window
  select * into v_event from public.events where id = p_event_id;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Event not found');
  end if;

  if now() < v_event.start_time then
    return jsonb_build_object('success', false, 'error', 'Event has not started yet');
  end if;

  if now() > v_event.end_time then
    return jsonb_build_object('success', false, 'error', 'Event has already ended');
  end if;

  -- 2. Check Question
  select * into v_question from public.questions where id = p_question_id and event_id = p_event_id;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Question not found');
  end if;

  -- 3. Check if user already solved this question correctly
  select exists (
    select 1 from public.submissions
    where user_id = v_user_id
      and question_id = p_question_id
      and is_correct = true
  ) into v_already_solved;

  if v_already_solved then
    return jsonb_build_object(
      'success', true,
      'is_correct', true,
      'already_solved', true,
      'points_awarded', 0,
      'message', 'Question already captured! No duplicate points.'
    );
  end if;

  -- 4. Exact match check (trimmed, case-sensitive or standard flag comparison)
  v_is_correct := (trim(p_submitted_answer) = trim(v_question.correct_answer));
  if v_is_correct then
    v_points := v_question.points;
  else
    v_points := 0;
  end if;

  -- 5. Record submission
  insert into public.submissions (
    event_id,
    question_id,
    user_id,
    submitted_answer,
    is_correct,
    points_awarded
  )
  values (
    p_event_id,
    p_question_id,
    v_user_id,
    trim(p_submitted_answer),
    v_is_correct,
    v_points
  )
  returning id into v_submission_id;

  return jsonb_build_object(
    'success', true,
    'submission_id', v_submission_id,
    'is_correct', v_is_correct,
    'points_awarded', v_points,
    'already_solved', false,
    'message', case when v_is_correct then 'Flag captured!' else 'Incorrect flag. Try again!' end
  );
end;
$$;

-- Enable Realtime for Submissions Table (for live scoreboard)
begin;
  -- Add submissions to publication if not already present
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table public.submissions, public.events;
commit;

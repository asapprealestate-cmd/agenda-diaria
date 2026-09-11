-- Esquema aplicado en el proyecto Supabase "agenda-diaria" (hbyiudfncymityzoatcy).
-- Se deja acá como referencia/versión controlada; los cambios reales se aplican
-- vía el MCP de Supabase o el dashboard.

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  time time without time zone null,           -- null = tarea sin horario ("para hoy, cuando pueda")
  date date not null,                          -- día en el que vive actualmente la tarea
  original_date date not null,                 -- día para el que se creó originalmente
  done boolean not null default false,
  done_at timestamptz null,
  carried_over boolean not null default false, -- true si vino arrastrada de un día anterior y sigue sin hacer
  priority smallint null check (priority in (1,2,3)), -- 1 alta, 2 media, 3 baja
  category text null,                          -- etiqueta libre
  sort_order integer not null default 0,
  auto_rollover boolean not null default true, -- "¿se pasa sola a mañana?"
  subtasks jsonb not null default '[]'::jsonb, -- [{id, title, done}]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_user_date_idx on public.tasks (user_id, date);
create index tasks_user_done_date_idx on public.tasks (user_id, done, date);

create table public.daily_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  content text not null default '',
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

create trigger daily_notes_set_updated_at
  before update on public.daily_notes
  for each row execute function public.set_updated_at();

alter table public.tasks enable row level security;
alter table public.daily_notes enable row level security;

create policy "tasks_select_own" on public.tasks for select using (auth.uid() = user_id);
create policy "tasks_insert_own" on public.tasks for insert with check (auth.uid() = user_id);
create policy "tasks_update_own" on public.tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks_delete_own" on public.tasks for delete using (auth.uid() = user_id);

create policy "notes_select_own" on public.daily_notes for select using (auth.uid() = user_id);
create policy "notes_insert_own" on public.daily_notes for insert with check (auth.uid() = user_id);
create policy "notes_update_own" on public.daily_notes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notes_delete_own" on public.daily_notes for delete using (auth.uid() = user_id);

-- Rollover: mueve a "hoy" (p_today, fecha local del cliente) toda tarea sin hacer
-- que haya quedado en un día anterior, marcándola como arrastrada.
create or replace function public.rollover_tasks(p_today date)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.tasks
  set date = p_today,
      carried_over = true
  where user_id = auth.uid()
    and done = false
    and auto_rollover = true
    and date < p_today;
end;
$$;

revoke execute on function public.rollover_tasks(date) from public;
revoke execute on function public.rollover_tasks(date) from anon;
grant execute on function public.rollover_tasks(date) to authenticated;

-- Resumen de estadísticas ("Cómo vas") para la pantalla de racha
create or replace function public.stats_summary(p_today date)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_streak int := 0;
  v_check date := p_today;
  v_has_activity boolean;
  v_same_day_pct numeric;
  v_stuck_count int;
  v_categories jsonb;
  v_day_stats jsonb;
  v_bars jsonb;
begin
  loop
    select exists(
      select 1 from public.tasks
      where user_id = auth.uid() and done_at::date = v_check
    ) into v_has_activity;
    exit when not v_has_activity;
    v_streak := v_streak + 1;
    v_check := v_check - 1;
  end loop;

  select coalesce(round(100.0 * count(*) filter (where done and done_at::date = original_date) / nullif(count(*) filter (where done), 0)), 0)
  into v_same_day_pct
  from public.tasks
  where user_id = auth.uid() and original_date >= p_today - 30;

  select count(*) into v_stuck_count
  from public.tasks
  where user_id = auth.uid() and not done and (p_today - original_date) > 3;

  select coalesce(jsonb_agg(jsonb_build_object('category', category, 'pct', pct) order by pct desc), '[]'::jsonb)
  into v_categories
  from (
    select category, round(100.0 * count(*) filter (where done) / count(*)) as pct
    from public.tasks
    where user_id = auth.uid() and category is not null and original_date >= p_today - 30
    group by category
  ) c;

  select coalesce(jsonb_agg(jsonb_build_object('dow', dow, 'pct', pct)), '[]'::jsonb)
  into v_day_stats
  from (
    select extract(dow from original_date)::int as dow, round(100.0 * count(*) filter (where done) / count(*)) as pct
    from public.tasks
    where user_id = auth.uid() and original_date >= p_today - 60
    group by extract(dow from original_date)
    having count(*) >= 2
  ) d;

  select coalesce(jsonb_agg(cnt order by d), '[]'::jsonb) into v_bars
  from (
    select gs::date as d, (
      select count(*) from public.tasks where user_id = auth.uid() and done_at::date = gs::date
    ) as cnt
    from generate_series(p_today - 9, p_today, interval '1 day') gs
  ) t;

  return jsonb_build_object(
    'streak', v_streak,
    'same_day_pct', coalesce(v_same_day_pct, 0),
    'stuck_count', coalesce(v_stuck_count, 0),
    'categories', v_categories,
    'day_stats', coalesce(v_day_stats, '[]'::jsonb),
    'bars', v_bars
  );
end;
$$;

revoke execute on function public.stats_summary(date) from public;
revoke execute on function public.stats_summary(date) from anon;
grant execute on function public.stats_summary(date) to authenticated;

-- Categorías del usuario (editables: se pueden agregar y borrar, incluidas las de ejemplo)
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table public.categories enable row level security;

create policy "categories_select_own" on public.categories for select using (auth.uid() = user_id);
create policy "categories_insert_own" on public.categories for insert with check (auth.uid() = user_id);
create policy "categories_update_own" on public.categories for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "categories_delete_own" on public.categories for delete using (auth.uid() = user_id);

-- Categorías de ejemplo para cuentas nuevas (el usuario puede borrarlas después)
create or replace function public.seed_default_categories()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (user_id, name, sort_order) values
    (new.id, 'CASA', 1),
    (new.id, 'TRABAJO', 2),
    (new.id, 'PERSONAL', 3)
  on conflict do nothing;
  return new;
end;
$$;

revoke execute on function public.seed_default_categories() from public;
revoke execute on function public.seed_default_categories() from anon;
revoke execute on function public.seed_default_categories() from authenticated;

create trigger on_auth_user_created_categories
  after insert on auth.users
  for each row execute function public.seed_default_categories();

-- ===== Alarmas y notificaciones por tarea =====

alter table public.tasks
  add column if not exists alarm_enabled boolean not null default false,
  add column if not exists alarm_offset_minutes integer not null default 0, -- 0 = a la hora exacta; N = N minutos antes
  add column if not exists notified_at timestamptz null; -- cuándo se mandó el aviso (evita duplicados)

create table public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  timezone text not null default 'UTC',
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;
create policy "user_settings_select_own" on public.user_settings for select using (auth.uid() = user_id);
create policy "user_settings_upsert_own" on public.user_settings for insert with check (auth.uid() = user_id);
create policy "user_settings_update_own" on public.user_settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger user_settings_set_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;
create policy "push_subs_select_own" on public.push_subscriptions for select using (auth.uid() = user_id);
create policy "push_subs_insert_own" on public.push_subscriptions for insert with check (auth.uid() = user_id);
create policy "push_subs_delete_own" on public.push_subscriptions for delete using (auth.uid() = user_id);

-- Secretos de servidor (claves VAPID). RLS habilitado sin policies = solo
-- accesible con la service role (la usa la Edge Function), nunca desde el cliente.
create table public.app_secrets (
  key text primary key,
  value text not null
);
alter table public.app_secrets enable row level security;

-- El rollover también reinicia el aviso, para que vuelva a sonar en el día nuevo
create or replace function public.rollover_tasks(p_today date)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.tasks
  set date = p_today,
      carried_over = true,
      notified_at = null
  where user_id = auth.uid()
    and done = false
    and auto_rollover = true
    and date < p_today;
end;
$$;

-- Tareas cuyo aviso está por vencer (llamada por el cron cada 1 minuto).
-- Ventana: entre 10 minutos de atraso (por si el cron se demoró) y "ahora".
create or replace function public.due_task_reminders()
returns table (
  task_id uuid,
  user_id uuid,
  title text,
  time_label text,
  alarm_enabled boolean
)
language sql
security definer
set search_path = public
as $$
  select
    t.id,
    t.user_id,
    t.title,
    to_char(t.time, 'HH24:MI'),
    t.alarm_enabled
  from public.tasks t
  join public.user_settings us on us.user_id = t.user_id
  where t.time is not null
    and t.done = false
    and t.notified_at is null
    and (
      (t.date::timestamp + t.time::interval)
      - make_interval(mins => case when t.alarm_enabled then t.alarm_offset_minutes else 0 end)
    ) at time zone us.timezone
      between now() - interval '10 minutes' and now();
$$;

revoke execute on function public.due_task_reminders() from public;
revoke execute on function public.due_task_reminders() from anon;
revoke execute on function public.due_task_reminders() from authenticated;
-- la ejecuta la Edge Function con la service role (bypassea RLS igual, pero dejamos explícito el intent)

-- Extensiones para el cron que dispara la Edge Function cada 1 minuto
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- El cron (ver también supabase/functions/send-task-reminders/index.ts):
-- select cron.schedule(
--   'send-task-reminders-every-minute',
--   '* * * * *',
--   $$ select net.http_post(
--        url := '<PROJECT_URL>/functions/v1/send-task-reminders',
--        headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer <ANON_KEY>'),
--        body := '{}'::jsonb
--      ); $$
-- );

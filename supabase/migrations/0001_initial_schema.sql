-- =============================================================================
-- Траектория — F0.2 Начальная схема БД (DDL, без RLS).
-- RLS-политики добавляются отдельной миграцией (следующий подшаг F0.2).
-- Маппинг: snake_case в БД ↔ camelCase в TS (слой доступа F0.5).
-- Источник типов: types/task.ts, types/application.ts, types/user.ts, lib/constants.ts
-- =============================================================================

-- ---------------------------------------------------------------------------
-- profiles — базовый профиль, 1:1 с auth.users (User в types/user.ts)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  name        text not null,
  role        text not null check (role in ('teen', 'employer')),
  avatar_url  text,
  city        text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- teen_profiles — расширение профиля подростка (TeenProfile)
-- ---------------------------------------------------------------------------
create table public.teen_profiles (
  id                    uuid primary key references public.profiles (id) on delete cascade,
  age                   int,
  xp                    int  not null default 0,
  level                 int  not null default 1,
  interests             text[],
  preferred_task_format text check (preferred_task_format in ('online', 'offline', 'any')),
  completed_tasks_count int  default 0,
  -- F0.6: флаг прохождения онбординга при первом входе
  onboarded             boolean not null default false,

  -- Задел под E9 (онбординг: цель/мотивация/выходные/локация). Nullable, пишутся позже.
  earning_goal_title    text,
  earning_goal_amount   int,
  motivation            text[],
  weekend_availability  boolean,
  home_address          text,
  home_lat              double precision,
  home_lng              double precision,
  search_radius_km      int
);

-- ---------------------------------------------------------------------------
-- employer_profiles — расширение профиля работодателя (EmployerProfile)
-- ---------------------------------------------------------------------------
create table public.employer_profiles (
  id                  uuid primary key references public.profiles (id) on delete cascade,
  company_name        text not null,
  inn                 text,
  inn_ip              text,
  ogrn                text,
  ogrnip              text,
  verified            boolean default false,
  customer_type       text check (customer_type in ('legal_entity', 'sole_proprietor')),
  task_categories     text[],
  cabinet_description text,
  cabinet_tags        text[],

  -- Задел под E5 (рейтинг/отзывы). Таблица reviews[] — в E5.
  rating              numeric(2, 1),
  reviews_count       int default 0
);

-- ---------------------------------------------------------------------------
-- tasks — задачи работодателя (Task)
-- category — text без CHECK: список категорий расширяется в E10.
-- employer_name денормализован (как в типе Task) — слой доступа держит в синхроне.
-- ---------------------------------------------------------------------------
create table public.tasks (
  id                            uuid primary key default gen_random_uuid(),
  title                         text not null,
  description                   text not null,
  what_to_do                    text not null default '',
  completion_criteria           text not null default '',
  contact_person                text not null default '',
  employer_id                   uuid not null references public.profiles (id) on delete cascade,
  employer_name                 text not null,
  category                      text not null,
  status                        text not null default 'draft'
                                  check (status in ('draft', 'open', 'in_progress', 'completed')),
  reward_xp                     int  not null default 0,
  payment_type                  text not null check (payment_type in ('fixed', 'hourly')),
  payment_amount                int  not null,
  estimated_hours               numeric,
  pay_rub                       int  not null,
  work_format                   text not null check (work_format in ('online', 'offline')),
  duration_bucket               text not null check (duration_bucket in ('short', 'long')),
  duration_label                text not null,
  location                      text,
  min_age                       int,
  max_age                       int,
  engagement_type               text not null check (engagement_type in ('employment', 'self_employed')),
  has_fixed_schedule            boolean not null default true,
  start_date_time               timestamptz,
  duration_hours                numeric not null default 0,
  weekly_hours_expected         numeric not null default 0,
  during_school_period_allowed  boolean not null default true,
  during_vacation_allowed       boolean not null default true,
  requires_medical_exam         boolean not null default false,
  physical_load_level           text not null check (physical_load_level in ('none', 'light')),
  is_outdoor                    boolean not null default false,
  minor_compliance_status       text not null
                                  check (minor_compliance_status in ('passed', 'warning', 'blocked')),
  minor_compliance_reasons      text[] not null default '{}',
  deadline                      timestamptz,

  -- Задел под E2.7 (фильтр «рядом», haversine). Nullable до онбординга/координат задач.
  lat                           double precision,
  lng                           double precision,

  created_at                    timestamptz not null default now()
);

create index tasks_employer_id_idx on public.tasks (employer_id);
create index tasks_status_idx      on public.tasks (status);

-- ---------------------------------------------------------------------------
-- applications — отклики подростка (Application). + paidAt (решение Волны 2).
-- Один отклик подростка на задачу.
-- ---------------------------------------------------------------------------
create table public.applications (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid not null references public.tasks (id) on delete cascade,
  teen_id     uuid not null references public.profiles (id) on delete cascade,
  status      text not null default 'applied'
                check (status in ('applied', 'rejected', 'accepted', 'submitted', 'paid')),
  message     text,
  created_at  timestamptz not null default now(),
  paid_at     timestamptz,
  unique (task_id, teen_id)
);

create index applications_task_id_idx on public.applications (task_id);
create index applications_teen_id_idx on public.applications (teen_id);

-- ---------------------------------------------------------------------------
-- favorites — избранные задачи подростка (E8 → Supabase).
-- ---------------------------------------------------------------------------
create table public.favorites (
  teen_id     uuid not null references public.profiles (id) on delete cascade,
  task_id     uuid not null references public.tasks (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (teen_id, task_id)
);

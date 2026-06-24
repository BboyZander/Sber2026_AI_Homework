-- =============================================================================
-- Траектория — E17. ИИ-ассистент подростка (deep agent на OpenAI).
--   app_settings — глобальные рантайм-флаги (вкл/выкл агента без редеплоя).
--   agent_usage  — дневной лимит сообщений на подростка (защита личного ключа).
-- service_role обходит RLS (флаг флипается через dashboard / service-клиент).
-- =============================================================================

create table public.app_settings (
  key         text primary key,
  bool_value  boolean not null default false,
  updated_at  timestamptz not null default now()
);

create table public.agent_usage (
  teen_id  uuid not null references public.profiles (id) on delete cascade,
  day      date not null default current_date,
  count    int  not null default 0,
  primary key (teen_id, day)
);

-- Агент выключен по умолчанию: включать вручную (Supabase dashboard → app_settings).
insert into public.app_settings (key, bool_value)
values ('ai_agent_enabled', false)
on conflict (key) do nothing;

alter table public.app_settings enable row level security;
alter table public.agent_usage  enable row level security;

-- ---------------------------------------------------------------------------
-- app_settings: чтение — любой аутентифицированный; запись — только service_role
-- (обходит RLS), поэтому write-политику не создаём.
-- ---------------------------------------------------------------------------
create policy app_settings_select_authenticated
  on public.app_settings for select to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- agent_usage: подросток видит и пишет только свои строки (teen_id = auth.uid()).
-- ---------------------------------------------------------------------------
create policy agent_usage_select_own
  on public.agent_usage for select to authenticated
  using (teen_id = auth.uid());

create policy agent_usage_insert_own
  on public.agent_usage for insert to authenticated
  with check (teen_id = auth.uid());

create policy agent_usage_update_own
  on public.agent_usage for update to authenticated
  using (teen_id = auth.uid())
  with check (teen_id = auth.uid());

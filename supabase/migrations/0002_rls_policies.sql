-- =============================================================================
-- Траектория — F0.2 RLS-политики.
-- Принцип: подросток видит/меняет своё; работодатель — свои задачи и отклики
-- к ним; публичная инфа работодателя видна всем; приватные данные подростка
-- доступны работодателю только при наличии отклика на его задачу.
-- service_role (сиды F0.3) обходит RLS полностью.
-- =============================================================================

alter table public.profiles          enable row level security;
alter table public.teen_profiles      enable row level security;
alter table public.employer_profiles  enable row level security;
alter table public.tasks              enable row level security;
alter table public.applications       enable row level security;
alter table public.favorites          enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- Чтение: любой аутентифицированный (нужно для публичных карточек teen/employer).
-- ⚠️ Сюда входит email. Если позже надо скрыть — вынести публичные поля во view.
-- Запись: только своя строка.
-- ---------------------------------------------------------------------------
create policy profiles_select_authenticated
  on public.profiles for select to authenticated
  using (true);

create policy profiles_insert_own
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

create policy profiles_update_own
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- teen_profiles
-- Чтение: владелец; либо работодатель, к задаче которого подросток откликнулся.
-- Запись: только владелец.
-- ---------------------------------------------------------------------------
create policy teen_profiles_select_own
  on public.teen_profiles for select to authenticated
  using (id = auth.uid());

create policy teen_profiles_select_related_employer
  on public.teen_profiles for select to authenticated
  using (
    exists (
      select 1
      from public.applications a
      join public.tasks t on t.id = a.task_id
      where a.teen_id = teen_profiles.id
        and t.employer_id = auth.uid()
    )
  );

create policy teen_profiles_insert_own
  on public.teen_profiles for insert to authenticated
  with check (id = auth.uid());

create policy teen_profiles_update_own
  on public.teen_profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- employer_profiles
-- Чтение: любой аутентифицированный (публичная карточка компании, рейтинг).
-- Запись: только владелец.
-- ---------------------------------------------------------------------------
create policy employer_profiles_select_authenticated
  on public.employer_profiles for select to authenticated
  using (true);

create policy employer_profiles_insert_own
  on public.employer_profiles for insert to authenticated
  with check (id = auth.uid());

create policy employer_profiles_update_own
  on public.employer_profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- tasks
-- Чтение: опубликованные (не draft) — всем; черновики — только владельцу.
-- Запись/удаление: только владелец-работодатель.
-- ---------------------------------------------------------------------------
create policy tasks_select_published
  on public.tasks for select to authenticated
  using (status <> 'draft');

create policy tasks_select_own
  on public.tasks for select to authenticated
  using (employer_id = auth.uid());

create policy tasks_insert_own
  on public.tasks for insert to authenticated
  with check (employer_id = auth.uid());

create policy tasks_update_own
  on public.tasks for update to authenticated
  using (employer_id = auth.uid())
  with check (employer_id = auth.uid());

create policy tasks_delete_own
  on public.tasks for delete to authenticated
  using (employer_id = auth.uid());

-- ---------------------------------------------------------------------------
-- applications
-- Чтение: подросток — свои; работодатель — отклики к своим задачам.
-- Создание/удаление: подросток — свои.
-- Обновление: подросток — свои (отозвать/отметить выполненным);
--             работодатель — отклики к своим задачам (принять/отклонить/оплата).
-- ---------------------------------------------------------------------------
create policy applications_select_own_teen
  on public.applications for select to authenticated
  using (teen_id = auth.uid());

create policy applications_select_task_employer
  on public.applications for select to authenticated
  using (
    exists (
      select 1 from public.tasks t
      where t.id = applications.task_id
        and t.employer_id = auth.uid()
    )
  );

create policy applications_insert_own_teen
  on public.applications for insert to authenticated
  with check (teen_id = auth.uid());

create policy applications_update_own_teen
  on public.applications for update to authenticated
  using (teen_id = auth.uid())
  with check (teen_id = auth.uid());

create policy applications_update_task_employer
  on public.applications for update to authenticated
  using (
    exists (
      select 1 from public.tasks t
      where t.id = applications.task_id
        and t.employer_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.tasks t
      where t.id = applications.task_id
        and t.employer_id = auth.uid()
    )
  );

create policy applications_delete_own_teen
  on public.applications for delete to authenticated
  using (teen_id = auth.uid());

-- ---------------------------------------------------------------------------
-- favorites — полностью приватны владельцу-подростку.
-- ---------------------------------------------------------------------------
create policy favorites_select_own
  on public.favorites for select to authenticated
  using (teen_id = auth.uid());

create policy favorites_insert_own
  on public.favorites for insert to authenticated
  with check (teen_id = auth.uid());

create policy favorites_delete_own
  on public.favorites for delete to authenticated
  using (teen_id = auth.uid());

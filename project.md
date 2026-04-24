# Track_Sber2026 — краткое описание проекта

Демо-веб‑приложение «Траектория» на **Next.js (App Router)** + **React** + **TypeScript**.
Сценарии: подросток (поиск подработки, отклики, профиль/прогресс) и работодатель (публикация задач, работа с откликами, управление статусами).
Хранение — **в браузере (localStorage)** с «зашитыми» демо-данными для быстрого старта.

## Основная логика продукта (коротко)

- **Подросток**
  - Каталог задач `/teen/tasks`: по умолчанию показывает **все открытые** задачи
  - Фильтр **«Подходит мне»** сужает список под возраст и правила для несовершеннолетних
  - Деталка задачи `/teen/tasks/[id]`: отклик возможен только если подходит по возрасту и по правилам (compliance)
  - Отклики `/teen/applications`: статусы откликов и следующий шаг
  - Профиль `/teen/profile`: XP и «кошелёк» считаются по факту оплаченных откликов в этом браузере

- **Работодатель**
  - Список задач `/employer/tasks`, деталка `/employer/tasks/[id]`
  - Создание `/employer/tasks/new` и редактирование `/employer/tasks/[id]/edit` — **одна и та же форма** с предзаполнением
  - Редактирование заблокировано для задач в статусах `in_progress` и `completed` — и в UI (кнопка скрыта), и на уровне формы (`canEditTask`)
  - Управление жизненным циклом: черновик → открыта → в работе → завершена; управление откликами (взять в работу/отклонить/оплата)
  - **Тип оформления**: в форме отображается только «Самозанятость»; «Трудовой договор» скрыт (логика не реализована)

## Структура проекта

### `app/` — страницы (Next.js App Router)

- **`app/page.tsx`**: лендинг
- **`app/login/page.tsx`**: вход/выбор роли (демо-логика)

- **Сценарий подростка**
  - `app/teen/dashboard/page.tsx`: главная (статистика + быстрые действия)
  - `app/teen/tasks/page.tsx`: каталог
  - `app/teen/tasks/[id]/page.tsx`: страница задачи
  - `app/teen/applications/page.tsx`: список откликов
  - `app/teen/profile/page.tsx`: профиль/прогресс
  - `app/teen/employer/[id]/page.tsx`: публичная карточка работодателя для подростка

- **Сценарий работодателя**
  - `app/employer/dashboard/page.tsx`: главная работодателя
  - `app/employer/tasks/page.tsx`: список задач
  - `app/employer/tasks/new/page.tsx`: создание задачи (форма)
  - `app/employer/tasks/[id]/page.tsx`: деталка задачи (просмотр + управление откликами/статусами)
  - `app/employer/tasks/[id]/edit/page.tsx`: редактирование задачи (та же форма)
  - `app/employer/profile/page.tsx`: профиль/кабинет работодателя
  - `app/employer/teen/[id]/page.tsx`: карточка подростка для работодателя

### `components/` — UI-компоненты

- **`components/landing/*`**: секции лендинга (хедер, hero, how-it-works, benefits и т.д.)
- **`components/shared/*`**: общие компоненты (оболочка страниц `AppShell`, кнопки, пустые состояния, бейджи статусов, скелетоны)
- **`components/teen/*`**: экраны и виджеты подростка (каталог, карточки задач, деталка, отклики, профиль, дашборд)
- **`components/employer/*`**: экраны и виджеты работодателя (дашборд, список/деталка задач, карточки откликов, форма задачи)

Ключевые компоненты:
- **`components/employer/TaskForm.tsx`**: единая форма создания/редактирования задачи, валидация, расчёт payload, пересчёт compliance, сохранение (publish/edit)
- **`components/teen/TeenTaskDetailView.tsx`**: деталка задачи для подростка + правила доступности отклика
- **`components/teen/TeenTasksCatalog.tsx`**: каталог + фильтры (в т.ч. «Подходит мне»)
- **`components/employer/EmployerTaskDetailView.tsx`**: детальная карточка задачи у работодателя + управление откликами/статусами

### `lib/` — бизнес-логика и client-side “flow”

Ключевые модули:
- **`lib/employer-flow.ts`**: сценарий работодателя (публикация/редактирование/удаление задач, смена статусов, события). Две функции доступа: `canMutateTask` — проверка ownership (показывает блок «Действия» целиком, включая «Повторить» и «Удалить»); `canEditTask` — ownership + статус (блокирует редактирование для `in_progress` и `completed`)
- **`lib/employer-tasks-storage.ts`**: хранилище задач (demo + localStorage), мердж, оверрайды, события
- **`lib/teen-flow.ts`**: сценарий подростка (отклик/отзыв, события, тосты, доступ к хранилищу)
- **`lib/teen-applications-storage.ts`**: хранилище откликов (demo + localStorage), withdraw/overrides, события

Правила и вычисления:
- **`lib/minor-compliance.ts`**: проверка ограничений 14–17 (night/weekend/лимиты часов/периоды учёбы и т.п.)
- **`lib/task-age.ts`**: возрастной диапазон задачи + проверка «можно ли откликнуться по возрасту»
- **`lib/task-payment.ts`**: нормализация оплаты, расчёт `payRub` и строк для UI
- **`lib/teen-task-catalog-filter.ts`**: фильтрация каталога подростка (включая «Подходит мне»)
- **`lib/teen-activity-stats.ts`**: статистика активности подростка по откликам (earnedRub/earnedXp/завершено)

Сервисные модули:
- `lib/profile-store.ts`, `lib/teen-profile.ts`, `lib/employer-profile.ts`: профили (demo + localStorage), валидация и синхронизация
- `lib/demo-state.ts`: сброс демо-данных из localStorage
- `lib/ui-copy.ts`: единые тексты (тосты/подтверждения/повторяющиеся фразы)
- `lib/helpers.ts`: форматирование (даты, ₽, XP) и утилиты

### `data/` — демо-данные

- **`data/demo-users.ts`**: две демо‑учётки (teen/employer)
- **`data/demo-tasks.ts`**: демо‑задачи (используются как базовый слой данных)
- **`data/demo-applications.ts`**: демо‑отклики подростка (согласованы со статусами задач)
- `data/employer-snippets.ts`, `data/demo-achievements.ts`, `data/teen-dashboard.ts` и др.: тексты/подсказки/статистика для UI

### `types/` — типы домена

- **`types/task.ts`**: `Task` (полная сущность задачи)
- **`types/application.ts`**: `Application` (отклик)
- **`types/user.ts`**: `TeenProfile` / `EmployerProfile` и связанные типы

### `docs/` — документация

- заметки по демо-потоку и внутренним решениям (не часть runtime)

## Стек и дизайн-система

- **Next.js 15** App Router, **React 19**, **TypeScript**
- **Tailwind CSS v4** (`@import “tailwindcss”`, кастомные токены через `@theme inline`)
- **Framer Motion v12** — анимации внутри авторизованных страниц (дашборд, профиль); лендинг — без JS-анимаций (server components)
- **Шрифт**: Manrope (Google Fonts, latin + cyrillic)
- **Иконки**: инлайн SVG, без сторонних библиотек

### Темизация

Две темы: светлая (дефолт) и тёмная — переключаются атрибутом `data-theme` на `<html>`.

- CSS-переменные в `styles/globals.css`: базовый `html {}` — светлая тема; `html[data-theme=”dark”]` — тёмная
- Inline-скрипт в `app/layout.tsx` (strategy `beforeInteractive`) восстанавливает выбор пользователя из localStorage до первой отрисовки — без вспышки
- Компонент переключения: `components/shared/ThemeSwitcher.tsx`
- Утилиты темы: `lib/theme.ts`

### Дизайн-токены (Tailwind-классы → CSS-переменные)

| Класс | Переменная | Назначение |
|---|---|---|
| `bg-canvas` | `--page-bg` | Фон страницы |
| `bg-panel` | `--surface` | Фон карточек |
| `bg-panel-muted` | `--surface-muted` | Приглушённый фон |
| `text-ink` | `--text-primary` | Основной текст |
| `text-sub` | `--text-secondary` | Второстепенный текст |
| `text-accent-bright` | `--accent-bright` | Акцентный цвет (Сбер-зелень) |
| `border-edge` | `--border-subtle` | Обводка элементов |

### UI-компоненты (глобальные классы)

- `.ui-card` — стандартная карточка
- `.ui-card-interactive` — карточка с hover/active-эффектами
- `.ui-btn-primary` / `.ui-btn-ghost` — кнопки
- `.ui-stack` — вертикальный стек с `--stack-gap`
- `.page-shell` — обёртка контента с учётом сайдбара и нижней навигации

## Как данные “живут” в демо

- Базовые данные лежат в `data/*`
- Изменения пользователя пишутся в localStorage (задачи/отклики/профили)
- UI подписан на события (`EMPLOYER_TASKS_EVENT`, `TEEN_APPLICATIONS_EVENT`, `PROFILE_UPDATED_EVENT`) и обновляется без сервера

## Полезные точки входа (если нужно быстро понять код)

- **Лендинг**: `app/page.tsx` + `components/landing/*`
- **Создание/редактирование задачи**: `components/employer/TaskForm.tsx`
- **Каталог и фильтры**: `components/teen/TeenTasksCatalog.tsx` + `lib/teen-task-catalog-filter.ts`
- **Отклик и доступность**: `components/teen/TeenTaskDetailView.tsx` + `lib/minor-compliance.ts` + `lib/task-age.ts`
- **Данные и мердж**: `lib/*-storage.ts` + `data/demo-*.ts`


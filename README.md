# dance-hall-booking

**MVP PWA “Dance Studio Booking”**, з фокусом на **швидку розробку через Cursor AI**, **деплой на Vercel з GitHub (free tier)**, **Apple-style UI**, і **архітектуру, яку легко масштабувати**.

---

## 1) MVP-цілі та межі (щоб швидко запуститись)

### 1.1 Ролі та ключові сценарії

**Адмін**

* Створює/редагує **зали** (Hall).
* Створює **тренерів** (Trainer) та їх доступи.
* **Блокує слоти часу** в залах (наприклад, “групові заняття”, “оренда”, “ремонт”).
* Бачить облік занять тренерів: хто провів, скільки записів, відвідування (MVP можна без фактичного “чекина”).
* Контролює **оплати** (MVP: ручне підтвердження / статус платежу).

**Тренер**

* Створює **заняття** у вибраних залах.
* Вказує **максимальну кількість дітей** на заняття.
* Переглядає список записаних дітей, керує статусом (MVP: “записаний/скасований”).

**Дитина/Батьки (Клієнт)**

* Дивиться розклад тренерів/залів.
* Записується на заняття, якщо є вільні місця.
* Скасовує запис (за правилами).

### 1.2 MVP що не робимо одразу

* Складні абонементи/пакети/заморозки.
* Онлайн-оплата (можна додати потім Stripe/LiqPay).
* Складні ролі “менеджер”, “старший тренер”, тощо.
* Нотифікації (push/email/sms) — можна як наступний етап.

---

## 2) Техстек під Cursor + Vercel (free) і масштабування

### 2.1 Frontend (PWA)

* **Next.js (App Router) + TypeScript**
* **TailwindCSS** (швидко робити “Apple-подібний” мінімалізм)
* **next-pwa** або нативний service worker (на старті — next-pwa)
* UI-компоненти: легкі власні компоненти або shadcn/ui (можна стилізувати “Apple-like”)

### 2.2 Backend

Варіант для Vercel:

* **Next.js API Routes / Server Actions** як BFF (backend-for-frontend)
* **MongoDB Atlas** (free tier) + **Prisma** (MongoDB provider) або Mongoose

  * Для “best practices” і контролю схем — зручно Prisma.
* Auth: **NextAuth.js (Auth.js)** з ролями.

### 2.3 Чому так

* Один репозиторій → Cursor легко генерує модулі.
* Vercel безболісно деплоїть і фронт, і API.
* MongoDB Atlas free → MVP без витрат.
* Архітектура готова до виділення в окремі сервіси пізніше.

---

## 3) Архітектура: модулі, шари, патерни

### 3.1 Вертикальні модулі (feature-based)

Рекомендується структура:

* `features/auth`
* `features/halls`
* `features/blocks` (блокування часу)
* `features/classes` (заняття)
* `features/bookings` (записи)
* `features/payments` (MVP: статуси/рахунок)
* `features/admin-dashboard`

### 3.2 Шари (Clean-ish, але без фанатизму для MVP)

* **UI layer**: компоненти, сторінки, форми.
* **Application layer**: use-cases (сервіси типу `CreateClass`, `BookSpot`, `BlockHallTime`).
* **Domain layer**: типи, правила (валідація, бізнес-інваріанти).
* **Infrastructure layer**: репозиторії, Prisma/Mongo, зовнішні інтеграції.

### 3.3 Патерни

* Repository pattern (Mongo сховано за інтерфейсами)
* DTO + validation (Zod)
* RBAC (role-based access control)
* Optimistic concurrency / atomic operations для записів (щоб не було “перезапису місць”)

---

## 4) Дані та моделі (MongoDB)

### 4.1 Основні колекції

* **User**: `id, role (ADMIN|TRAINER|PARENT), name, phone, email`
* **Child**: `id, parentId, name, birthDate, notes`
* **Hall**: `id, name, capacity?, location?, isActive`
* **TrainerProfile**: `id, userId, bio, specialties`
* **ClassSession** (заняття):
  `id, trainerId, hallId, startAt, endAt, capacity, status (SCHEDULED|CANCELED), price?`
* **Booking** (запис):
  `id, classSessionId, childId, parentId, status (BOOKED|CANCELED), createdAt`
* **HallBlock** (блок часу залу):
  `id, hallId, startAt, endAt, reason, createdByAdminId`
* **PaymentRecord** (MVP простий облік):
  `id, parentId, month, amount, status (PENDING|PAID|OVERDUE), notes`

### 4.2 Критичні інваріанти

* Заняття **не можна створити**, якщо:

  * у залі є **HallBlock** на цей час
  * у залі вже є інше **ClassSession** (перетин)
* Запис **не можна зробити**, якщо:

  * заняття скасоване/в минулому
  * вже немає місць (`bookingsCount < capacity`)
  * дитина вже записана на цей слот

### 4.3 Як гарантувати “не більше N записів” (важливо)

Для MVP на Mongo є 2 надійні підходи:

1. **Транзакція** (MongoDB replica set у Atlas є)

   * перевірити кількість активних бронювань → вставити booking → підтвердити
2. **Атомарний ліміт через поле `takenSeats`**

   * оновлення `ClassSession` типу: `takenSeats += 1` тільки якщо `takenSeats < capacity`
   * якщо апдейт не пройшов — місць нема.
     Це краще для масштабування і простіше для Cursor-генерації.

---

## 5) API / Use-cases (мінімальний контракт)

### 5.1 Адмін

* `POST /api/halls` створити зал
* `POST /api/halls/{id}/blocks` заблокувати час
* `POST /api/trainers` створити тренера
* `GET /api/admin/classes` список занять + фільтри
* `GET /api/admin/payments` платежі
* `PATCH /api/admin/payments/{id}` статус платежу

### 5.2 Тренер

* `POST /api/classes` створити заняття
* `PATCH /api/classes/{id}` редагування/скасування
* `GET /api/classes/mine` мої заняття
* `GET /api/classes/{id}/bookings` список записів

### 5.3 Клієнт

* `GET /api/schedule` розклад (фільтри: дата, тренер, зал)
* `POST /api/bookings` запис на заняття
* `DELETE /api/bookings/{id}` скасувати

---

## 6) Авторизація та безпека

* NextAuth/Auth.js: email+password (credentials) або magic-link (простішe для батьків).
* RBAC middleware:

  * ADMIN: все
  * TRAINER: тільки свої заняття + читання своїх записів
  * PARENT: тільки свої діти/свої записи
* Валідація Zod на вході кожного endpoint/use-case.
* Логи (мінімум): request id + action + user id.

---

## 7) Apple-style UI (best practices)

### 7.1 Принципи

* Мінімалізм, “air”, чітка ієрархія.
* Великі заголовки, акуратні картки, м’які тіні, округлення.
* Максимум 1 primary action на екран.
* Продумані стани: loading/empty/error.

### 7.2 Екрани MVP

**Клієнт**

* Home / Schedule: календар + список занять (cards)
* Class details: тренер, зал, місця, кнопка “Записатись”
* My bookings: список майбутніх записів

**Тренер**

* My schedule: тиждень/день, кнопка “+ Заняття”
* Create class form: зал, дата/час, capacity
* Class attendees: список дітей

**Адмін**

* Halls: список + “Створити зал”
* Hall blocks: календар залу + “Заблокувати”
* Payments: таблиця статусів + фільтр

---

## 8) PWA-функціонал (MVP)

* Installable (manifest, icons, theme color)
* Offline мінімум:

  * кеш shell/статичних ресурсів
  * розклад можна кешувати read-only (stale-while-revalidate)
* Push-нотифікації — не в MVP.

---

## 9) Розгортання на Vercel (free) + GitHub

* Один GitHub repo.
* Vercel імпорт репозиторію, авто-деплой на `main`.
* ENV в Vercel:

  * `MONGODB_URL`
  * `NEXTAUTH_SECRET`
  * `NEXTAUTH_URL`
* MongoDB Atlas: whitelist 0.0.0.0/0 (для MVP) + користувач з мінімальними правами.

---

## 10) План розробки (короткі ітерації)

### Ітерація 1 (скелет + дизайн система)

* Next.js + TS + Tailwind
* Layout, Typography, Card, Button, Form components
* PWA manifest + базовий SW

### Ітерація 2 (Auth + ролі)

* NextAuth
* Admin/Trainer/Parent routing guards
* Seed admin user

### Ітерація 3 (Halls + Blocks)

* CRUD halls (admin)
* Create HallBlock (admin)
* Візуалізація блоків у календарі залу

### Ітерація 4 (Classes)

* Trainer create/edit/cancel class
* Перевірка конфліктів (перетин в залі + блоки)

### Ітерація 5 (Bookings)

* Parent: schedule + book/cancel
* Атомарне резервування місць (takenSeats)

### Ітерація 6 (Admin облік + Payments MVP)

* Admin dashboard: заняття по тренерах, фільтри
* Payments: ручні записи/статуси

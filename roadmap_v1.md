# 🛣️ Product Roadmap
## Roadmap V1 — MVP “Dance Studio Booking” (Launch-ready)

**Ціль:**
Швидко запустити стабільний, масштабований PWA-додаток для запису дітей на заняття у студії танців з ролями **Admin / Trainer / Parent**, без технічних боргів, готовий до production.

**Статус:**
👉 Повністю спроєктовано та реалізовано на рівні архітектури, моделей, API, UI, security.

---

## V1.1 Архітектура та фундамент

### Технічна платформа

* **Next.js (App Router) + TypeScript**
* **MongoDB + Mongoose**
* **Zod** для валідації всіх входів
* **NextAuth (Credentials)** для auth
* **PWA** (installable, offline cache)
* **Vercel (free tier)** + GitHub auto-deploy

### Архітектурні принципи

* Feature-based структура
* Thin API routes → services layer
* Atomic operations (race-condition safe)
* RBAC (ADMIN / TRAINER / PARENT)
* Production hardening з першого дня

---

## V1.2 Користувацькі ролі та сценарії

### 👩‍💼 Admin

* Управління залами (CRUD)
* Блокування залів у певні періоди
* Управління тренерами
* Огляд занять усіх тренерів
* Ручний облік оплат
* Audit log дій

### 🧑‍🏫 Trainer

* Створення / редагування / скасування занять
* Привʼязка занять до залів
* Обмеження кількості місць
* Перегляд списку записаних дітей

### 👨‍👩‍👧 Parent

* Перегляд розкладу
* Управління дітьми
* Запис / скасування запису на заняття
* Перегляд своїх бронювань

---

## V1.3 Core Functional Modules

### Зали (Halls)

* CRUD залів
* Активні / неактивні
* Привʼязка до занять

### Блокування часу (Hall Blocks)

* Блокування періодів залу
* Перевірка перетинів
* Пріоритет над заняттями

### Заняття (Classes)

* Чіткі time slots
* Перевірка конфліктів:

  * зал ↔ зал
  * зал ↔ блок
* Статуси: scheduled / canceled

### Бронювання (Bookings)

* **Atomic seat reservation**
* Захист від:

  * перевищення capacity
  * дублюючих записів
* Без race conditions
* Idempotent cancel

---

## V1.4 UI / UX (Apple-like)

* Мінімалістичний дизайн
* Системні шрифти
* Чітка ієрархія
* Mobile-first
* Reusable UI Kit
* Empty / loading / error states

---

## V1.5 PWA + Offline

* Installable PWA
* Offline cache:

  * App shell
  * Schedule (stale-while-revalidate)
* Install prompts (Android + iOS)

---

## V1.6 Security, Observability & Stability

* Rate limiting
* Security headers
* Input sanitization
* Centralized error handling
* requestId для кожного запиту
* Audit log (DB)
* Cron-ready endpoints

---

## ✅ Результат V1

> **Production-ready MVP**, який:

* реально можна використовувати студії,
* легко масштабується,
* готовий до інтеграції оплат,
* не має “MVP-боргів”.
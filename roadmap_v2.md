# 🛣️ Product Roadmap
## 🚀 Roadmap V2 — Growth & Monetization

**Ціль:**
Перетворити MVP у **повноцінний комерційний продукт** з автоматичними платежами, підписками та комунікаціями.

---

## V2.1 Online Payments

### Функціонал

* Онлайн-оплата занять
* Автоматичне підтвердження платежів
* Webhooks від платіжної системи

### Технології (обрати під ринок)

* **Stripe** (EU / Global)
* **LiqPay / Fondy** (UA)
* Абстракція `PaymentProvider`

### Архітектура

* `payments` domain:

  * PaymentIntent
  * PaymentTransaction
* Idempotent webhooks
* Retry & reconciliation logic

---

## V2.2 Subscriptions & Pricing Models

### Плани

* Абонемент на:

  * місяць
  * N занять
  * конкретного тренера
* Trial periods
* Pauses / freezes

### Бізнес-логіка

* Ліміт списань
* Перевірка доступності перед booking
* Carry-over занять

### Data model additions

* Subscription
* SubscriptionPlan
* UsageRecord

---

## V2.3 Notifications & Communication

### Канали

* Email (SendGrid / Resend)
* Push (Web Push / Firebase)
* SMS (опціонально)

### Події

* Запис на заняття
* Скасування
* Нагадування за X годин
* Оплата / заборгованість
* Зміна розкладу тренером

### Архітектура

* Event-driven:

  * `BookingCreated`
  * `ClassCanceled`
* Queue / background jobs (Vercel cron / Upstash / BullMQ)

---

## V2.4 Analytics & Admin Insights

* Attendance rate
* Trainer performance
* Revenue per trainer / hall
* Churn rate
* Export to CSV / Google Sheets

---

## V2.5 Multi-Studio & Scaling

* Multi-tenant support
* Studio branding
* Subdomain per studio
* Roles per studio

---

## V2.6 Mobile & UX Enhancements

* Better calendar UX
* Drag-and-drop schedule (admin)
* Parent favorites (trainer / hall)
* Waitlists (auto-promote)

---

# 📌 Summary

| Версія | Фокус                                  | Статус     |
| ------ | -------------------------------------- | ---------- |
| **V1** | Core booking, roles, PWA, stability    | ✅ Ready    |
| **V2** | Payments, subscriptions, notifications | 🔜 Planned |
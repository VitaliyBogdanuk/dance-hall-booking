структура репозиторію (Next.js App Router + API Routes)

.
├─ README.md
├─ package.json
├─ next.config.ts
├─ tsconfig.json
├─ eslint.config.mjs
├─ prettier.config.cjs
├─ postcss.config.js
├─ tailwind.config.ts
├─ .env.example
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ public/
│  ├─ manifest.json
│  └─ icons/
│     ├─ icon-192.png
│     └─ icon-512.png
└─ src/
   ├─ app/
   │  ├─ layout.tsx
   │  ├─ globals.css
   │  ├─ page.tsx
   │  ├─ login/
   │  │  └─ page.tsx
   │  ├─ schedule/
   │  │  └─ page.tsx
   │  ├─ admin/
   │  │  ├─ layout.tsx
   │  │  ├─ halls/
   │  │  │  └─ page.tsx
   │  │  ├─ halls/[id]/blocks/
   │  │  │  └─ page.tsx
   │  │  ├─ trainers/
   │  │  │  └─ page.tsx
   │  │  ├─ classes/
   │  │  │  └─ page.tsx
   │  │  └─ payments/
   │  │     └─ page.tsx
   │  ├─ trainer/
   │  │  ├─ layout.tsx
   │  │  ├─ schedule/
   │  │  │  └─ page.tsx
   │  │  └─ classes/[id]/attendees/
   │  │     └─ page.tsx
   │  └─ parent/
   │     ├─ layout.tsx
   │     ├─ children/
   │     │  └─ page.tsx
   │     └─ bookings/
   │        └─ page.tsx
   │
   │  └─ api/
   │     ├─ auth/[...nextauth]/route.ts
   │     ├─ halls/route.ts
   │     ├─ halls/[id]/route.ts
   │     ├─ halls/[id]/blocks/route.ts
   │     ├─ blocks/[id]/route.ts
   │     ├─ classes/route.ts
   │     ├─ classes/[id]/route.ts
   │     ├─ classes/mine/route.ts
   │     ├─ classes/[id]/bookings/route.ts
   │     ├─ schedule/route.ts
   │     ├─ children/route.ts
   │     ├─ children/[id]/route.ts
   │     ├─ bookings/route.ts
   │     ├─ bookings/[id]/route.ts
   │     ├─ bookings/mine/route.ts
   │     └─ admin/
   │        ├─ trainers/route.ts
   │        ├─ classes/route.ts
   │        └─ payments/
   │           ├─ route.ts
   │           └─ [id]/route.ts
   │
   ├─ components/
   │  ├─ ui/
   │  │  ├─ Button.tsx
   │  │  ├─ Card.tsx
   │  │  ├─ Input.tsx
   │  │  ├─ Select.tsx
   │  │  ├─ Modal.tsx
   │  │  ├─ Toast.tsx
   │  │  └─ Spinner.tsx
   │  └─ layout/
   │     ├─ AppShell.tsx
   │     ├─ TopBar.tsx
   │     └─ SideNav.tsx
   │
   ├─ server/
   │  ├─ db.ts
   │  ├─ env.ts
   │  ├─ auth/
   │  │  ├─ config.ts
   │  │  ├─ rbac.ts
   │  │  └─ session.ts
   │  ├─ http/
   │  │  ├─ errors.ts
   │  │  ├─ response.ts
   │  │  └─ validateRequest.ts
   │  ├─ validation/
   │  │  ├─ common.ts
   │  │  ├─ halls.ts
   │  │  ├─ blocks.ts
   │  │  ├─ classes.ts
   │  │  ├─ bookings.ts
   │  │  ├─ children.ts
   │  │  ├─ payments.ts
   │  │  └─ schedule.ts
   │  ├─ services/
   │  │  ├─ hallService.ts
   │  │  ├─ blockService.ts
   │  │  ├─ classService.ts
   │  │  ├─ bookingService.ts
   │  │  ├─ childService.ts
   │  │  └─ paymentService.ts
   │  └─ utils/
   │     ├─ timeOverlap.ts
   │     ├─ ids.ts
   │     └─ logger.ts
   │
   ├─ lib/
   │  ├─ date.ts
   │  └─ fetcher.ts
   └─ types/
      └─ domain.ts

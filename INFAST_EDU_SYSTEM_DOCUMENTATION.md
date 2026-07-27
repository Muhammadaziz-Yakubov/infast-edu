# 🚀 INFAST ACADEMY OS — TO'LIQ TIZIM HJJATI VA ARXITEKTURA QO'LLANMASI
> **Tizim versiyasi**: 1.0.0  
> **Sana**: 2026-07-26  
> **Loyiha turi**: Monorepo (Backend + Admin CRM + Mobile App)

---

## 📌 MUNDARIJA
1. [Umumiy Ko'rinish va Maqsad](#1-umumiy-korinish-va-maqsad)
2. [Loyiha Tuzilmasi (Folder Structure)](#2-loyiha-tuzilmasi-folder-structure)
3. [Texnologiyalar Steki](#3-texnologiyalar-steki)
4. [Backend Server (NestJS + MongoDB)](#4-backend-server-nestjs--mongodb)
   - 4.1. Server konfiguratsiyasi va middleware-lar
   - 4.2. Auth & Xavfsizlik (JWT + Refresh Token + RBAC)
   - 4.3. 36 ta Backend Modullarining to'liq tahlili
   - 4.4. Sun'iy Intellekt (AI Integration)
   - 4.5. Real-time WebSockets (Socket.io)
5. [Admin CRM Panel (React 19 + Vite + Tailwind)](#5-admin-crm-panel-react-19--vite--tailwind)
   - 5.1. Dizayn Sistemasi va Estetikasi (Glassmorphism & Micro-animations)
   - 5.2. Sahifalar va Ularning Funksionalligi (24+ Sahifa)
   - 5.3. Marketing & Sales Pipeline (Kanban & Lead Scoring)
   - 5.4. LMS Builder & Uy Vazifalari Nazorati
6. [Mobile Ilova (React Native + Expo)](#6-mobile-ilova-react-native--expo)
   - 6.1. Mobile Arxitektura va Cross-Platform Saqlash
   - 6.2. Typing Battle Gamification O'yini
   - 6.3. Market (Coins & XP Do'koni) va O'quvchi Kabineti
7. [To'lov va Billing Tizimi (Payment Engine)](#7-tolov-va-billing-tizimi-payment-engine)
   - 7.1. Subscription Ledger mantiqiy modeli
   - 7.2. Statuslar va Qarzdorlik Nazorati
   - 7.3. Lead → Student Conversion paytidagi to'lov yaratilishi
8. [Tarmoq va Environment IP Sozlamalari](#8-tarmoq-va-environment-ip-sozlamalari)
9. [Loyihani Ishga Tushirish Qo'llanmasi](#9-loyihani-ishga-tushirish-qollanmasi)

---

## 1. 🎯 UMUMIY KO'RINISH VA MAQSAD

**InFast Academy OS** — zamonaviy o'quv markazlari, akademiyalar va ta'lim muassasalari uchun mo'ljallangan yaxlit operatsion tizim (LMS + Marketing CRM + Gamification + AI Assistant).

Tizim uchta asosiy platformani birlashtiradi:
1. **Markazlashtirilgan Backend API** (NestJS & MongoDB).
2. **Boshqaruv va Marketing CRM Paneli** (Adminlar, menejerlar va o'qituvchilar uchun Web platforma).
3. **O'quvchilar Mobil Ilovasi** (Android, iOS va Web uchun mo'ljallangan interaktiv ta'lim ilovasi).

---

## 2. 📂 LOYIHA TUZILMASI (FOLDER STRUCTURE)

```
infast-edu/
 ├── backend/                   # NestJS REST API + WebSocket Server
 │    ├── src/
 │    │    ├── common/          # Global filterlar, interceptorlar va guardlar
 │    │    ├── modules/         # 36 ta biznes modul (Leads, LMS, Auth, Payments...)
 │    │    ├── app.module.ts    # Asosiy ildiz modul
 │    │    └── main.ts          # Serverning kirish nuqtasi
 │    ├── AIAGENT/              # Telegram Personal AI Assistant Node servisi
 │    └── uploads/              # Statik fayllar, rasmlar va pasport kopiyalari
 │
 ├── admin/                     # React 19 + Vite Admin CRM Paneli
 │    ├── src/
 │    │    ├── api/             # Axios API client va xizmatlar
 │    │    ├── components/      # UI komponentlar, Layout va ProtectedRoute
 │    │    ├── pages/           # 24+ ta CRM va LMS sahifalari
 │    │    ├── store/           # Zustand global state (Auth, UI)
 │    │    └── utils/           # Yordamchi funksiyalar va mock baza
 │    └── .env                  # Environment sozlamalari (API URL)
 │
 └── mobile/                    # React Native + Expo Mobile App
      ├── src/
      │    ├── api/             # Cross-platform API client
      │    ├── components/      # Mobile UI va animation komponentlar
      │    ├── navigation/      # React Navigation struktura
      │    ├── screens/         # Mobil ilova ekranlari
      │    └── store/           # Mobile Zustand/Context state
      └── app.json              # Expo konfiguratsiyasi
```

---

## 3. 🛠️ TEXNOLOGIYALAR STEKI

| Qatlam | Texnologiyalar |
| :--- | :--- |
| **Backend Core** | Node.js (v24+), NestJS v11, TypeScript v5.7 |
| **Ma'lumotlar Bazasi** | MongoDB, Mongoose ORM v9 |
| **Sun'iy Intellekt (AI)** | Groq SDK (`llama-3.3-70b-versatile`), Telegram Bot API (`grammy`) |
| **Real-time Server** | `@nestjs/websockets`, `socket.io` |
| **Admin Web Frontend** | React v19, Vite v8, TailwindCSS v4, Lucide Icons, Recharts |
| **Admin State & Query** | Zustand v5, React Query (TanStack Query v5), Axios |
| **Mobile Core** | React Native, Expo SDK, NativeWind (Tailwind), Expo SecureStore |

---

## 4. ⚙️ BACKEND SERVER (NESTJS + MONGODB)

### 4.1. Server Konfiguratsiyasi va Middleware-lar (`main.ts`)
- **Global Prefix**: Barcha API endpointlar `/api/` bilan boshlanadi.
- **Body Parser**: Request hajmi `10mb` gacha oshirilgan (katta hajmdagi pasport va vazifa fayllari uchun).
- **Static Assets**: `/uploads` papkasi statik tarzda ochiq (`http://172.20.10.4:3000/uploads/...`).
- **Helmet Security**: Header xavfsizligi va CORS siyosati sozlangan (`cross-origin`).
- **Global Validation Pipe**: White-list va DTO transformatsiyasi avtomatik ishlaydi.
- **Global Exception Filter & Interceptor**: Xatoliklar va javoblar yagona formatga (`{ success: true, data: ... }`) keltiriladi.
- **Swagger Documentation**: `/api/docs` manzilida OpenAPI hujjati mavjud.
- **Listening Address**: `await app.listen(3000, '0.0.0.0')` — server barcha tarmoq kartalarida tinglaydi.

### 4.2. Auth & Xavfsizlik (RBAC)
- **JWT Authentication**: Login qilinganda `accessToken` (saqlash va so'rov uchun) va `refreshToken` beriladi.
- **Rollar (Roles)**:
  - `SUPER_ADMIN`: Tizimdagi barcha huquqlarga ega.
  - `MANAGER`: Marketing, lidlar, to'lovlar va guruhlarni boshqaradi.
  - `TEACHER`: Dars jadvali, uy vazifalarini tekshirish va o'quvchilar akademik baholarini qo'yadi.
  - `RECEPTION`: O'quvchilarni kutib olish, davomat va tezkor to'lovlar.
  - `STUDENT`: Mobil ilova orqali darslarni ko'radi, vazifa topshiradi va o'yinlarda qatnashadi.

### 4.3. Backend 36 ta Modulining Ta'rifi:
1. `auth` — Ro'yxatdan o'tish, login, refresh token, parolni tiklash.
2. `users` — Tizim foydalanuvchilarini yaratish va profillarini boshqarish.
3. `branches` — O'quv markazi filiallari (filiallar bo'yicha statistikalar).
4. `students` — Talabalar bazasi, ularning shartnomalari, balanslari.
5. `courses` — O'quv kurslari (Frontend, Python, Ingliz tili va h.k.).
6. `lms` — Kurs darslari, modullari va video materiallari.
7. `homework` — Uy vazifalari va talabalar topshiriqlari bazasi.
8. `groups` — O'quv guruhlari, xonalar va dars vaqtlari jadvali.
9. `payments` — Billing, to'lovlar tarixi, qarzdorlik billing jadvali.
10. `attendance` — Kunlik va darslik davomat jurnali.
11. `market` — Gamification uchun do'kon (Coins/XP evaziga sovg'alar).
12. `notifications` — Push bildirishnomalar va ichki xabarlar.
13. `analytics` — Markaziy dashboard va akademik hisobotlar.
14. `events` — Markazda bo'ladigan tadbirlar va master-klasslar.
15. `referrals` — "Do'stingni olib kel" referal tizimi.
16. `chat` — O'qituvchi, admin va talaba o'rtasidagi muloqot.
17. `custom-fields` — Lidlar va talabalar uchun dinamik qo'shimcha maydonlar.
18. `lead-sources` — Lidlar kelib tushgan manbalar (Instagram, Telegram, Google, Flayer).
19. `campaigns` — Reklama kampaniyalari va ularning budjet analitikasi.
20. `activities` — CRM tizimidagi har bir harakat (audit log).
21. `leads` — Potentsial mijozlar (Lidlar) bazasi va konversiya.
22. `calls` — Qo'ng'iroqlar tarixi, suhbat audiosi linki va natijasi.
23. `meetings` — Yuzma-yuz uchrashuvlar va intervyular jadvali.
24. `demo-lessons` — Bepul sinov (demo) darslariga qatnashuv nazorati.
25. `notes` — Lidlar bo'yicha menejerlarning shaxsiy izohlari.
26. `tasks` — Menejerlarga biriktirilgan kunlik vazifalar va eslatmalar.
27. `follow-ups` — Mijoz bilan qayta bog'lanish rejasi.
28. `attachments` — Hujjatlar (Pasport nushasi, shartnoma PDF va h.k.).
29. `reminders` — Avtomatik tizim eslatmalari.
30. `conversions` — Lidni o'quvchiga aylantirish statistikasi.
31. `crm-analytics` — Sales-funnel (Sotuv voronkasi) tahlili.
32. `ai-advisor` — Biznes va marketing bo'yicha AI maslahatchi.
33. `telegram-bot` — Rasmiy Telegram bot integratsiyasi.
34. `telegram-ai` — Telegram shaxsiy AI yordamchisi servisi.
35. `ai` — Groq AI yordamida dars rejalari yaratish va Dashboard chat.
36. `typing` — Typing Battle o'yini backend serveri.

### 4.4. Sun'iy Intellekt (AI Integration)
Tizimda **Groq Cloud API** (`llama-3.3-70b-versatile` modeli) integratsiya qilingan:
- **Dashboard AI Chat**: Markaz rahbari "Bugungi tushum qancha?" yoki "Davomat foizi qanday?" deb so'rasa, AI bazadagi jonli ma'lumotlarni tahlil qilib streaming (SSE) ko'rinishida javob beradi.
- **AI Lesson Creator**: O'qituvchilar uchun dars mavzusiga qarab slaydlarga bo'lingan dars rejasini va topshiriqlarni avtomatik tuzib beradi.

### 4.5. Real-time WebSockets
`@nestjs/websockets` orqali Socket.io server ishlaydi. U Typing Battle o'yinida ikkita o'quvchi o'rtasidagi har bir klaviatura bosilishini 10ms kechikish bilan real-vaqtda sinxronlaydi.

---

## 5. 💻 ADMIN CRM PANEL (REACT 19 + VITE)

### 5.1. Dizayn Sistemasi va Estetikasi (Design System)
- **Glassmorphism & Dark Mode**: Ko'zni charatmaydigan quyuq fon, shaffof (backdrop-blur) kartochkalar va zamonaviy neon urf-odatlari.
- **Ranglar**: Premium Tailind v4 ranglar palitrasi (Indigo, Purple, Emerald, Amber).
- **Micro-animations**: Har bir bosish va sahifa almashinuvi silliq `fade-in`, `zoom-in-95` animatsiyalari bilan boyitilgan.

### 5.2. Asosiy Sahifalar va Ularning Funksiyalari (24+ Sahifa):
- **`/` (Dashboard)**: Boshqaruv paneli, AI chat vidjeti, kunlik darslar jadvali va tezkor KPI statistikasi.
- **`/marketing` (Marketing Dashboard)**: Sotuv voronkasi (Sales Funnel), liddan o'quvchiga aylanish foizi.
- **`/marketing/leads` (Leads List)**: Lidlarning to'liq ro'yxati, filtrlash va qidiruv.
- **`/marketing/leads/:id` (Lead Details)**: Lid shaxsiy sahifasi. Timeline, Qo'ng'iroqlar, Uchrashuvlar, Demo darslar, Hujjatlar va **"Talabaga Aylantirish"** funksiyasi.
- **`/marketing/pipeline` (Kanban)**: Lidlarni bosqichma-bosqich sudrab o'tkazish (Drag & Drop).
- **`/students` & `/students/:id`**: O'quvchilar ro'yxati va ularning akademik profili.
- **`/groups`**: Guruhlar, dars vaqtlari, xonalar va o'qituvchilar biriktiruvi.
- **`/courses` & `/lms`**: Kurslar tuzish, video darslar yuklash, syllabus yaratish.
- **`/lms-check` & `/homework`**: Uy vazifalarini tekshirish paneli.
- **`/payments`**: To'lovlar jurnali, kassa va qarzdorlar ro'yxati.
- **`/attendance`**: Davomatni belgilash va akademik jurnallar.
- **`/ai-advisor` & `/ai-lesson-creator`**: AI instrumentlar sahifalari.

### 5.3. Marketing & Lead Scoring Algorithm
Har bir lidga u ko'rsatgan faolligiga qarab **0 dan 100 gacha bal (Score)** beriladi:
- Saytdan so'rov qoldirdi: +10 ball
- Qo'ng'iroqqa javob berdi: +15 ball
- Demo darsga keldi: +30 ball
- Ball 60+ bo'lsa → **Issiq mijoz (Hot Lead)** 🔴
- Ball 30-59 bo'lsa → **Iliq mijoz (Warm Lead)** 🟡
- Ball 0-29 bo'lsa → **Muz mijoz (Cold Lead)** 🔵

---

## 6. 📱 MOBILE ILOVA (REACT NATIVE + EXPO)

### 6.1. Mobile Arxitektura va Cross-Platform Saqlash
- **NativeWind**: React Native uchun TailwindCSS formatida uslub berish.
- **Cross-Platform Storage**:
  - Native (Android/iOS) da: `Expo SecureStore` (Apples Keychain / Android Keystore darajasida shifrlangan saqlash).
  - Web brauzerda: `localStorage` ga fallback.

### 6.2. Typing Battle Gamification O'yini
- Talabalar mobil ilova orqali bir-birlari bilan klaviaturada bosish tezligi bo'yicha bellashadilar.
- O'yin davomida **WPM (Words Per Minute)** va **Accuracy (Aniqlik foizi)** hisoblab boriladi.
- Musobaqa tugagach, backend g'olibga avtomatik **XP (Tajriba)** va **Coin (Tanga)** beradi.

### 6.3. Market (Coins & XP Do'koni) va O'quvchi Kabineti
- Talabalar toplagan tangalariga o'quv markazining maxsus merchlarini (Futbolka, Huddi, Ruchka, Kitoblar yoki Kursga chegirma) xarid qilishlari mumkin.
- O'quvchi o'zining davomatini, baholarini va dars jadvallarini ko'ra oladi.

---

## 7. 💳 TO'LOV VA BILLING TIZIMI (PAYMENT ENGINE)

Tizimda to'lovlar **Subscription Ledger** mantiqiy modeli asosida ishlaydi.

```
       [Lid Talabaga Aylantirildi]
                    ↓
[Avtomatik Shartnoma (Contract) tuzilishi]
                    ↓
[Oylik To'lov Grafigi Yaratilishi]
        /           |           \
🟢 PAID      🟡 UPCOMING      🔴 OVERDUE
(To'langan)   (Yaqinlashdi)    (Qarzdor)
```

### 7.1. To'lov Mantiqiy Qoidalari:
1. **Lead Conversion**: Lid `LeadDetails` sahifasida "Talabaga Aylantirish" tugmasi bosilganda:
   - Talaba uchun yangi `User` akkaunt yaratiladi (Login va Parol generatsiya qilinadi).
   - Tanlangan guruh va kursga qo'shiladi.
   - Birinchi oylik to'lov va shartnoma avtomatik shakllanadi.
2. **Statuslar**:
   - **PAID**: To'lov to'liq amalga oshirilgan (Tranzaksiya ID va kassa cheki saqlanadi).
   - **UPCOMING**: Keyingi to'lov sanasiga 5 kun qolganda paydo bo'ladi.
   - **OVERDUE**: To'lov muddati o'tib ketgan. Talabaning mobil ilovaga va darslarga kirishi tizim tomonidan avtomatik bloklanishi mumkin.

---

## 8. 🌐 TARMOQ VA ENVIRONMENT IP SOZLAMALARI

Hozirgi kunda loyiha mahalliy tarmoqda (Wi-Fi) quyidagi IP manzillar bo'yicha bir-biri bilan bog'langan:

- **Mahalliy Wi-Fi IP**: `172.20.10.4`
- **Backend API URL**: `http://172.20.10.4:3000/api`
- **Swagger Hujjatlar**: `http://172.20.10.4:3000/api/docs`
- **Admin CRM URL**: `http://localhost:5173` (yoki `http://172.20.10.4:5173`)
- **Production Render URL**: `https://infast-edu.onrender.com/api`

---

## 9. 🚀 LOYIHANI ISHGA TUSHIRISH QO'LLANMASI

### 1. Backend Serverni Ishga Tushirish:
```bash
cd backend
npm install
npx @nestjs/cli start --watch
```

### 2. Admin CRM Panelni Ishga Tushirish:
```bash
cd admin
npm install
npm run dev
```

### 3. Mobile Ilovani Ishga Tushirish:
```bash
cd mobile
npm install
npx expo start
```

---
**Xulosa**: Ushbu InFast Academy OS tizimi zamonaviy biznes va ta'lim talablariga 100% javob beradigan, modulli, o'suvchan va xavfsiz arxitekturaga ega bo'lgan to'liq ekotizimdir.

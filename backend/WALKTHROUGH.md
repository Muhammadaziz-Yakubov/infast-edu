    # InFast Academy OS - Backend API Tizimi Qo'llanmasi

    Ushbu loyiha **InFast Academy OS** o'quv platformasi uchun NestJS, TypeScript va MongoDB (Mongoose) texnologiyalarida ishlab chiqilgan ishlab chiqarishga tayyor (production-ready) backend tizimidir.

    ---

    ## 🏗️ Clean Modular Arxitektura (Tuzilishi)

    Loyiha to'liq modulli arxitekturada tuzilgan. Har bir biznes logika alohida modul ichida joylashgan:

    *   **auth/** — JWT tokenlar (sign/refresh) va parollar bilan ishlash moduli.
    *   **users/** — Admin va xodimlar uchun foydalanuvchilar boshqaruvi.
    *   **students/** — Talabalar profillari, XP, koinlar, daraja (level) va peshqadamlar jadvali (leaderboard).
    *   **courses/** — Kurs shablonlari boshqaruvi.
    *   **lms/** — Modullar, video/matn darslari va test (quiz) tizimi.
    *   **homework/** — Uy vazifalari va ularni tekshirish tizimi.
    *   **groups/** — Guruhlar va darslar jadvalini avtomatik hisoblash moduli.
    *   **payments/** — Oylik to'lovlar, subscriptionlar va auto-block tizimi.
    *   **attendance/** — Darsga qatnashish (davomat) va unga ko'ra XP/Coin rag'batlantirish tizimi.
    *   **market/** — Talabalar uchun koinlar do'koni.
    *   **notifications/** — Talabalarga yuboriladigan ogohlantirishlar va tizim xabarlari.
    *   **analytics/** — Adminlar uchun analitika ma'lumotlari.

    ---

    ## 🔑 Yangi Autentifikatsiya va Talabalar Tizimi

    ### 1. Admin tomonidan Talaba Yaratilishi (`POST /students`)
    Talabalar o'zlarini mustaqil ro'yxatdan o'tkaza olmaydi (Self-registration o'chirildi). Admin talabani yaratishda quyidagi ma'lumotlarni yuboradi:
    *   `fullName` (Ism va Familiya) — majburiy
    *   `studentPhone` (`+998XXXXXXXXX` formatida) — majburiy, unikal
    *   `parentPhone` (Ota-ona telefon raqami) — majburiy
    *   `dateOfBirth` (`DD.MM.YYYY` formatida, masalan: `27.09.2011`) — majburiy
    *   `email` — ixtiyoriy (bazada `sparse: true` qilingan)
    *   `avatar`, `groupId`, `courseId` — ixtiyoriy

    ### 2. Avtomatik Parol Generatsiyasi va Shifrlash
    Admin talabani yaratganida, tizim avtomatik ravishda uning tug'ilgan sanasidan nuqtalarni olib tashlab, default parol yaratadi:
    *   Tug'ilgan sana: `27.09.2011`
    *   Parol: `27092011`
    *   Parol **bcrypt** yordamida shifrlanadi va bazada `mustChangePassword: true` bayrog'i (flag) bilan saqlanadi.

    ### 3. Birinchi Login va Parolni Yangilash (`POST /auth/change-password`)
    *   Talaba o'zining telefon raqami va tug'ilgan sanasidan iborat default parol bilan tizimga kiradi.
    *   Login muvaffaqiyatli bo'lgach, javobda `mustChangePassword: true` qaytadi. Mobil ilova (React Native) buni ko'rib talabani majburiy parolni o'zgartirish ekraniga yo'naltiradi.
    *   Talaba `/auth/change-password` endpointiga yangi parolni yuboradi. Yangilanishdan so'ng `mustChangePassword` avtomatik ravishda `false` ga aylanadi.

    ---

    ## ⚡ Avtomatlashtirilgan Muhim Biznes Logikalar

    ### 1. Avtomatik Dars Jadvali (`GroupsModule`)
    Guruh yaratilganda, tizim dars jadvalini avtomatik tarzda hisoblab chiqadi. Bu jarayon UTC vaqt o'lchovlariga asoslangan bo'lib, vaqt mintaqasi (timezone offset) yoki yozgi/qishki vaqtga o'tishlar sababli xatoliklar kelib chiqishining oldini oladi.

    ### 2. Oylik To'lov Monitoringi va Bloklash (`PaymentsModule`)
    Har kuni fon rejimida ishlovchi monitoring tizimi to'lov muddati tugashini nazorat qiladi:
    *   **Upcoming (Due datega 5 kun qolganda)**: Talabaga bildirishnoma yuboriladi.
    *   **Overdue (Muddati o'tganda)**: To'lov holati `OVERDUE` ga, foydalanuvchining hisobi esa `BLOCKED` holatiga o'tadi.
    *   **Reaktivatsiya**: Yangi to'lov amalga oshirilganda tizim avtomatik ravishda hisobni `ACTIVE` holatiga qaytaradi.

    ### 3. Davomat Gamifikatsiyasi (`AttendanceModule`)
    Talabalar qatnashishi bo'yicha mukofotlar va jarimalar real vaqt rejimida talaba profilida aks etadi:
    *   `PRESENT` (Qatnashdi): `+100 XP` va `+20 coins` beriladi.
    *   `ABSENT` (Qatnashmadi): `-200 XP` va `-50 coins` ayiriladi (0 dan pastga tushib ketmaydi).
    *   Qayta-qayta yuborilgan davomatlar orqali tizimni aldashga urinishlar to'liq bloklangan (Exploit Prevention).

    ---

    ## 🛣️ API Endpointlari Ro'yxati

    | Modul | Metod | Endpoint | Ruxsat | Tavsif |
    | :--- | :--- | :--- | :--- | :--- |
    | **Auth** | `POST` | `/auth/login` | Public | Tizimga kirish, Access & Refresh tokenlarni qaytaradi. |
    | | `POST` | `/auth/refresh` | Public | Access tokenni yangilaydi. |
    | | `POST` | `/auth/change-password` | Auth | Parolni yangilaydi va majburiy o'zgartirish flagini o'chiradi. |
    | **Students**| `POST` | `/students` | Admin | Yangi talaba accounti va profilini yaratadi. |
    | | `GET` | `/students/me` | Talaba | Tizimga kirgan talabaning profili (XP, Coin va hk). |
    | | `PATCH` | `/students/:id` | Admin | Talaba ma'lumotlarini tahrirlash. |
    | | `DELETE`| `/students/:id` | Admin | Talaba va uning profilini o'chirish. |
    | | `GET` | `/students/leaderboard`| Auth | Talabalar reytingi. |
    | **Courses** | `POST` | `/courses` | Admin | Yangi kurs yaratish. |
    | **LMS** | `POST` | `/lms/modules` | Admin | Kurs uchun modul yaratish. |
    | | `POST` | `/lms/lessons` | Admin | Dars va test savollarini qo'shish. |
    | | `POST` | `/lms/lessons/:id/complete`| Talaba | Test topshirish va darsni yakunlash. |
    | **Groups** | `POST` | `/groups` | Admin | Guruh yaratish (jadvalni avtomatik tuzadi). |
    | | `POST` | `/groups/:id/students`| Admin | Guruhga talaba qo'shish. |
    | **Payments**| `POST` | `/payments` | Admin | To'lovni tasdiqlash. |
    | **Market** | `POST` | `/market/rewards` | Admin | Do'konga mahsulot qo'shish. |
    | | `POST` | `/market/rewards/:id/purchase`| Talaba | Mahsulotni koinlarga sotib olish. |
    | **Analytics**| `GET` | `/analytics/dashboard`| Admin | Boshqaruv paneli uchun analitika ma'lumotlari. |

    ---

    ## 🚀 Ishga tushirish Buyruqlari

    ### 1. O'rnatish
    ```bash
    npm install
    ```

    ### 2. Mahalliy Serverni Yondirish
    ```bash
    npm run start:dev
    ```

    ### 3. Testlarni Ishga tushirish (E2E Integration)
    ```bash
    npm run test:e2e
    ```

    ### 4. Build Qilish (Production compilation)
    ```bash
    npm run build
    ```

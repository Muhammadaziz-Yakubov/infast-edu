# InFast LMS: Talaba Mobil Ilovasi Tizim Hujjati

InFast LMS mobil ilovasi — zamonaviy, interaktiv, geymifikatsiyalashgan (gamified) o'quv platformasi hisoblanadi. Ushbu hujjat ilovaning to'liq arxitekturasi, dizayn tizimi, ma'lumotlar oqimi va har bir ekranning batafsil ishlash mexanizmini o'z ichiga oladi.

---

## 1. Texnologik Paket (Tech Stack)

*   **Freymerki:** React Native (Expo SDK 51/52) va TypeScript.
*   **Global State Management:** 
    *   **Zustand:** Tizimga kirish/chiqish, foydalanuvchi ma'lumotlarini saqlash (`authStore`).
    *   **TanStack React Query (v5):** Serverdan keladigan ma'lumotlarni keshlashtirish, sinxronizatsiya va mutatsiyalar.
*   **Navigatsiya:** `@react-navigation/native` va `@react-navigation/bottom-tabs`.
*   **Tarmoq So'rovlari (API):** Axios client, JWT authorization interceptorlar bilan jihozlangan.
*   **Dizayn va Ikonkalar:** `@expo/vector-icons` tarkibidagi `Ionicons` (barcha emojilar vektorli premium belgilarga almashtirilgan).
*   **Xavfsiz Hududlar (Safe Area Layout):** `react-native-safe-area-context` yordamida notch va status-barlar ostiga tushib qolmaslik ta'minlangan.

---

## 2. Loyiha Katalogi Strukturasi

```markdown
mobile/src/
├── api/                  # API so'rovlari va Axios sozlamalari
│   ├── client.ts         # Baza so'rovi (Interceptor, headers, baseUrl)
│   ├── auth.api.ts       # Login va profil yangilash
│   ├── courses.api.ts    # Kurs, dars va test natijalari
│   ├── homework.api.ts   # Uy vazifalari
│   ├── market.api.ts     # InFast do'koni
│   ├── payment.api.ts    # Hisob-fakturalar va to'lovlar
│   ├── ranking.api.ts    # Peshqadamlar (Leaderboard)
│   └── student.api.ts    # Shaxsiy profil va statistikalar
├── components/           # Qayta ishlatiladigan UI komponentlari
│   ├── Avatar.tsx        # Talaba profil rasmi (tizimli border bilan)
│   └── ui/               # Kichik atomar komponentlar
│       ├── Button.tsx    # Premium gradient / yassi tugma
│       ├── ProgressBar.tsx# Yuklanish chizig'i
│       ├── Skeleton.tsx  # Yuklanish animatsiyasi
│       └── StatBadge.tsx # Kichik ko'rsatkichlar
├── navigation/           # Ilova navigatsiyasi
│   └── AppNavigator.tsx  # BottomTabNavigator va StackNavigator
├── screens/              # Asosiy ekranlar (Screens)
│   ├── auth/             # Kirish sahifalari
│   └── main/             # Asosiy sahifalar
│       ├── HomeScreen.tsx        # Bosh sahifa
│       ├── LearningScreen.tsx    # Darslik va modullar ro'yxati
│       ├── LessonScreen.tsx      # Dars videosi va Multi-round Quiz
│       ├── MarketScreen.tsx      # InFast do'koni
│       ├── NotificationScreen.tsx# Bildirishnomalar
│       ├── PaymentsScreen.tsx    # To'lovlar sahifasi
│       ├── PracticeScreen.tsx    # Mustaqil mashqlar sahifasi
│       ├── ProfileScreen.tsx     # Talaba profili va davomati
│       └── RankingScreen.tsx     # Peshqadamlar jadvali
├── store/                # Zustand global do'konlari
│   └── authStore.ts      # Token va talaba holati
├── types/                # TypeScript interfeyslari
│   └── index.ts          # LessonProgress va boshqa tip ta'riflari
└── utils/                # Yordamchi sozlamalar va konstantalar
    ├── constants.ts      # Ranglar va o'lchamlar (COLORS)
    └── helpers.ts        # Matn va vaqtni formatlash funksiyalari
```

---

## 3. Dizayn Tizimi va Premium Visual Estetika

Ilova dizayni quyuq neon-kosmik dizaynda ishlab chiqilgan bo'lib, o'quvchiga premium va qimmatbaho muhit yaratadi:

*   **Asosiy Fon (`COLORS.bg`):** Deep Obsidian (`#09090E`).
*   **Kartalar va Modullar (`COLORS.card`):** Dark Navy/Indigo (`#161622` va `#1E1E2E`).
*   **Asosiy Neon Rang (`COLORS.primary`):** Gold Accent (`#FFC529` / `#F5C842`).
*   **Muvaffaqiyat Rangi (`COLORS.accentGreen`):** Emerald Green (`#4ADE80`).
*   **Xatolik / Rad etilgan (`COLORS.accentRed`):** Crimson Red (`#EF4444`).
*   **Muted Text (`COLORS.textMuted`):** Ash Gray (`#7C7C8A`).
*   **Yordamchi Tugmalar:** Pill-shaklidagi orqa fonlar, 20px dan 24px gacha bo'lgan burchak radiusi (borderRadius), yupqa chegara chiziqlari (`rgba(255, 255, 255, 0.05)`).
*   **Animatsiyalar:** Hover ta'sirlari, yuklanayotgan vaqtda Skeleton Loader va Activity Indicatorlar qo'llanilgan.

---

## 4. Har bir Ekran (Screen) va Ularning Mantiqiy Ishlashi

### 1. Bosh Sahifa (`HomeScreen.tsx`)
*   **Maqsadi:** Talabani o'qish jarayoni bilan tanishtirish, tezkor havolalar va yangiliklarni ulashish.
*   **Tarkibiy Qismlar:**
    *   **Header:** Profil rasmi, salomlashish matni va tangalar (`InFast Tangalar`) / notification belgisi.
    *   **Status Card:** Kursdagi foiz progressi, tugallangan darslar nisbati.
    *   **Tezkor Amallar Grid (Quick Actions):** "AI Mentor", "Events", "Practice", "IT Certificate" kabi bo'limlarga tezkor o'tishlar.
    *   **Announcements Banner:** E'lonlar va musobaqalar uchun gorizontal slayd-karusel.

### 2. Darslar Sahifasi (`LearningScreen.tsx`)
*   **Maqsadi:** Kurs tarkibidagi modullar va darslarni iyerarxik ko'rsatish.
*   **Tarkibiy Qismlar:**
    *   Gorizontal va vertikal scroll orqali modullar ro'yxati.
    *   Har bir modul ichida darslar soni, qiyinchilik darajasi, va to'plangan ballar foizi.
    *   Har bir dars kartasida dars to'liq tugatilgan bo'lsa `✓` belgisi, aks holda raundlar holati ko'rinadi.

### 3. Dars Tafsiloti va Test Sahifasi (`LessonScreen.tsx`)
*   **Maqsadi:** Video darsni tomosha qilish va dars bo'yicha ko'p raundli (Multi-round) test topshirish.
*   **Ishlash Mantiqi:**
    *   **Video Pleyer:** YouTube API WebView orqali integratsiya qilingan bo'lib, o'quvchi videoni oxirigacha tomosha qilganda API orqali `VIDEO_ENDED` statusi yuborilib, keyingi jarayon ochiladi.
    *   **Multi-Round Quiz:** Testlar jami bir nechta raundlarga bo'lingan. Savollar massivining `round` parametriga qarab guruhlanadi.
    *   **Raundlarni Saqlash:** Talaba har safar bitta raundni yakunlaganida backenddagi `completeLesson` API ga uning javoblari va `completedRounds` yoziladi.
    *   **Qayta Urinish (Reset):** Agar talaba testdan o'ta olmasa, `handleResetQuiz` chaqiriladi va backenddagi uning dars progressi to'liq 0 qilinadi hamda 1-raunddan boshlanadi.
    *   **Yakunlash (Finish):** Barcha raundlar topshirilgandan so'ng "Darsni yakunlash" tugmasi bosiladi va jami ball foizlarda hisoblanib, dars yopiladi.
    *   **Bloklash (Locking):** Dars tugallangan (`progress.completed = true`) bo'lsa, darsdagi barcha testlar va raundlar butunlay bloklanadi (passiv bo'ladi), o'quvchi ularni qayta ishlay olmaydi. Tepada esa dars foizi (masalan, `✓ Yakunlangan (85%)`) aks etadi.

### 4. Peshqadamlar Sahifasi (`RankingScreen.tsx`)
*   **Maqsadi:** Talabalar o'rtasida sog'lom raqobatni shakllantirish (Geymifikatsiya).
*   **Tarkibiy Qismlar:**
    *   **Top 3 Talaba:** Birinchi 3 ta o'rin uchun oltin, kumush va bronza medal ko'rinishidagi yirik aylana kartalar.
    *   **Leaderboard List:** Qolgan talabalarning XP reytingi bo'yicha tartiblangan ro'yxati.
    *   **Xavfsiz Joylashuv:** `useSafeAreaInsets` orqali status barga tegib ketmaslik dizayni o'rnatilgan.

### 5. To'lovlar Sahifasi (`PaymentsScreen.tsx`)
*   **Maqsadi:** Talaba o'qish to'lovlari hisobini ko'rib borishi.
*   **Tarkibiy Qismlar:**
    *   **To'lov Holati:** "Faol" yoki "Qarzdor" status kartasi.
    *   **Invoyslar (Invoices):** Oylik to'lovlar tarixi, to'lov sanasi va turi (Click, Payme, Naqd).
    *   **Batafsil ma'lumot:** Kelgusi to'lov oxirgi muddati.

### 6. Do'kon Sahifasi (`MarketScreen.tsx`)
*   **Maqsadi:** Topilgan InFast tangalarga platformadagi sovg'alarni sotib olish.
*   **Sotiladigan buyumlar:** IT sertifikatlari, dasturlash kitoblari, InFast Academy futbolka va hudilari.

### 7. Profil Sahifasi (`ProfileScreen.tsx`)
*   **Maqsadi:** Shaxsiy ma'lumotlar, daraja (Level) va batafsil o'quv statistikasini chiqarish.
*   **Tarkibiy Qismlar:**
    *   **Avatar va Daraja:** O'quvchi darajasi (Level 1, 2...) va keyingi darajaga o'tish uchun zarur bo'lgan XP shkalasi.
    *   **2x2 Ko'rsatkichlar Griti:**
        1.  *Tangalar soni* (Coins)
        2.  *Bitirilgan darslar* (masalan, 1/2 yoki 5/10)
        3.  *O'rtacha Quiz bahosi* (masalan, 85%)
        4.  *Faollik / Davomat foizi* (Attendance Rate)
    *   **Shaxsiy Ma'lumotlar:** Kurs nomi, Guruh nomi, Telefon raqamlar, Tug'ilgan sana.
    *   **Batafsil Davomat:** Necha kun darsga kelgan / kelmaganligi haqida batafsil statistika.
    *   **Nishonlar (Badges):** "Birinchi Dars", "Tirishqoq Talaba" va boshqa erishilgan yutuqlar.

---

## 5. Gamifikatsiya va Mukofotlash Tizimi (XP & Coin)

Talabani rag'batlantirish maqsadida to'liq dinamik XP va Coin hisoblash tizimi yo'lga qo'yilgan:

*   **Taqdim etish sharti:** Dars testini muvaffaqiyatli topshirganida (faqat 1-marta to'liq topshirilganda).
*   **Mukofot Formulalari (Backendda):**
    *   **Bazaviy XP:** Testni topshirganlik uchun `20 XP` kafolatlangan ball.
    *   **Natijaviy XP:** To'g'ri javoblar foizi miqdorida qo'shimcha XP beriladi (0% - 100% oralig'ida). *Masalan, 80% to'g'ri bo'lsa, +80 XP.*
    *   **Mukammal Natija Bonusi (100% score):** Qo'shimcha `+50 XP` bonus.
    *   **Tangalar (Coins):** To'g'ri javoblar foizining beshdan biri (`score / 5`). *Masalan, 100% uchun 20 ta tanga.*
    *   **Mukammal tanga bonusi:** Qo'shimcha `+10 Coin`.
    *   *Misol uchun: Agar talaba 100% ball olsa, u jami 170 XP va 30 Coin mukofot oladi.*

---

## 6. Ma'lumotlar Oqimi (API va Caching)

React Query yordamida har bir operatsiyadan so'ng kesh avtomatik yangilanadi (Query Invalidation):
1.  **Dars yakunlanganida (`completeLessonMutation`):**
    *   `['lessonProgress', lessonId]` keshini yangilab, ekrandagi test mantiqini bloklaydi va foizni yangilaydi.
    *   `['studentProfile']` keshini yangilab, Bosh sahifa va Profil sahifasidagi o'quvchi tangalari, XP darajasi, bitirgan darslari sonini yangilaydi.
    *   `['courseProgress']` keshini yangilab, Learning sahifasidagi foizlarni to'g'rilaydi.
2.  **API So'rovi Tizimi (`api/client.ts`):**
    *   Har bir so'rovga `Authorization: Bearer <TOKEN>` sarlavhasi (header) avtomatik qo'shiladi.
    *   Agar token eskirgan bo'lsa (401 error), `authStore` avtomatik logout qiladi va foydalanuvchini login ekraniga yo'naltiradi.

# Modules 1 to 3 lesson content generator (Lessons 1 to 39)

def get_m1_m3_lessons():
    lessons = {}

    # -------------------------------------------------------------
    # LESSON 1: Web rivojlanishi, Brauzerlar ishlashi va HTML ga kirish
    # -------------------------------------------------------------
    lessons[1] = {
        "practice": {
            "title": "1-Dars Amaliyoti: Web rivojlanishi, Brauzerlar ishlashi va HTML ga kirish",
            "description": "Foydalanuvchining shaxsiy vizitka sahifasi uchun HTML5 standartlariga mos bo'lgan asosiy hujjat tuzilmasini yarating. Sahifada bosh sarlavha (h1) va foydalanuvchi haqida qisqacha ma'lumot beruvchi matn (p) bo'lishi shart.",
            "language": "html",
            "starterCode": "<!DOCTYPE html>\n<html lang=\"uz\">\n<head>\n    <meta charset=\"UTF-8\">\n    <title>Mening Vizitkam</title>\n</head>\n<body>\n    <!-- TODO: h1 tegi yordamida ismingizni yozing -->\n    \n    <!-- TODO: p tegi yordamida kasbingiz haqida ma'lumot yozing -->\n    \n</body>\n</html>",
            "expectedOutput": "<h1>Ali Valiyev</h1>\n<p>Frontend dasturchi hamda web texnologiyalar ishqibozi.</p>",
            "hints": [
                "Bosh sarlavha yaratish uchun <h1> va </h1> teglaridan foydalaning.",
                "Matn bloki yaratish uchun <p> va </p> teglaridan foydalaning.",
                "Barcha ko'rinadigan elementlar <body> tegi ichida joylashishi kerak."
            ],
            "validationType": "structure",
            "validationRules": [
                "<!DOCTYPE html>",
                "<html[^>]*>",
                "<head>",
                "<body[^>]*>",
                "<h1[^>]*>.*?</h1>",
                "<p[^>]*>.*?</p>"
            ],
            "xpReward": 50,
            "coinReward": 10
        },
        "quiz": {
            "passingScore": 80,
            "questions": [
                {
                    "question": "Web brauzer HTML hujjatni serverdan qabul qilganda, uni ekranda aks ettirish uchun birinchi bo'lib qanday bosqichni amalga oshiradi?",
                    "options": [
                        "HTML matnini tahlil qilib (parsing), DOM (Document Object Model) daraxtini hosil qiladi",
                        "JavaScript kodlarini bajarib, serverga qayta so'rov yuboradi",
                        "Barcha CSS fayllarni yuklab olib, darhol ekranga chizadi (painting)",
                        "Faylni avtomatik tarzda PDF formatiga o'tkazadi"
                    ],
                    "correctAnswer": 0,
                    "round": 1
                },
                {
                    "question": "HTTP so'rovida brauzer va server o'rtasida ma'lumot almashinuvi paytida status kodi 200 nimani bildiradi?",
                    "options": [
                        "So'rov muvaffaqiyatli bajarildi va resurs qaytarildi (OK)",
                        "So'ralgan resurs serverda topilmadi (Not Found)",
                        "Serverda ichki xatolik yuz berdi (Internal Server Error)",
                        "Foydalanuvchi tizimga kirmagan (Unauthorized)"
                    ],
                    "correctAnswer": 0,
                    "round": 1
                },
                {
                    "question": "HTML5 hujjatining eng birinchi qatorida yoziladigan `<!DOCTYPE html>` deklaratsiyasining asosiy vazifasi nima?",
                    "options": [
                        "Brauzerga hujjat HTML5 standartiga mos ravishda render qilinishi kerakligini ko'rsatish",
                        "Brauzer konsolida JavaScript xatolarini yashirish",
                        "CSS stillarini avtomatik ravishda hujjatga ulab berish",
                        "Sahifa yuklanish tezligini 2 barobarga oshirish"
                    ],
                    "correctAnswer": 0,
                    "round": 1
                },
                {
                    "question": "Quyidagi HTML kodidagi sintaktik xatolikni aniqlang:\n```html\n<h1>Xush kelibsiz<p>Bu mening blogim</h1></p>\n```",
                    "options": [
                        "Teglar bir-birining ichida noto'g'ri yopilgan (`<p>` tegi `<h1>` yopilishidan oldin yopilishi kerak)",
                        "`<h1>` tegi ichida matn yozib bo'lmaydi",
                        "`<p>` tegi uchun class atributi ko'rsatilmagan",
                        "`<!DOCTYPE html>` tegi majburiy ravishda `<h1>` ichida yozilishi kerak"
                    ],
                    "correctAnswer": 0,
                    "round": 2
                },
                {
                    "question": "Quyidagi koddagi `charset=\"UTF-8\"` meta tegi qanday vazifani bajaradi?\n```html\n<head>\n  <meta charset=\"UTF-8\">\n</head>\n```",
                    "options": [
                        "Hujjatdagi barcha belgilarni (jumladan o'zbekcha o', g' harflarini) to'g'ri kodlash va aks ettirishni ta'minlaydi",
                        "Brauzerga faqat ingliz tilidagi matnlarni ko'rsatishni buyuradi",
                        "Sahifa fonining rangini oq rangga o'zgartiradi",
                        "JavaScript fayllarini asinxron yuklashni yoqadi"
                    ],
                    "correctAnswer": 0,
                    "round": 2
                },
                {
                    "question": "Quyidagi HTML hujjat skletida foydalanuvchiga ko'rinadigan barcha kontent qaysi teg ichiga yozilishi shart?\n```html\n<html>\n  <head><title>Test</title></head>\n  <!-- Kontent qayerda bo'lishi kerak? -->\n</html>\n```",
                    "options": [
                        "<body> va </body> teglarining ichiga",
                        "<head> va </head> teglarining ichiga",
                        "<title> tegi ichiga",
                        "Doctype va html teglarining o'rtasiga"
                    ],
                    "correctAnswer": 0,
                    "round": 2
                },
                {
                    "question": "Siz web loyiha yaratmoqdasiz. Sahifada asosiy sarlavha va kirish matni bo'lishi kerak. Qaysi strukturaviy kod standartga mos va to'g'ri hisoblanadi?",
                    "options": [
                        "```html\n<body>\n  <h1>Asosiy Sarlavha</h1>\n  <p>Kirish matni bu yerda joylashadi.</p>\n</body>\n```",
                        "```html\n<head>\n  <h1>Asosiy Sarlavha</h1>\n  <p>Kirish matni bu yerda joylashadi.</p>\n</head>\n```",
                        "```html\n<body>\n  <p><h1>Asosiy Sarlavha</h1></p>\n</body>\n```",
                        "```html\n<html>\n  <h1>Asosiy Sarlavha</h1>\n</html>\n```"
                    ],
                    "correctAnswer": 0,
                    "round": 3
                },
                {
                    "question": "Brauzerda sahifa ochilganda sarlavha satrida (browser tab) ko'rinadigan matnni o'zgartirish uchun koddagi qaysi joyni tahrirlash kerak?",
                    "options": [
                        "`<head>` ichidagi `<title>` tegi matnini",
                        "`<body>` ichidagi `<h1>` tegi matnini",
                        "`<meta name=\"description\">` atributini",
                        "`<!DOCTYPE html>` deklaratsiyasini"
                    ],
                    "correctAnswer": 0,
                    "round": 3
                },
                {
                    "question": "Agar brauzer konsolida HTML fayl parse bo'layotganda `Uncaught SyntaxError` bo'lmasada, sahifada elementlar surilib ketgan bo'lsa, buning eng ehtimoliy sababi nima?",
                    "options": [
                        "Ochilgan teglar to'g'ri yopilmagan yoki noto'g'ri ketma-ketlikda joylashtirilgan",
                        "Server uzilib qolgan",
                        "Brauzer HTML5 standartini umuman qo'llab-quvvatlamaydi",
                        "Kompyuterda RAM xotira yetishmayapti"
                    ],
                    "correctAnswer": 0,
                    "round": 3
                }
            ]
        }
    }

    # -------------------------------------------------------------
    # LESSON 2: HTML Hujjat strukturasi: doctype, html, head, body teglar
    # -------------------------------------------------------------
    lessons[2] = {
        "practice": {
            "title": "2-Dars Amaliyoti: HTML Hujjat strukturasi: doctype, html, head, body teglar",
            "description": "To'liq HTML5 hujjati strukturasini tuzing. `lang=\"uz\"` atributi bilan `<html>` tegi, sarlovhasi 'Profil Sahifasi' bo'lgan `<head>`, hamda `<body>` ichida `<header>`, `<main>`, va `<footer>` semantik bloklarini joylashtiring.",
            "language": "html",
            "starterCode": "<!-- TODO: HTML5 doctype e'lon qiling -->\n<!-- TODO: html (lang=\"uz\"), head (title bilan) va body tuzilmasini yozing -->\n",
            "expectedOutput": "<!DOCTYPE html>\n<html lang=\"uz\">\n<head>\n    <meta charset=\"UTF-8\">\n    <title>Profil Sahifasi</title>\n</head>\n<body>\n    <header>Header content</header>\n    <main>Main content</main>\n    <footer>Footer content</footer>\n</body>\n</html>",
            "hints": [
                "<!DOCTYPE html> birinchi qatorda bo'lishi lozim.",
                "<html lang=\"uz\"> atributini unutmang.",
                "<body> ichiga header, main va footer teglarini joylashtiring."
            ],
            "validationType": "structure",
            "validationRules": [
                "<!DOCTYPE html>",
                "<html[^>]*lang=[\"']uz[\"'][^>]*>",
                "<head>",
                "<title>.*?Profil Sahifasi.*?</title>",
                "<body[^>]*>",
                "<header[^>]*>.*?</header>",
                "<main[^>]*>.*?</main>",
                "<footer[^>]*>.*?</footer>"
            ],
            "xpReward": 50,
            "coinReward": 10
        },
        "quiz": {
            "passingScore": 80,
            "questions": [
                {
                    "question": "HTML hujjatidagi `<html lang=\"uz\">` atributi qanday amaliy ahamiyatga ega?",
                    "options": [
                        "Ekran o'qiydigan dasturlar (screen readers) va qidiruv tizimlari (SEO) uchun sahifa tilini aniqlab beradi",
                        "Matnni avtomatik ravishda o'zbek tiliga tarjima qiladi",
                        "Brauzer shriftini o'zbekcha shriftga o'zgartiradi",
                        "Faqat O'zbekiston IP manzillaridan kirishga ruxsat beradi"
                    ],
                    "correctAnswer": 0,
                    "round": 1
                },
                {
                    "question": "HTML hujjatining `<head>` bo'limi nimaga mo'ljallangan?",
                    "options": [
                        "Sahifa haqidagi meta-ma'lumotlar, sarlavha, skriptlar va CSS ulash uchun",
                        "Foydalanuvchi ko'radigan asosiy rasm va matnlarni joylash uchun",
                        "Faqat sahifaning quyi qismi (footer) uchun",
                        "Faqat server ma'lumotlar bazasi so'rovlarini saqlash uchun"
                    ],
                    "correctAnswer": 0,
                    "round": 1
                },
                {
                    "question": "HTML5 da o'zini o'zi yopuvchi (self-closing) teglar uchun qaysi sintaksis to'g'ri va tavsiya etiladi?",
                    "options": [
                        "`<meta charset=\"UTF-8\">` yoki `<meta charset=\"UTF-8\" />`",
                        "`<meta charset=\"UTF-8\"></meta>` (har doim yopiq teg shart)",
                        "`<head meta charset=\"UTF-8\">`",
                        "`<UTF-8 meta>`"
                    ],
                    "correctAnswer": 0,
                    "round": 1
                },
                {
                    "question": "Quyidagi koddagi semantik va strukturaviy xatolik nimada?\n```html\n<!DOCTYPE html>\n<head>\n  <title>Mening sahifam</title>\n</head>\n<html lang=\"uz\">\n  <body><h1>Salom</h1></body>\n</html>\n```",
                    "options": [
                        "`<head>` tegi `<html>` tegining ichida joylashishi kerak edi",
                        "`<!DOCTYPE html>` eng pastda bo'lishi kerak",
                        "`<title>` tegi `<body>` ichida bo'lishi shart",
                        "`<h1>` tegi `<head>` ichiga o'tkazilishi kerak"
                    ],
                    "correctAnswer": 0,
                    "round": 2
                },
                {
                    "question": "Quyidagi HTML strukturada foydalanuvchiga brauzer oynasida ko'rinadigan qism qaysi rang bilan belgilangan teg ichida saqlanadi?\n```html\n<!DOCTYPE html>\n<html lang=\"uz\">\n  <head><title>Doc</title></head>\n  <body>\n    <main><h1>Kontent</h1></main>\n  </body>\n</html>\n```",
                    "options": [
                        "`<body>` tegi ichidagi `<main>` va `<h1>` elementlari",
                        "Faqat `<head>` ichidagi `<title>` elementi",
                        "Faqat `<!DOCTYPE html>` deklaratsiyasi",
                        "`<html lang=\"uz\">` atributining o'zi"
                    ],
                    "correctAnswer": 0,
                    "round": 2
                },
                {
                    "question": "Quyidagi koddagi `title` tegi qayerda xato joylashgan?\n```html\n<!DOCTYPE html>\n<html lang=\"uz\">\n  <head></head>\n  <body>\n    <title>Mening Loyiham</title>\n  </body>\n</html>\n```",
                    "options": [
                        "`<title>` tegi `<body>` ichida emas, `<head>` ichida joylashishi lozim",
                        "`<title>` tegi `<html>` dan tashqarida bo'lishi kerak",
                        "`<title>` tegi o'rniga `<meta title>` ishlatilishi kerak",
                        "Xatolik yo'q, xohlagan joyda yozsa bo'ladi"
                    ],
                    "correctAnswer": 0,
                    "round": 2
                },
                {
                    "question": "Professional darajadagi HTML5 loyihasini boshlash uchun qaysi minimal shablon kodi to'liq va xatosiz hisoblanadi?",
                    "options": [
                        "```html\n<!DOCTYPE html>\n<html lang=\"uz\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Loyiha</title>\n</head>\n<body>\n</body>\n</html>\n```",
                        "```html\n<html>\n<title>Loyiha</title>\n<body></body>\n</html>\n```",
                        "```html\n<head>\n  <meta charset=\"UTF-8\">\n</head>\n<body>\n  <html></html>\n</body>\n```",
                        "```html\n<!DOCTYPE html>\n<title>Loyiha</title>\n```"
                    ],
                    "correctAnswer": 0,
                    "round": 3
                },
                {
                    "question": "Agarda sahifa kodida `<!DOCTYPE html>` tushirib qoldirilsa, eski brauzerlar va zamonaviy brauzerlar sahifani qanday rejimda render qiladi?",
                    "options": [
                        "Quirks Mode (moslashuvchan rejim) da render qiladi, bu esa CSS layout buzilishlariga olib kelishi mumkin",
                        "Sahifa umuman ochilmaydi va blank oq ekran chiqadi",
                        "Brauzer avtomatik ravishda faylni o'chirib yuboradi",
                        "JavaScript ishlamay qoladi"
                    ],
                    "correctAnswer": 0,
                    "round": 3
                },
                {
                    "question": "Mobil qurilmalarda sahifaning to'g'ri va masshtabli ko'rinishini ta'minlash uchun `<head>` ichida qaysi meta teg bo'lishi shart?",
                    "options": [
                        "`<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">`",
                        "`<meta name=\"mobile\" content=\"true\">`",
                        "`<meta name=\"screen\" content=\"responsive\">`",
                        "`<meta charset=\"mobile-utf8\">`"
                    ],
                    "correctAnswer": 0,
                    "round": 3
                }
            ]
        }
    }

    # Helper function to auto-generate placeholder lessons with realistic unique data if needed
    # We will build all 114 explicitly in python scripts!
    return lessons


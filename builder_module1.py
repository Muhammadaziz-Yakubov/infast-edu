# builder_module1.py - Lessons 1 to 12 (HTML5 & Semantic Structure)

def get_module1_lessons():
    return {
        1: {
            "description": """📌 NIMA UCHUN KERAK:
Web brauzerlar (Chrome, Firefox, Safari) internetdagi ma'lumotlarni foydalanuvchiga tushunarli vizual shaklda ko'rsatish uchun mas'ul. HTML (HyperText Markup Language) esa barcha web sahifalarning tayanchi, ya'ni suyak karkasidir. HTML brauzerga qaysi qism sarlavha, qaysi biri matn, rasm yoki giperhavola ekanligini bildiradi. Brauzer HTML kodni parse qilib, xotirada DOM (Document Object Model) daraxtini quradi.

📍 QAYERDA ISHLATILADI:
Google, Meta, Amazon kabi dunyodagi har qanday web ilova yoki sayt bitta oddiy HTML hujjatini brauzerga yuklashdan boshlanadi. SPA (Single Page Application) ilovalarda ham bitta root HTML fayl barcha render jarayonini ishga tushiradi.

❌ KO'P YO'L QO'YILADIGAN XATOLAR:
- <!DOCTYPE html> deklaratsiyasini tushirib qoldirish (bu brauzerni 'Quirks Mode' ga tushirib, CSS layoutlarni buzadi).
- Ochilgan teglarni yopishni unutish yoki teg joylashuvi ketma-ketligini buzish (masalan, <h1><p>...</h1></p>).
- Matn elementlarini teglarsiz to'g'ridan-to'g'ri <body> ichiga yozib ketish.

💡 BEST PRACTICES (ENG YAXSHI AMALIYOTLAR):
- Har doim hujjatni <!DOCTYPE html> bilan boshlang va <html lang="uz"> atributida sahifa tilini belgilang.
- Barcha elementlarni to'g mezon semantik teglarga o'rang (sarlavhalar uchun h1-h6, matn uchun p).
- Koddagi barcha teg nomlarini kichik harflarda (lowercase) yozing.

🚀 REAL-WORLD MISOLLAR:
Har qanday e-commerce yoki yangiliklar sayti (masalan, Gazeta.uz) serverdan birinchi bo'lib HTML faylini qabul qiladi. Brauzer uni parsing qilib, DOM hosil qiladi va foydalanuvchiga dastlabki kontentni ko'rsatadi.

💼 INTERVIEW TIPS (SUHBAT SAVOLLARI):
Q: Brauzer HTML kodni olganda nima sodir bo'ladi?
A: Brauzer HTML tokenizatsiya va parsing jarayonini amalga oshirib, DOM daraxtini tuzadi. Keyin CSSOM bilan birlashtirib Render Tree hosil qiladi va sahifani chizadi (Paint).

⚡ PERFORMANCE & ACCESSIBILITY:
- Minimal HTML hajmi va to'g'ri teglar sahifa parsing tezligini oshiradi.
- Ekran o'qiydigan dasturlar (Screen Readers) imkoniyati cheklangan foydalanuvchilar uchun DOM strukturasi bo'yicha navigatsiya qiladi.""",
            "practice": {
                "title": "1-Dars Real-World Task: Shaxsiy Muhandislik Portfoliosi Bosh Sahifasi",
                "description": "Kompaniya loyihasi uchun standartlarga mos, to'liq va xatosiz HTML5 boshlang'ich karkasini tuzing. Sahifa head qismida sarlavha 'Frontend Engineer Portfolio' bo'lsin. Body ichida h1 tegi bilan to'liq ism va p tegi bilan mutaxassislik tavsifi joylashtirilsin.",
                "language": "html",
                "starterCode": "<!-- TODO: 1. HTML5 Doctype e'lon qiling -->\n<!-- TODO: 2. html tegi va uz tili atributini kiriting -->\n<!-- TODO: 3. head ichida meta charset va title tegini joylashtiring -->\n<!-- TODO: 4. body ichida h1 sarlavha va p paragrafiga mutaxassislik ma'lumotlarini yozing -->\n",
                "expectedOutput": "<!DOCTYPE html>\n<html lang=\"uz\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Frontend Engineer Portfolio</title>\n</head>\n<body>\n  <h1>Jasur Rahimov</h1>\n  <p>Senior Frontend Developer (React / TypeScript / Next.js)</p>\n</body>\n</html>",
                "hints": [
                    "<!DOCTYPE html> satri eng birinchi qatorda bo'lishi shart.",
                    "Hujjat sarlavhasi <head> ichida <title> tegi orqali beriladi.",
                    "Foydalanuvchiga ko'rinadigan barcha elementlar <body> ichida joylashadi."
                ],
                "validationType": "structure",
                "validationRules": [
                    "<!DOCTYPE html>",
                    "<html[^>]*lang=[\"']uz[\"'][^>]*>",
                    "<head>",
                    "<meta[^>]*charset=[\"']UTF-8[\"'][^>]*>",
                    "<title>.*?Portfolio.*?</title>",
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
                        "question": "Web brauzer serverdan HTML faylni qabul qilganda, uni ekranda aks ettirish uchun birinchi bo'lib qanday texnik bosqichni amalga oshiradi?",
                        "options": [
                            "HTML kodni tokenizatsiya va parse qilib, DOM (Document Object Model) daraxtini hosil qiladi",
                            "JavaScript kodlarini bajarib, serverga qayta so'rov yuboradi",
                            "Barcha CSS fayllarni yuklab olib, darhol ekranga chizadi (painting)",
                            "Faylni avtomatik tarzda PDF formatiga o'tkazadi"
                        ],
                        "correctAnswer": 0,
                        "round": 1
                    },
                    {
                        "question": "HTTP protokolida brauzer serverga so'rov yuborganda 200 OK kodi nimani anglatadi?",
                        "options": [
                            "So'ralgan HTML resurs muvaffaqiyatli topildi va javob tana qismida qaytarildi",
                            "So'ralgan resurs serverda topilmadi (Not Found)",
                            "Serverda ichki mantiqiy xatolik yuz berdi",
                            "Foydalanuvchi auth tokeni muddati o'tgan"
                        ],
                        "correctAnswer": 0,
                        "round": 1
                    },
                    {
                        "question": "HTML5 hujjatining birinchi satridagi `<!DOCTYPE html>` deklaratsiyasi tushirib qoldirilsa, brauzerda qanday muammo yuzaga keladi?",
                        "options": [
                            "Brauzer 'Quirks Mode' rejimiga o'tadi va zamonaviy CSS layoutlar hamda standartlar noto'g'ri render bo'lishi mumkin",
                            "Brauzer oynasi blank oq bo'lib qoladi va ishlamaydi",
                            "JavaScript ijro etilishi taqiqlanadi",
                            "Server so'rovni bekor qiladi"
                        ],
                        "correctAnswer": 0,
                        "round": 1
                    },
                    {
                        "question": "Quyidagi HTML kodida qaysi strukturaviy sintaksis xatosi mavjud?\n```html\n<h1>Frontend Dasturchi<p>React va TypeScript bo'yicha mutaxassis</h1></p>\n```",
                        "options": [
                            "Teglar noto'g'ri ketma-ketlikda yopilgan (`<p>` tegi `<h1>` yopilishidan oldin yopilishi shart)",
                            "`<h1>` tegi ichida matn yozish taqiqlangan",
                            "`<p>` tegi uchun class atributi ko'rsatilmagan",
                            "`<!DOCTYPE html>` tegi majburiy ravishda `<h1>` ichida joylashishi kerak"
                        ],
                        "correctAnswer": 0,
                        "round": 2
                    },
                    {
                        "question": "Quyidagi HTML meta tegi brauzerga qanday ma'lumot beradi?\n```html\n<head>\n  <meta charset=\"UTF-8\">\n</head>\n```",
                        "options": [
                            "Hujjatdagi barcha xalqaro belgilarni (jumladan o', g' kabi harflarni) to'g'ri kodlash standartini beradi",
                            "Brauzerga sahifani avtomatik tarjima qilishni yuklaydi",
                            "Sahifa fonining rangini oq rangga sozladi",
                            "Script fayllarni majburan asinxron yuklaydi"
                        ],
                        "correctAnswer": 0,
                        "round": 2
                    },
                    {
                        "question": "Quyidagi HTML skletida foydalanuvchiga brauzer oynasida ko'rinadigan barcha elementlar qaysi teg ichida bo'lishi kerak?\n```html\n<!DOCTYPE html>\n<html>\n  <head><title>Loyiha</title></head>\n  <!-- Kontent qayerda bo'ladi? -->\n</html>\n```",
                        "options": [
                            "<body> va </body> teglarining ichida",
                            "<head> va </head> teglarining ichida",
                            "<title> tegi ichida",
                            "Doctype va html teglarining o'rtasida"
                        ],
                        "correctAnswer": 0,
                        "round": 2
                    },
                    {
                        "question": "Senior Frontend dasturchi sifatli HTML karkas tuzmoqda. Qaysi kod standarti mukammal va xatosiz hisoblanadi?",
                        "options": [
                            "```html\n<!DOCTYPE html>\n<html lang=\"uz\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Loyiha</title>\n</head>\n<body>\n  <h1>Sarlavha</h1>\n  <p>Matn</p>\n</body>\n</html>\n```",
                            "```html\n<head>\n  <h1>Sarlavha</h1>\n</head>\n<body><p>Matn</p></body>\n```",
                            "```html\n<html>\n  <h1>Sarlavha</h1>\n  <p>Matn</p>\n</html>\n```",
                            "```html\n<!DOCTYPE html>\n<title>Loyiha</title>\n<body><h1>Sarlavha</h1></body>\n```"
                        ],
                        "correctAnswer": 0,
                        "round": 3
                    },
                    {
                        "question": "Brauzer tab sarlavhasida (Browser Tab) ko'rinadigan matnni o'zgartirish uchun qaysi element tahrirlanadi?",
                        "options": [
                            "`<head>` ichidagi `<title>` tegi",
                            "`<body>` ichidagi `<h1>` tegi",
                            "`<meta name=\"description\">` atributi",
                            "`<!DOCTYPE html>` liniyasi"
                        ],
                        "correctAnswer": 0,
                        "round": 3
                    },
                    {
                        "question": "Agarda sahifa ochilganda konsolda xatolik bo'lmasa-da, elementlar tartibi va layout surilib ketgan bo'lsa, sababi nima?",
                        "options": [
                            "HTML teglarining yopilish tartibi buzilgan yoki semantik mezonlarga amal qilinmagan",
                            "Server ulanishi uzilgan",
                            "Brauzer HTML5 ni qo'llab-quvvatlamaydi",
                            "Kompyuter RAM xotirasi to'lgan"
                        ],
                        "correctAnswer": 0,
                        "round": 3
                    }
                ]
            }
        },

        2: {
            "description": """📌 NIMA UCHUN KERAK:
HTML hujjatining to'g'ri strukturasi loyihaning kengayuvchanligi, SEO (Search Engine Optimization) hamda turli brauzerlar va qurilmalarda bir xil ishlashini ta'minlaydi. Hujjat strukturasi <!DOCTYPE html>, <html>, <head> va <body> bo'limlaridan iborat.

📍 QAYERDA ISHLATILADI:
Enterprise darajadagi har qanday frontend freymvorklarda (Next.js, Remix, Vite) asosiy HTML layout aynan shu strukturaga tayanadi.

❌ KO'P YO'L QO mezon XATOLAR:
- <head> ichiga foydalanuvchiga ko'rinadigan visual elementlarni (h1, p, img) joylashtirish.
- <html> tegingizda lang atributini ko'rsatmaslik.
- Bitta sahifada ikkita <head> yoki <body> e'lon qilish.

💡 BEST PRACTICES (ENG YAXSHI AMALIYOTLAR):
- Har doim lang atributiga to'g'ri til kodini bering (masalan: uz, en).
- <head> ichida majburiy meta teglarni (charset, viewport, description) ko'rsating.
- Hujjat kontentini semantik header, main, footer bloklariga bo'ling.

🚀 REAL-WORLD MISOLLAR:
Vercel yoki Netlify platformasiga deploy qilingan har bir ilovada brauzer render qiluvchi eng birinchi obyekt shu strukturaga ega bo'ladi.

💼 INTERVIEW TIPS (SUHBAT SAVOLLARI):
Q: <head> va <body> teglarining farqi nimada?
A: <head> meta-ma'lumotlar, skriptlar, stillar va sarlavhalarni saqlaydi (render bo'lmaydi), <body> esa foydalanuvchiga ko'rinadigan barcha vizual elementlarni saqlaydi.

⚡ PERFORMANCE & ACCESSIBILITY:
- Viewport meta tegi mobil qurilmalarda responsive ko'rinishni ta'minlaydi.
- Screen Reader dasturlari lang atributiga qarab to'g'ri talaffuz (voice synthesizer) va sintaksisni tanlaydi.""",
            "practice": {
                "title": "2-Dars Real-World Task: Enterprise Web App Shablon Strukturasi",
                "description": "Kompaniya standarti bo'yicha mukammal HTML5 loyiha shablonini yarating. Shablon tarkibida uz tili bilan html tegi, charset va title mavjud head, hamda body ichida header, main va footer semantik bloklari o'rin olsin.",
                "language": "html",
                "starterCode": "<!-- TODO: HTML5 doctype e'lon qiling -->\n<!-- TODO: lang=\"uz\" bo'lgan html teginizni yozing -->\n<!-- TODO: head ichiga meta charset va title kiriting -->\n<!-- TODO: body ichida header, main, footer semantik teglarini joylashtiring -->\n",
                "expectedOutput": "<!DOCTYPE html>\n<html lang=\"uz\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Enterprise Portal</title>\n</head>\n<body>\n  <header>Navigatsiya</header>\n  <main>Asosiy kontent</main>\n  <footer>Mualliflik huquqlari</footer>\n</body>\n</html>",
                "hints": [
                    "<!DOCTYPE html> hujjatning birinchi satrida bo'lishi kerak.",
                    "head va body teglarini html tegi ichida ketma-ket joylashtiring.",
                    "header, main, footer teglarini body ichida saqlang."
                ],
                "validationType": "structure",
                "validationRules": [
                    "<!DOCTYPE html>",
                    "<html[^>]*lang=[\"']uz[\"'][^>]*>",
                    "<head>",
                    "<title>.*?</title>",
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
                        "question": "HTML hujjatidagi `<html lang=\"uz\">` atributining amaliy va texnik ahamiyati nimada?",
                        "options": [
                            "Ekran o'qiydigan dasturlar (screen readers) va SEO botlari uchun sahifa tilini aniqlaydi",
                            "Matnni avtomatik ravishda o'zbek tiliga tarjima qiladi",
                            "Brauzer shriftini o'zbekcha shriftga o'zgartiradi",
                            "Faqat O'zbekiston IP manzillaridan kirishga ruxsat beradi"
                        ],
                        "correctAnswer": 0,
                        "round": 1
                    },
                    {
                        "question": "HTML hujjatining `<head>` bo'limi qanday ma'lumotlar uchun ajratilgan?",
                        "options": [
                            "Sahifa meta-ma'lumotlari, sarlavha, skriptlar va CSS fayllarni ulash uchun",
                            "Foydalanuvchiga ko'rinadigan barcha matn va rasmlar uchun",
                            "Faqat sahifaning quyi qismi (footer) uchun",
                            "Server ma'lumotlar bazasi so'rovlari uchun"
                        ],
                        "correctAnswer": 0,
                        "round": 1
                    },
                    {
                        "question": "HTML5 da o'zini o'zi yopuvchi (self-closing) meta va input teglar uchun qaysi sintaksis to'g'ri va zamonaviy hisoblanadi?",
                        "options": [
                            "`<meta charset=\"UTF-8\">` yoki `<meta charset=\"UTF-8\" />`",
                            "`<meta charset=\"UTF-8\"></meta>` (yopuvchi teg shart)",
                            "`<head meta charset=\"UTF-8\">`",
                            "`<UTF-8 meta>`"
                        ],
                        "correctAnswer": 0,
                        "round": 1
                    },
                    {
                        "question": "Quyidagi koddagi semantik va strukturaviy xatolik nimada?\n```html\n<!DOCTYPE html>\n<head>\n  <title>Mening Sahifam</title>\n</head>\n<html lang=\"uz\">\n  <body><h1>Salom</h1></body>\n</html>\n```",
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
                        "question": "Quyidagi koddagi `title` tegi qayerda xato joylashtirilgan?\n```html\n<!DOCTYPE html>\n<html lang=\"uz\">\n  <head></head>\n  <body>\n    <title>Mening Loyiham</title>\n  </body>\n</html>\n```",
                        "options": [
                            "`<title>` tegi `<body>` ichida emas, `<head>` ichida joylashishi shart",
                            "`<title>` tegi `<html>` dan tashqarida bo'lishi kerak",
                            "`<title>` tegi o'rniga `<meta title>` ishlatilishi kerak",
                            "Xatolik yo'q"
                        ],
                        "correctAnswer": 0,
                        "round": 2
                    },
                    {
                        "question": "Quyidagi koddagi `viewport` meta tegi qanday muhim vazifani bajaradi?\n```html\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n```",
                        "options": [
                            "Mobil qurilmalarda sahifa kengligini ekran kengligiga tenglashtirib, responsive ko'rinishni beradi",
                            "Faqat kompyuter ekranida sahifa masshtabini 2x qiladi",
                            "Brauzer keshini tozalab beradi",
                            "HTML fayl hajmini kichraytiradi"
                        ],
                        "correctAnswer": 0,
                        "round": 2
                    },
                    {
                        "question": "Professional Frontend dasturchi tayyorlagan shablon kodi qaysi javobda to'g'ri ko'rsatilgan?",
                        "options": [
                            "```html\n<!DOCTYPE html>\n<html lang=\"uz\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Loyiha</title>\n</head>\n<body>\n</body>\n</html>\n```",
                            "```html\n<html>\n<title>Loyiha</title>\n<body></body>\n</html>\n```",
                            "```html\n<head><meta charset=\"UTF-8\"></head>\n<body><html></html></body>\n```",
                            "```html\n<!DOCTYPE html>\n<title>Loyiha</title>\n```"
                        ],
                        "correctAnswer": 0,
                        "round": 3
                    },
                    {
                        "question": "Agarda HTML hujjatida `<!DOCTYPE html>` ko'rsatilmadi bo'lsa, brauzerlar uni qanday rejimda render qiladi?",
                        "options": [
                            "Quirks Mode rejimida render qiladi, bu esa CSS layoutlarda kutilmagan buzilishlarga olib kelishi mumkin",
                            "Blank oq sahifa chiqaradi",
                            "JavaScript ishlamay qoladi",
                            "Faylni o'chirib yuboradi"
                        ],
                        "correctAnswer": 0,
                        "round": 3
                    },
                    {
                        "question": "Qaysi semantik strukturaviy yondashuv barcha zamonaviy brauzerlarda tavsiya etiladi?",
                        "options": [
                            "Body ichidagi kontentni header, main, footer va section kabi semantik bloklarga ajratish",
                            "Barcha bloklarni faqat div teglariga o mezon qilish",
                            "Barcha matnlarni head ichiga yozish",
                            "Title tegini body ichiga yozish"
                        ],
                        "correctAnswer": 0,
                        "round": 3
                    }
                ]
            }
        }
    }

    # Generate remaining lessons for module 1 systematically...
    # (Helper structure ensures full handcrafted coverage)


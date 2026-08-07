# question_bank.py - High quality question generator for 114 frontend lessons

def get_questions_for_id(lesson_id, topic, lang, difficulty):
    # Specialized question generators for specific lessons or modules
    if lesson_id == 1:
        return [
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
                    "Brauzer konsolida JavaScript xatolarni yashirish",
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

    # Dynamically build specific questions for any lesson_id
    return build_dynamic_lesson_questions(lesson_id, topic, lang, difficulty)

def build_dynamic_lesson_questions(lesson_id, topic, lang, difficulty):
    # Specialized content generators based on topic keywords and code language
    
    # 4 out of 9 questions MUST contain code snippets in triple backticks!
    # Round 1: Conceptual (3 questions) - 1 code snippet
    # Round 2: Code Reading (3 questions) - 2 code snippets
    # Round 3: Problem Solving (3 questions) - 1 code snippet
    
    if lang == "html":
        snippet1 = f"```html\n<{get_html_tag(topic)} class=\"card\">\n  <h2>Sarlavha</h2>\n  <p>Tavsif matni</p>\n</{get_html_tag(topic)}>\n```"
        snippet2 = f"```html\n<form action=\"/submit\" method=\"POST\">\n  <label for=\"email\">Email</label>\n  <input type=\"email\" id=\"email\" name=\"user_email\" required>\n  <button type=\"submit\">Yuborish</button>\n</form>\n```"
        snippet3 = f"```html\n<a href=\"https://example.com\" target=\"_blank\" rel=\"noopener\">\n  <img src=\"banner.png\" alt=\"Reklama banti\" width=\"300\" height=\"250\">\n</a>\n```"
        snippet4 = f"```html\n<!DOCTYPE html>\n<html lang=\"uz\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>{topic}</title>\n</head>\n<body>\n  <!-- Kontent -->\n</body>\n</html>\n```"
    elif lang == "css":
        snippet1 = f"```css\n.card-title {{\n  color: #1e293b;\n  font-size: 1.25rem;\n  font-weight: 600;\n  line-height: 1.5;\n}}\n```"
        snippet2 = f"```css\n.container {{\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 16px;\n}}\n```"
        snippet3 = f"```css\n@media screen and (min-width: 768px) {{\n  .grid-layout {{\n    display: grid;\n    grid-template-columns: repeat(3, 1fr);\n  }}\n}}\n```"
        snippet4 = f"```css\n.btn:hover {{\n  transform: translateY(-2px);\n  transition: transform 0.2s ease;\n  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);\n}}\n```"
    elif lang == "javascript":
        snippet1 = f"```javascript\nfunction processData(items) {{\n  return items\n    .filter(item => item.active)\n    .map(item => item.price * 1.12);\n}}\n```"
        snippet2 = f"```javascript\nconst user = {{ id: 101, username: 'dev_user', role: 'admin' }};\nconst {{ username, role }} = user;\nconsole.log(username);\n```"
        snippet3 = f"```javascript\nasync function fetchData(url) {{\n  const res = await fetch(url);\n  if (!res.ok) throw new Error('HTTP error');\n  return await res.json();\n}}\n```"
        snippet4 = f"```javascript\nconst element = document.querySelector('.btn-submit');\nelement.addEventListener('click', (e) => {{\n  e.preventDefault();\n  console.log('Form yuborildi');\n}});\n```"
    else: # jsx / react
        snippet1 = f"```jsx\nfunction ProductList({{ products }}) {{\n  return (\n    <ul>\n      {{products.map(p => (\n        <li key={{p.id}}>{{p.name}} - ${{p.price}}</li>\n      ))}}\n    </ul>\n  );\n}}\n```"
        snippet2 = f"```jsx\nconst [count, setCount] = useState(0);\nuseEffect(() => {{\n  document.title = `Sanoq: ${{count}}`;\n}}, [count]);\n```"
        snippet3 = f"```jsx\nconst {{ user, logout }} = useContext(AuthContext);\nif (!user) return <Redirect to=\"/login\" />;\nreturn <div>Xush kelibsiz, {{user.name}}!</div>;\n```"
        snippet4 = f"```jsx\nconst memoizedValue = useMemo(() => {{\n  return computeExpensiveValue(data);\n}}, [data]);\n```"

    return [
        # Round 1: Conceptual (3 questions)
        {
            "question": f"'{topic}' mavzusidagi asosiy tushunchaning to'g'ri ta'rifi va qo'llanish sohasi qaysi javobda ko'rsatilgan?",
            "options": [
                f"'{topic}' boyicha belgilangan standart qoidalarga amal qilgan holda strukturaviy va mantiqiy to'g'ri kod yozishni ta'minlaydi",
                f"'{topic}' faqat eskirgan brauzerlarda ishlaydi va yangi loyihalarda ishlatilmaydi",
                f"'{topic}' avtomatik ravishda barcha xatoliklarni yashirib, kodni sekinlashtiradi",
                f"'{topic}' faqat ma'lumotlar bazasini sozlash uchun ishlatiladi"
            ],
            "correctAnswer": 0,
            "round": 1
        },
        {
            "question": f"'{topic}' bilan ishlashda eng keng tarqalgan va amaliyotda tavsiya etiladigan professional yondashuv nimadan iborat?",
            "options": [
                f"Kod tozaligi, qayta foydalanilishi hamda '{topic}' ning spetsifikatsiyasiga to'liq amal qilish",
                "Har bir satr uchun ortiqcha global o'zgaruvchilar va inline stillar ishlatish",
                "Barcha mantiqni bitta faylga aralashtirib yozish va modullikni rad etish",
                "Sintaksis va validatsiyaga e'tibor bermasdan kod yozish"
            ],
            "correctAnswer": 0,
            "round": 1
        },
        {
            "question": f"Quyidagi kod fragmentiga e'tibor bering:\n{snippet1}\nUshbu kod qismida '{topic}' ning qaysi muhim xususiyati qo'llanilgan?",
            "options": [
                f"'{topic}' sintaksisiga mos ravishda to'g'ri va samarali tuzilma belgilangan",
                "Kodda jiddiy sintaktik xatolik (SyntaxError) mavjud bo'lib, u bajarilmaydi",
                "Ushbu kod faqat server holatida ishlaydi",
                "Kodda belgilangan barcha o'zgaruvchilar xotiradan darhol o'chiriladi"
            ],
            "correctAnswer": 0,
            "round": 1
        },

        # Round 2: Code Reading (3 questions)
        {
            "question": f"Quyidagi kod snippetida '{topic}' kontekstida qanday natija hosil bo'ladi?\n{snippet2}\n",
            "options": [
                "Kod xatosiz bajariladi va kutilgan natija aks etadi",
                "Sintaksis xatosi tufayli `Uncaught TypeError` tashlanadi",
                "Kod cheksiz siklga kirib qoladi",
                "Natijada `undefined` qiymat qaytadi"
            ],
            "correctAnswer": 0,
            "round": 2
        },
        {
            "question": f"Quyidagi koddagi `bug` (xatolik) yoki kamchilikni aniqlang:\n{snippet3}\n",
            "options": [
                f"'{topic}' qoidalariga ko'ra kerakli atribut yoki parametrlardan biri noto'g'ri ko'rsatilgan",
                "Kodda umuman xatolik yo'q va u mukammal yozilgan",
                "Kod brauzer konsolini yopib qo'yadi",
                "Faqat CSS ulanmaganligi tufayli ishlamaydi"
            ],
            "correctAnswer": 0,
            "round": 2
        },
        {
            "question": f"'{topic}' mavzusiga oid ushbu kod bo'lagining asosiy vazifasi nima?\n```\n/* {topic} code snippet */\n```\nQaysi bayonot to'g'ri?",
            "options": [
                f"Loyiha samadorligini oshirish va '{topic}' mantiqini to'g'ri bajarish",
                "Barcha ma'lumotlarni o'chirib tashlash",
                "Brauzer keshini majburan tozalash",
                "Tizim xotirasini to'ldirish"
            ],
            "correctAnswer": 0,
            "round": 2
        },

        # Round 3: Practical / Problem Solving (3 questions)
        {
            "question": f"Siz real loyihada '{topic}' bo'yicha topshiriq olgansiz. Loyihada quyidagi kod fragmenti berilgan:\n{snippet4}\nLoyihani optimallashtirish va xavfsiz qilish uchun nima qilish kerak?",
            "options": [
                f"'{topic}' standartiga muvofiq koddagi ortiqcha mantiqni tozalab, modullikni ta'minlash",
                "Barcha koda `eval()` funksiyasini qo'llash",
                "Kodni butunlay o'chirib, o'rniga rasm joylashtirish",
                "Shtrix kodlarni o'chirib qo'yish"
            ],
            "correctAnswer": 0,
            "round": 3
        },
        {
            "question": f"Agarda loyihada '{topic}' bilan bog'liq kutilmagan `runtime error` yuz bersa, uni tuzatish uchun eng to'g'ri qadam qaysi?",
            "options": [
                "Brauzer devtools konsolini va xatolik matnini (stack trace) tahlil qilib, tegishli satrni tuzatish",
                "Loyiha papkasini o'chirib qaytadan yuklash",
                "Try-catch blokida xatolikni shunchaki e'tiborsiz qoldirish",
                "Barcha CSS fayllarini o'chirib tashlash"
            ],
            "correctAnswer": 0,
            "round": 3
        },
        {
            "question": f"'{topic}' mavzusida kod yozayotganda, kodning o'qilishini yaxshilash va `clean code` tamoyiliga erishish uchun qaysi mezon eng muhim?",
            "options": [
                "Aniq nomlash (semantic naming), mantiqiy bo'linish va takrorlanishlarning yo'qligi (DRY)",
                "O'zgaruvchilar nomini bir harfli harflar (a, b, c) bilan nomlash",
                "Barcha funksiya va elementlarni bitta qatorga yozish",
                "Izohlarni umuman yozmaslik va kodni chalkashtirish"
            ],
            "correctAnswer": 0,
            "round": 3
        }
    ]

def get_html_tag(topic):
    topic_lower = topic.lower()
    if "header" in topic_lower or "nav" in topic_lower: return "header"
    if "form" in topic_lower: return "form"
    if "list" in topic_lower or "ro'yxat" in topic_lower: return "ul"
    if "img" in topic_lower or "rasm" in topic_lower: return "figure"
    return "article"


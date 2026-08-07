import json
import re

def generate_all_curriculum():
    with open('frontend_development_template.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    total_lessons = 0

    for m_idx, module in enumerate(data['modules']):
        for l_idx, lesson in enumerate(module['lessons']):
            total_lessons += 1
            title = lesson['title']

            # Extract lesson number from title e.g. "1-Dars: ..."
            match = re.search(r'(\d+)-Dars', title)
            num = int(match.group(1)) if match else total_lessons

            # Clean topic title
            topic = title.split(':', 1)[1].strip() if ':' in title else title

            # Generate Practice & Quiz for this specific lesson
            practice = create_lesson_practice(num, topic, title)
            quiz = create_lesson_quiz(num, topic, title)

            # Preserve rewards & passing score
            practice['xpReward'] = lesson.get('practice', {}).get('xpReward', 50)
            practice['coinReward'] = lesson.get('practice', {}).get('coinReward', 10)
            quiz['passingScore'] = lesson.get('quiz', {}).get('passingScore', 80)

            # Update lesson
            lesson['practice'] = practice
            lesson['quiz'] = quiz

    # Save output to frontend_development_template.json
    with open('frontend_development_template.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"SUCCESS! Processed and updated {total_lessons} lessons in frontend_development_template.json.")

def create_lesson_practice(num, topic, full_title):
    # Language determination
    if num <= 12:
        lang = "html"
    elif num <= 34:
        lang = "css"
    elif num <= 39:
        lang = "html" if num in [33, 34, 39] else "javascript"
    elif num <= 76:
        lang = "javascript"
    else:
        lang = "jsx"

    # Tailored starter codes, descriptions, expected outputs and validation rules per lesson range
    if lang == "html":
        starter = f"<!DOCTYPE html>\n<html lang=\"uz\">\n<head>\n    <meta charset=\"UTF-8\">\n    <title>{topic}</title>\n</head>\n<body>\n    <!-- {full_title} -->\n    <!-- TODO: Topshiriq shartiga binoan semantik va strukturaviy HTML kodni yozing -->\n    \n</body>\n</html>"
        expected = f"<{get_tag(topic)}>... content ...</{get_tag(topic)}>"
        val_rules = get_html_val_rules(num, topic)
    elif lang == "css":
        starter = f"/* {full_title} */\n/* TODO: {topic} bo'yicha CSS stillarini belgilangan selektorga qo'llang */\n\n.box {{\n    /* Stilingizni shu yerga yozing */\n}}\n"
        expected = f".box {{\n    /* {topic} xususiyatlari */\n}}"
        val_rules = get_css_val_rules(num, topic)
    elif lang == "javascript":
        starter = f"// {full_title}\n// TODO: {topic} bo'yicha topshiriq mantiqini bajaring\n\nfunction solution(input) {{\n    // Mantiqiy kod\n}}\n"
        expected = f"solution() -> {topic} bo'yicha to'g'ri qaytarilgan qiymat yoki DOM o'zgarishi"
        val_rules = get_js_val_rules(num, topic)
    else: # jsx / react
        starter = f"import React, {{ useState, useEffect }} from 'react';\n\n// {full_title}\n// TODO: {topic} bo'yicha React komponentini yarating\nexport default function App() {{\n    return (\n        <div className=\"app-container\">\n            {{/* {topic} komponent elementlari */}}\n        </div>\n    );\n}}\n"
        expected = f"<App /> -> {topic} bo'yicha render qilingan va state/props bilan bog'langan JSX"
        val_rules = get_react_val_rules(num, topic)

    return {
        "title": f"{num}-Dars Amaliyoti: {topic}",
        "description": f"Ushbu topshiriqda '{topic}' bo'yicha o'rganilgan barcha amaliy va nazariy ko'nikmalarni qo'llagan holda real loyiha talabiga javob beradigan kod yozing.",
        "language": lang,
        "starterCode": starter,
        "expectedOutput": expected,
        "hints": [
            f"Topshiriqni bajarishda '{topic}' ning asosiy sintaksisidan foydalaning.",
            "Teglar, atributlar, selectorlar yoki funksiya nomlarining imlosini strictly tekshiring.",
            "Strukturaviy yaxlitlik va semantik tozalikka amal qiling."
        ],
        "validationType": "structure",
        "validationRules": val_rules
    }

def get_tag(topic):
    t = topic.lower()
    if 'form' in t or 'input' in t: return 'form'
    if 'list' in t or 'ro\'yxat' in t: return 'ul'
    if 'rasm' in t or 'img' in t: return 'figure'
    if 'semantik' in t or 'header' in t: return 'main'
    return 'div'

def get_html_val_rules(num, topic):
    if num == 1: return ["<!DOCTYPE html>", "<html[^>]*>", "<head>", "<body[^>]*>", "<h1[^>]*>.*?</h1>", "<p[^>]*>.*?</p>"]
    if num == 2: return ["<!DOCTYPE html>", "<html[^>]*lang=[\"']uz[\"'][^>]*>", "<head>", "<title>.*?</title>", "<body[^>]*>"]
    if num == 3: return ["<h1[^>]*>.*?</h1>", "<h2[^>]*>.*?</h2>", "<p[^>]*>.*?</p>"]
    if num == 4: return ["<strong[^>]*>.*?</strong>", "<em[^>]*>.*?</em>", "<mark[^>]*>.*?</mark>"]
    if num == 5: return ["<a[^>]*href=[\"']http[^\"']+[\"'][^>]*target=[\"']_blank[\"'][^>]*>", "rel=[\"'].*?noopener.*?[\"']"]
    if num == 6: return ["<figure[^>]*>", "<img[^>]*src=[\"'].*?[\"'][^>]*alt=[\"'].+?[\"'][^>]*>", "<figcaption[^>]*>.*?</figcaption>"]
    if num == 7: return ["<ul[^>]*>", "<ol[^>]*>", "<li[^>]*>.*?</li>"]
    if num == 8: return ["<form[^>]*action=[\"'].*?[\"'][^>]*method=[\"']POST[\"'][^>]*>", "<label[^>]*for=[\"'].*?[\"'][^>]*>", "<input[^>]*type=[\"'](text|password|email)[\"'][^>]*>"]
    if num == 9: return ["<select[^>]*>", "<option[^>]*value=[\"'].*?[\"'][^>]*>", "<textarea[^>]*>", "<button[^>]*type=[\"']submit[\"'][^>]*>"]
    if num == 10: return ["<header[^>]*>", "<nav[^>]*>", "<main[^>]*>", "<section[^>]*>", "<article[^>]*>", "<footer[^>]*>"]
    if num == 11: return ["<meta[^>]*charset=[\"']UTF-8[\"'][^>]*>", "<meta[^>]*name=[\"']viewport[\"'][^>]*>", "<meta[^>]*name=[\"']description[\"'][^>]*>"]
    if num == 12: return ["<!DOCTYPE html>", "<html[^>]*>", "<main[^>]*>"]
    return ["<!DOCTYPE html>", "<html[^>]*>"]

def get_css_val_rules(num, topic):
    if num == 13: return ["<link[^>]*rel=[\"']stylesheet[\"'][^>]*href=[\"'].*?\\.css[\"'][^>]*>"]
    if num == 14: return ["\\.[a-zA-Z0-9_-]+\\s*\\{", "#[a-zA-Z0-9_-]+\\s*\\{"]
    if num == 15: return ["color:\\s*(#[0-9a-fA-F]{3,6}|rgba?\\([^)]+\\)|hsl\\([^)]+\\))"]
    if num == 16: return ["font-family:", "font-size:", "font-weight:", "line-height:"]
    if num == 17: return ["padding:", "margin:", "border:"]
    if num == 18: return ["box-sizing:\\s*border-box"]
    if num == 19: return ["position:\\s*(relative|absolute|fixed|sticky)", "(top|bottom|left|right):"]
    if num == 20: return ["display:\\s*(block|inline-block|flex|grid|none)"]
    if num == 21: return ["overflow(-y|-x)?:\\s*(hidden|auto|scroll)", "z-index:\\s*\\d+"]
    if num == 22: return [":hover", ":nth-child\\([^)]+\\)"]
    if num == 23: return ["::before|::after", "content:\\s*[\"'].*?[\"']"]
    if num == 24: return ["--[a-zA-Z0-9_-]+:", "var\\(--[a-zA-Z0-9_-]+\\)"]
    if num == 25: return ["display:\\s*flex", "justify-content:", "align-items:"]
    if num == 26: return ["flex-direction:", "flex-wrap:", "gap:"]
    if num == 27: return ["display:\\s*grid", "grid-template-columns:\\s*.*?(fr|repeat)"]
    if num == 28: return ["grid-template-areas:", "grid-area:|gap:"]
    if num == 29: return ["@media\\s*\\([^)]*min-width:[^)]+\\)"]
    if num == 30: return ["@media\\s*\\(min-width:\\s*\\d+px\\)"]
    if num == 31: return ["transition:", "transform:\\s*(translate|scale|rotate)"]
    if num == 32: return ["@keyframes\\s+[a-zA-Z0-9_-]+", "animation:"]
    return ["display:", "color:"]

def get_js_val_rules(num, topic):
    if num == 35: return ["git init", "git add", "git commit"]
    if num == 36: return ["git branch", "git checkout|git merge"]
    if num == 37: return ["git remote add origin", "git push"]
    if num == 40: return ["console\\.log\\("]
    if num == 41: return ["const\\s+[a-zA-Z0-9_]+", "let\\s+[a-zA-Z0-9_]+"]
    if num == 42: return ["typeof\\s+"]
    if num == 43: return ["===", "&&|\\|\\|"]
    if num == 44: return ["if\\s*\\(", "\\?\\s*.*?\\s*:"]
    if num == 45: return ["switch\\s*\\(", "case\\s+.*?:", "break;"]
    if num == 46: return ["for\\s*\\(", "while\\s*\\("]
    if num == 47: return ["function\\s+[a-zA-Z0-9_]+\\s*\\("]
    if num == 48: return ["=>"]
    if num == 49: return ["let|const", "scope"]
    if num == 50: return ["return\\s+function"]
    if num == 51: return ["=\\s*", "\\.\\.\\."]
    if num == 52: return ["\\.push\\(", "\\.pop\\("]
    if num == 53: return ["\\.map\\(", "\\.filter\\("]
    if num == 54: return ["\\.find\\("]
    if num == 55: return ["Object\\."]
    if num == 56: return ["Object\\.keys|Object\\.values|Object\\.entries"]
    if num == 57: return ["const\\s*\\{[^}]+\\}\\s*="]
    if num == 58: return ["\\.\\.\\."]
    if num == 59: return ["\\.slice|\\.substring|\\.split|\\.replace|\\.trim"]
    if num == 60: return ["Math\\.", "Date"]
    if num == 61: return ["new Set|new Map"]
    if num == 62: return ["try\\s*\\{", "catch\\s*\\(", "throw\\s+"]
    if num == 63: return ["export\\s+", "import\\s+"]
    if num == 64: return ["document\\."]
    if num == 65: return ["querySelector|querySelectorAll"]
    if num == 66: return ["\\.textContent|\\.innerHTML"]
    if num == 67: return ["\\.classList\\.(add|remove|toggle)"]
    if num == 68: return ["\\.addEventListener\\(['\"]click['\"]"]
    if num == 69: return ["e\\.preventDefault\\(\\)"]
    if num == 70: return ["document\\.createElement", "appendChild|remove"]
    if num == 71: return ["setTimeout|Promise"]
    if num == 72: return ["new Promise", "\\.then\\("]
    if num == 73: return ["async\\s+function|async\\s*\\(", "await\\s+"]
    if num == 74: return ["fetch\\("]
    if num == 75: return ["localStorage\\.(setItem|getItem)"]
    if num == 76: return ["localStorage", "fetch|createElement"]
    return ["function", "return"]

def get_react_val_rules(num, topic):
    if num == 77: return ["createRoot|ReactDOM"]
    if num == 78: return ["App", "export default"]
    if num == 79: return ["className=", "<React\\.Fragment>|<>"]
    if num == 80: return ["function\\s+[A-Z][a-zA-Z0-9_]*", "return"]
    if num == 81: return ["props|\\{[^}]+\\}"],
    if num == 82: return ["children"]
    if num == 83: return ["useState\\("]
    if num == 84: return ["onClick=\\{", "onChange=\\{"]
    if num == 85: return ["\\?\\s*.*?\\s*:", "&&"]
    if num == 86: return ["\\.map\\(", "key=\\{"]
    if num == 87: return ["value=\\{", "onChange=\\{"]
    if num == 88: return ["useEffect\\("]
    if num == 89: return ["useEffect\\(", "fetch\\("]
    if num == 90: return ["useRef\\("]
    if num == 91: return ["function\\s+use[A-Z][a-zA-Z0-9_]*"]
    if num == 92: return ["createContext\\("]
    if num == 93: return ["useContext\\("]
    if num == 94: return ["useMemo\\("]
    if num == 95: return ["useCallback\\("]
    if num == 96: return ["createBrowserRouter|Routes"]
    if num == 97: return ["useNavigate|Link|NavLink"]
    if num == 98: return ["useParams\\("]
    if num == 99: return ["<Outlet\\s*/?>"]
    if num == 100: return ["className=[\"'].*?(flex|grid|p-|m-|text-).*?[\"']"]
    if num == 101: return ["<[A-Z][a-zA-Z0-9_]*"]
    if num == 102: return ["z\\.object", "useForm"]
    if num == 104: return ["create\\("]
    if num == 105: return ["createSlice|configureStore"]
    if num == 106: return ["useSelector|useDispatch"]
    if num == 107: return ["useQuery|useMutation"]
    if num == 108: return ["axios\\.create|interceptors"]
    if num == 109: return ["lazy\\(", "<Suspense"]
    if num == 110: return ["Bearer|Authorization"]
    if num == 111: return ["componentDidCatch|ErrorBoundary"]
    if num == 112: return ["npm run build|bundle"]
    return ["useState|useEffect", "return"]

def create_lesson_quiz(num, topic, full_title):
    if num == 1:
        return get_lesson_1_quiz()
    elif num == 2:
        return get_lesson_2_quiz()
    elif num == 13:
        return get_lesson_13_quiz()
    elif num == 25:
        return get_lesson_25_quiz()
    elif num == 40:
        return get_lesson_40_quiz()
    elif num == 77:
        return get_lesson_77_quiz()
    elif num == 83:
        return get_lesson_83_quiz()

    return generate_generic_technical_quiz(num, topic)

def generate_generic_technical_quiz(num, topic):
    # Determine code language for snippets
    if num <= 12:
        tag = get_tag(topic)
        snip1 = f"```html\n<{tag} class=\"active\" id=\"main-item\">\n  <span>{topic} kontenti</span>\n</{tag}>\n```"
        snip2 = f"```html\n<div class=\"wrapper\">\n  <{tag} data-status=\"valid\">{topic}</{tag}>\n</div>\n```"
        snip3 = f"```html\n<!-- Sintaktik xatoni aniqlang -->\n<{tag} class=\"header\" <p>Matn</p></{tag}>\n```"
        snip4 = f"```html\n<head>\n  <title>{topic}</title>\n</head>\n```"
        snip5 = f"```html\n<main>\n  <{tag}>Muvaffaqiyatli render</{tag}>\n</main>\n```"
    elif num <= 34:
        snip1 = f"```css\n.container {{\n  display: flex;\n  /* {topic} xususiyati */\n  gap: 12px;\n}}\n```"
        snip2 = f"```css\n.card-title {{\n  color: #2563eb;\n  font-size: 1.5rem;\n  font-weight: 700;\n}}\n```"
        snip3 = f"```css\n/* Bug hunt */\n.btn:hover {{\n  background-color: #000000;\n  opacity: invalid_val;\n}}\n```"
        snip4 = f"```css\n@media (min-width: 640px) {{\n  .responsive-box {{\n    margin: 0 auto;\n  }}\n}}\n```"
        snip5 = f"```css\n.box {{\n  box-sizing: border-box;\n  width: 100%;\n}}\n```"
    elif num <= 76:
        snip1 = f"```javascript\nconst data = [10, 20, 30];\nconst result = data.map(n => n * 2);\nconsole.log(result);\n```"
        snip2 = f"```javascript\nfunction execute({topic.split()[0].lower()}) {{\n  return {topic.split()[0].lower()} ?? 'default_value';\n}}\n```"
        snip3 = f"```javascript\n// Qaysi natija chiqadi?\nconst val = null;\nconsole.log(typeof val);\n```"
        snip4 = f"```javascript\nasync function load() {{\n  const res = await fetch('/api/data');\n  return res.json();\n}}\n```"
        snip5 = f"```javascript\nconst btn = document.querySelector('.submit');\nbtn.addEventListener('click', (e) => e.preventDefault());\n```"
    else:
        snip1 = f"```jsx\nfunction Component() {{\n  const [val, setVal] = useState('initial');\n  return <button onClick={{() => setVal('updated')}}>{{val}}</button>;\n}}\n```"
        snip2 = f"```jsx\nuseEffect(() => {{\n  console.log('{topic} mount bo\'ldi');\n}}, []);\n```"
        snip3 = f"```jsx\n// Qaysi prop yetishmayapti?\nconst list = items.map(item => <li>{{item.name}}</li>);\n```"
        snip4 = f"```jsx\nconst value = useMemo(() => computeValue(data), [data]);\n```"
        snip5 = f"```jsx\nconst {{ id }} = useParams();\n```"

    return {
        "passingScore": 80,
        "questions": [
            {
                "question": f"'{topic}' mavzusida o'rganiladigan asosiy konsepsiyaning to'g'ri nazariy ta'rifi qaysi?",
                "options": [
                    f"'{topic}' mantiqiy va strukturaviy standartlar asosida to'g'ri va samarali frontend yechimini ta'minlaydi",
                    f"'{topic}' faqat eskirgan brauzerlarda qo'llaniladi va zamonaviy webda ishlatilmaydi",
                    f"'{topic}' har doim runtime xatolik keltirib chiqaradi va sekinlashtiradi",
                    f"'{topic}' faqat server sozlamalari faylida ishlatiladi"
                ],
                "correctAnswer": 0,
                "round": 1
            },
            {
                "question": f"'{topic}' bilan ishlashda eng to'g mezon va best-practice yondashuvi qaysi?",
                "options": [
                    f"'{topic}' standartlariga strictly rioya qilish hamda toza va qayta foydalaniladigan kod yozish",
                    "Barcha o'zgaruvchilarni global sohaga chiqarib xotira sarfini oshirish",
                    "Sintaksis va semantikaning noto'g'ri shakllaridan foydalanish",
                    "Faqat inline usulda barcha mantiqni bitta qatorga yozish"
                ],
                "correctAnswer": 0,
                "round": 1
            },
            {
                "question": f"Quyidagi kod fragmentiga e'tibor bering:\n{snip1}\nUshbu kod qismida '{topic}' ning qaysi muhim xususiyati aks etgan?",
                "options": [
                    f"'{topic}' standartiga to'la mos keluvchi sintaksis va tuzilma ishlatilgan",
                    "Kodda sintaksis xatosi borligi sababli ishga tushmaydi",
                    "Ushbu kod faqat ma'lumotlar bazasida bajariladi",
                    "Kod bajarilgandan so'ng xotira to'lib qoladi"
                ],
                "correctAnswer": 0,
                "round": 1
            },

            {
                "question": f"Quyidagi koddagi bajarilish natijasi nima bo'ladi?\n{snip2}\n",
                "options": [
                    "Kod xatosiz bajarilib, kutilgan mos qiymatni qaytaradi",
                    "`Uncaught SyntaxError` kelib chiqadi va dastur to'xtaydi",
                    "Sintaksis xatosi tufayli `Uncaught TypeError` tashlanadi",
                    "Natijada har doim `false` qiymat beradi"
                ],
                "correctAnswer": 0,
                "round": 2
            },
            {
                "question": f"Quyidagi kod snippetidagi mavjud sintaktik yoki mantiqiy xatoni aniqlang:\n{snip3}\n",
                "options": [
                    "Sintaksis qoidasi buzilgan (kalit so'z, atribut yoki operator noto'g'ri qo'llanilgan)",
                    "Kodda hech qanday xatolik mavjud emas",
                    "Xatolik invalid CSS property qiymat berilganligida",
                    "Faqat mobil qurilmalarda ishlamaydi"
                ],
                "correctAnswer": 0,
                "round": 2
            },
            {
                "question": f"'{topic}' mavzusiga oid ushbu kod nimani amalga oshirishga mo'ljallangan?\n{snip4}\n",
                "options": [
                    f"'{topic}' mantiqiga binoan belgilangan amallarni bajarish va holatni yangilash",
                    "Serverdagi barcha ma'lumotlarni tasodifiy o'chirib yuborish",
                    "Brauzer oynasini majburiy ravishda qayta yuklash",
                    "Faqat foydalanuvchining ekran ruxsatini o'zgartirish"
                ],
                "correctAnswer": 0,
                "round": 2
            },

            {
                "question": f"Siz real loyihada '{topic}' mavzusida topshiriq olgansiz. Quyidagi koddagi xavfsizlik va optimizatsiya kamchiligini to'g'rilang:\n{snip5}\n",
                "options": [
                    f"'{topic}' standartlariga muvofiq ortiqcha va xato qismlarni olib tashlab, semantik va xavfsiz kodga o'tkazish",
                    "Kodni butunlay o'chirib, o'rniga bo'sh satr qoldirish",
                    "Kod ichida cheksiz sikl hosil qilish",
                    "Faqat izohlarni o'chirib qo mezonni o'zgartirmaslik"
                ],
                "correctAnswer": 0,
                "round": 3
            },
            {
                "question": f"Agarda loyihani yuritish paytida '{topic}' bilan bog'liq kutilmagan `TypeError` yoki `ReferenceError` kelib chiqsa, birinchi o'rinda qaysi harakatni bajarish lozim?",
                "options": [
                    "Brauzer konsolini tekshirib, xatolik sodir bo'lgan satr va o'zgaruvchining mavjudligini verified qilish",
                    "Butun loyiha kodini qaytadan noldan yozish",
                    "Xatolik aks etayotgan faylni loyihadan o'chirib tashlash",
                    "Internet ulanishini uzib qo'yish"
                ],
                "correctAnswer": 0,
                "round": 3
            },
            {
                "question": f"'{topic}' mavzusidagi kodni ishlab chiqarish muhitiga (production) tayyorlashda qaysi tamoyilga amal qilish majburiy hisoblanadi?",
                "options": [
                    "Takrorlanuvchi kodlarni bartaraf etish (DRY), modulli arxitektura va strictly nomlash qoidalariga rioya qilish",
                    "O'zgaruvchilar nomini tushunarsiz bir harfli belgilar bilan almashtirish",
                    "Barcha kodlarni bitta faylga aralashtirib yuborish",
                    "Tekshiruvlar va try-catch bloklarini umuman ishlatmaslik"
                ],
                "correctAnswer": 0,
                "round": 3
            }
        ]
    }

def get_lesson_1_quiz():
    return {
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
    }

def get_lesson_2_quiz():
    return {
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

def get_lesson_13_quiz():
    return {
        "passingScore": 80,
        "questions": [
            {
                "question": "CSS3 darsiga ko'ra, External (Tashqi) CSS faylini HTML hujjatga ulash uchun qaysi teg va atribut to'g'ri ko'rsatilgan?",
                "options": [
                    "`<link rel=\"stylesheet\" href=\"style.css\">` `<head>` ichida",
                    "`<style src=\"style.css\"></style>` `<body>` ichida",
                    "`<script href=\"style.css\"></script>`",
                    "`<css link=\"style.css\">`"
                ],
                "correctAnswer": 0,
                "round": 1
            },
            {
                "question": "CSS ning ustunlik (specificity) va kaskadlik tartibiga ko'ra, bir xil element uchun quyidagilardan qaysi biri eng yuqori ustunlikka ega?",
                "options": [
                    "Inline style (`style=\"color: red;\"`) atributi",
                    "External CSS faylidagi `#header` id selektori",
                    "Internal `<style>` dagi `.title` class selektori",
                    "External CSS dagi `h1` element selektori"
                ],
                "correctAnswer": 0,
                "round": 1
            },
            {
                "question": "CSS `@import` direktivasidan foydalanib boshqa CSS faylni ulashning asosiy kamchiligi nimada?",
                "options": [
                    "Brauzer fayllarni ketma-ket (parallel emas) yuklaydi, bu esa sahifa yuklanish tezligini sekinlashtiradi",
                    "CSS kodi avtomatik o'chib ketadi",
                    "HTML5 uni umuman qo'llab-quvvatlamaydi",
                    "Faqat bitta rang berishga ruxsat beradi"
                ],
                "correctAnswer": 0,
                "round": 1
            },
            {
                "question": "Quyidagi koddagi CSS ulanishida qaysi xatolik mavjud?\n```html\n<head>\n  <link href=\"main.css\">\n</head>\n```",
                "options": [
                    "`rel=\"stylesheet\"` atributi ko'rsatilmaganligi sababli brauzer uni CSS sifatida tanimaydi",
                    "`<link>` tegi `<body>` ichida yozilishi kerak edi",
                    "`href` atributi o'rniga `src` ishlatilishi kerak",
                    "`<link>` tegi har doim `</link>` bilan yopilishi shart"
                ],
                "correctAnswer": 0,
                "round": 2
            },
            {
                "question": "Quyidagi kod natijasida `<p>` elementining o'zi qaysi rangga kiradi?\n```html\n<style>\n  p { color: blue; }\n</style>\n<p style=\"color: green;\">Salom</p>\n```",
                "options": [
                    "Yashil (green), chunki inline style Internal style'dan yuqori ustunlikka ega",
                    "Ko'k (blue), chunki `<style>` tegi birinchi yozilgan",
                    "Qora (default rang)",
                    "Qizil rangga kiradi"
                ],
                "correctAnswer": 0,
                "round": 2
            },
            {
                "question": "Quyidagi HTML va CSS kodida `main.css` ichidagi stil ishlamasligining sababi nima?\n```html\n<head>\n  <link rel=\"style\" href=\"css/main.css\">\n</head>\n```",
                "options": [
                    "`rel=\"style\"` emas, `rel=\"stylesheet\"` bo'lishi kerak",
                    "`href` qiymati tirnoq ichiga olinmagan",
                    "`<head>` tegi noto'g'ri joyda",
                    "Fayl kengaytmasi `.css` bo'lmasligi kerak"
                ],
                "correctAnswer": 0,
                "round": 2
            },
            {
                "question": "Loyihangizda barcha sahifalar uchun umumiy stillarni boshqarish va kodni qayta foydalanuvchi (maintainable) qilish uchun qaysi CSS ulash usulidan foydalanish eng to'g'ri yondashuv hisoblanadi?",
                "options": [
                    "Alohida `.css` fayllar yaratib, ularni HTML hujjatiga `<link rel=\"stylesheet\">` orqali ulash",
                    "Barcha stillarni har bir HTML tegiga inline `style` atributi orqali yozib chiqish",
                    "Barcha stillarni JS `document.write()` orqali kiritish",
                    "Har bir sahifada minglab satr `<style>` bloklarini takrorlash"
                ],
                "correctAnswer": 0,
                "round": 3
            },
            {
                "question": "Agar brauzerda external CSS fayli yuklanmay qolsa va konsolda 404 (Not Found) xatosi chiqsa, birinchi o'rinda nimani tekshirish lozim?",
                "options": [
                    "`<link>` tegining `href` atributidagi fayl yo'li (path) hamda fayl nomi va papka strukturasi to'g'riligini",
                    "HTML faylning `lang` atributini",
                    "Kompyuterdagi CSS versiyasini",
                    "Brauzerning shrift hajmini"
                ],
                "correctAnswer": 0,
                "round": 3
            },
            {
                "question": "CSS faylini ulashda keshni urib tushirish va yangilangan stillarni brauzerga ko'rsatish uchun qaysi best-practice usuli qo'llaniladi?",
                "options": [
                    "`href=\"style.css?v=1.0.1\"` kabi versiyalash parametrini qo'shish",
                    "`rel=\"new-stylesheet\"` atributiga o'zgarterish",
                    "HTML faylni har marta yangi nom bilan saqlash",
                    "CSS faylidagi barcha izohlarni o'chirib tashlash"
                ],
                "correctAnswer": 0,
                "round": 3
            }
        ]
    }

def get_lesson_25_quiz():
    return {
        "passingScore": 80,
        "questions": [
            {
                "question": "CSS Flexbox konteynerida elementlarni asosiy o'q (main axis) bo mezonida markazlashtirish uchun qaysi xususiyat ishlatiladi?",
                "options": [
                    "`justify-content: center;`",
                    "`align-items: center;`",
                    "`text-align: center;`",
                    "`float: center;`"
                ],
                "correctAnswer": 0,
                "round": 1
            },
            {
                "question": "CSS Flexbox modelida konteyner `display: flex;` deb e'lon qilinganda, odatda uning elementlari bo'yicha ko'rsatgich (flex-direction) ko'rsatilmasa, sukut bo'yicha (default) qanday yo'nalish olinadi?",
                "options": [
                    "`row` (gorizontal o'q bo'yicha)",
                    "`column` (vertikal o mezonida)",
                    "`row-reverse`",
                    "`grid`"
                ],
                "correctAnswer": 0,
                "round": 1
            },
            {
                "question": "Flex elementlarini ko'ndalang o'q (cross axis) bo'yicha tekislash uchun qaysi CSS xususiyatidan foydalaniladi?",
                "options": [
                    "`align-items`",
                    "`justify-content`",
                    "`flex-wrap`",
                    "`flex-grow`"
                ],
                "correctAnswer": 0,
                "round": 1
            },
            {
                "question": "Quyidagi CSS kodida elementlar qanday joylashadi?\n```css\n.container {\n  display: flex;\n  justify-content: space-between;\n}\n```",
                "options": [
                    "Birinchi element chap tomonda, oxirgisi o'ng tomonda bo'ladi va ular orasida teng masofa qoladi",
                    "Barcha elementlar markazda zich joylashadi",
                    "Elementlar bir-birining ostiga tushib qoladi",
                    "Elementlar orasida masofa qolmaydi"
                ],
                "correctAnswer": 0,
                "round": 2
            },
            {
                "question": "Quyidagi koddagi `align-items: stretch;` xususiyati flex item'larga qanday ta'sir qiladi?\n```css\n.flex-wrapper {\n  display: flex;\n  align-items: stretch;\n  height: 200px;\n}\n```",
                "options": [
                    "Agar item'da balandlik (height) berilmagan bo'lsa, u konteynerning butun 200px balandligini egallaydi",
                    "Item'lar 0px balandlikka ega bo'lib ko'rinmay qoladi",
                    "Item'lar faqat matn kengligicha bo'ladi",
                    "Item'lar doiraviy shaklga kiradi"
                ],
                "correctAnswer": 0,
                "round": 2
            },
            {
                "question": "Quyidagi kod bo'yicha markazlashtirish amalga oshmayotganining sababi nima?\n```css\n.box {\n  justify-content: center;\n  align-items: center;\n}\n```",
                "options": [
                    "`display: flex;` tegi e'lon qilinmagan",
                    "`position: absolute;` yetishmayapti",
                    "`margin: auto;` yozilmagan",
                    "`width: 100%` berilmagan"
                ],
                "correctAnswer": 0,
                "round": 2
            },
            {
                "question": "Foydalanuvchi interfeysida hero blok ichidagi kartochkani vertikal va gorizontal bo'yicha to'liq markazga joylashtirish uchun qaysi flexbox kodi eng toza hisoblanadi?",
                "options": [
                    "```css\n.hero {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n}\n```",
                    "```css\n.hero {\n  display: block;\n  margin-top: 200px;\n  margin-left: 200px;\n}\n```",
                    "```css\n.hero {\n  position: absolute;\n  top: 50px;\n}\n```",
                    "```css\n.hero {\n  float: left;\n  text-align: center;\n}\n```"
                ],
                "correctAnswer": 0,
                "round": 3
            },
            {
                "question": "Flex layout ishlatilayotganda elementlar sig'may qolsa va pastga o'tmay tushib ketayotgan bo'lsa, qaysi xususiyatni qo'shish kerak?",
                "options": [
                    "`flex-wrap: wrap;`",
                    "`flex-direction: column-reverse;`",
                    "`overflow: hidden;`",
                    "`display: inline;`"
                ],
                "correctAnswer": 0,
                "round": 3
            },
            {
                "question": "Flex item'larga `gap: 20px;` berilganda, u masofa qayerga qo'shiladi?",
                "options": [
                    "Faqat flex item'lar o'rtasidagi oralikka (tashqi chetlarga qo'shilmaydi)",
                    "Konteynerning barcha padding qismlariga",
                    "Faqat birinchi va oxirgi item tashqarisiga",
                    "Faqat matn ichidagi bo'shliqlarga"
                ],
                "correctAnswer": 0,
                "round": 3
            }
        ]
    }

def get_lesson_40_quiz():
    return {
        "passingScore": 80,
        "questions": [
            {
                "question": "HTML hujjatida JavaScript faylini ulashda `<script src=\"app.js\" defer></script>` atributidagi `defer` sozlamasi nimani ta'minlaydi?",
                "options": [
                    "Skript fonda yuklanadi va HTML parser hujjatni to'liq o'qib bo'lgach (DOM ready), ijro etiladi",
                    "Skript HTML yuklanishini majburan to'xtatib turadi (blocking)",
                    "Skript yuklangandan so'ng darhol DOM tayyor bo'lishidan oldin ishga tushadi",
                    "Skript faqat foydalanuvchi sahifani bosganda ishlaydi"
                ],
                "correctAnswer": 0,
                "round": 1
            },
            {
                "question": "JavaScript brauzer konsoliga obyekt yoki massivni jadval ko'rinishida chiroyli chiqarish uchun qaysi metoddan foydalaniladi?",
                "options": [
                    "`console.table()`",
                    "`console.log()`",
                    "`console.group()`",
                    "`console.info()`"
                ],
                "correctAnswer": 0,
                "round": 1
            },
            {
                "question": "JavaScript dasturlash tilida kod linter va interpretator tomonidan birinchi o'rinda nimani tekshirish amalga oshiriladi?",
                "options": [
                    "Sintaktik to'g'rilik (Syntax analysis va Parsing)",
                    "CSS fayllarning mavjudligi",
                    "Ekran o'lchami ruxsati",
                    "Foydalanuvchi paroli xavfsizligi"
                ],
                "correctAnswer": 0,
                "round": 1
            },
            {
                "question": "Quyidagi JS kodining brauzer konsolidagi chiqishi qanday bo'ladi?\n```javascript\nconsole.log(typeof NaN);\n```",
                "options": [
                    "`\"number\"` (chunki NaN - Not a Number maxsus sonli tur hisoblanadi)",
                    "`\"nan\"`",
                    "`\"undefined\"`",
                    "`\"string\"`"
                ],
                "correctAnswer": 0,
                "round": 2
            },
            {
                "question": "Quyidagi script tegi joylashuvidagi kamchilik nimada?\n```html\n<head>\n  <script src=\"script.js\"></script>\n</head>\n```",
                "options": [
                    "`async` yoki `defer` atributi ko'rsatilmadi, bu esa DOM elementlari render bo'lishini bloklaydi",
                    "Script tegi head ichida umuman yozilishi mumkin emas",
                    "`src` atributi o'rniga `href` bo'lishi kerak edi",
                    "Script tegi yopilishi shart emas"
                ],
                "correctAnswer": 0,
                "round": 2
            },
            {
                "question": "Quyidagi koddagi konsol buyrug'i qanday xabarni chiqaradi?\n```javascript\nconsole.error(\"Ulanishda xatolik yuz berdi!\");\n```",
                "options": [
                    "Konsolda qizil rangli xatolik bildirishnomasini va stack trace ni aks ettiradi",
                    "Oddiy kulrang matn chiqaradi",
                    "Brauzerda prompt modalkasini ochadi",
                    "Faylni avtomatik o'chirib tashlaydi"
                ],
                "correctAnswer": 0,
                "round": 2
            },
            {
                "question": "Zamonaviy frontend ilovalarda HTML faylning `<head>` qismiga ulangan JavaScript fayli DOM parsing jarayonini bloklamasligi uchun qaysi eng maqbul atribut qo'llaniladi?",
                "options": [
                    "`<script src=\"app.js\" defer></script>`",
                    "`<script src=\"app.js\" block></script>`",
                    "`<script src=\"app.js\" sync></script>`",
                    "`<script src=\"app.js\" inline></script>`"
                ],
                "correctAnswer": 0,
                "round": 3
            },
            {
                "question": "Agar brauzer konsolida `Uncaught ReferenceError: x is not defined` xatosi chiqsa, buning sababi nima?",
                "options": [
                    "Koddagi `x` o'zgaruvchisi e'lon qilinmasdan turib ishlatilmoqda",
                    "`x` o'zgaruvchisiga `null` qiymat berilgan",
                    "`x` funksiya bo'lib qayta nomlangan",
                    "CSS fayli ulanmagan"
                ],
                "correctAnswer": 0,
                "round": 3
            },
            {
                "question": "Dasturni nosozliklardan tozalash (debugging) jarayonida koddagi ma'lum nuqtada bajarilishni to'xtatib, o'zgaruvchilar holatini tekshirish uchun qaysi kalit so'z ishlatiladi?",
                "options": [
                    "`debugger;`",
                    "`stop;`",
                    "`pause;`",
                    "`break;`"
                ],
                "correctAnswer": 0,
                "round": 3
            }
        ]
    }

def get_lesson_77_quiz():
    return {
        "passingScore": 80,
        "questions": [
            {
                "question": "Single Page Application (SPA) arxitekturasining an'anaviy Multi Page Application (MPA) ga nisbatan asosiy afzalligi nimada?\n```jsx\n// SPA layout structure\n<App>\n  <Header />\n  <DynamicView />\n</App>\n```",
                "options": [
                    "Sahifa o'tishlarida serverdan butun HTML sahifani qayta yuklamasdan, faqat ma'lumotlarni asinxron yuklab, DOM ni dinamik yangilaydi",
                    "Server xotirasini umuman ishlatmaydi",
                    "SEO optimizatsiyasi avtomatik ravishda tayyor bo'ladi",
                    "JavaScript yo'q brauzerlarda ham mukammal ishlaydi"
                ],
                "correctAnswer": 0,
                "round": 1
            },
            {
                "question": "React.js dagi Virtual DOM (Xayoliy DOM) ning asosiy maqsadi va ishlash printsipi qanday?",
                "options": [
                    "Real DOM o'zgarishlarini xotirada taqqoslab (Reconciliation/Diffing), haqiqiy DOM ga faqat o'zgargan qismlarni minimal operatsiyalar bilan kiritadi",
                    "Real DOM ni butunlay o'chirib tashlaydi",
                    "Faqat CSS animasiyalarini tezlashtiradi",
                    "Serverga har soniyada so'rov yuboradi"
                ],
                "correctAnswer": 0,
                "round": 1
            },
            {
                "question": "React-da deklarativ (declarative) dasturlash yondashuvi nimani anglatadi?",
                "options": [
                    "Dasturchi interfeys qanday holatda (UI state) bo'lishi kerakligini tasvirlaydi, React esa DOM manipulyatsiyasini o'zi hal qiladi",
                    "Dasturchi har bir DOM tugunini `document.createElement` bilan qo'lda boshqarishi kerak",
                    "Faqat HTML teglaridan foydalanish majburiyligini",
                    "C++ tilidagi metodlarni chaqirishni"
                ],
                "correctAnswer": 0,
                "round": 1
            },
            {
                "question": "Quyidagi React reytinik diffing kodi fragmentida Virtual DOM render jarayoni qanday sodir bo'ladi?\n```jsx\n// State o'zgardi\nconst element = <h1>Salom {name}</h1>;\n```",
                "options": [
                    "React yangi Virtual DOM daraxtini yaratadi va eski Virtual DOM bilan taqqoslab, faqat matn tugunini real DOM da yangilaydi",
                    "Butun sahifa (window.location.reload) yangilanadi",
                    "Daraxtdagi barcha HTML elementlar o'chirib qayta quriladi",
                    "Hech qanday o'zgarish sodir bo'lmaydi"
                ],
                "correctAnswer": 0,
                "round": 2
            },
            {
                "question": "Quyidagi koddagi `ReactDOM.createRoot` metodi nimaga mo'ljallangan?\n```jsx\nimport ReactDOM from 'react-dom/client';\nconst root = ReactDOM.createRoot(document.getElementById('root'));\nroot.render(<App />);\n```",
                "options": [
                    "React ilovasining ildiz (root) render konteynerini yaratish va React komponentlar daraxtini ulash uchun",
                    "Backend server yaratish uchun",
                    "CSS fayllarini tarjima qilish uchun",
                    "LocalStorage ni tozalash uchun"
                ],
                "correctAnswer": 0,
                "round": 2
            },
            {
                "question": "React loyihada to'g'ridan-to mezon `document.getElementById('title').innerText = 'New'` deb yozish nega tavsiya etilmaydi?\n```javascript\n// Imperative DOM access in React app\ndocument.getElementById('title').innerText = 'Updated';\n```",
                "options": [
                    "Chunki bu React Virtual DOM holati (state) bilan real DOM o'rtasidagi sinxronlikni buzadi",
                    "Chunki brauzer buni taqiqlaydi",
                    "Chunki bu kod har doim va faqat xatolik beradi",
                    "Chunki bu funksiya sekinroq ishlaydi"
                ],
                "correctAnswer": 0,
                "round": 2
            },
            {
                "question": "Yuqori yuklamali foydalanuvchilar interfeysiga ega murakkab web dastur (masalan, Dashboard) yaratishda React kutubxonasini tanlashning asosiy sababi nima?\n```jsx\nfunction Dashboard() {\n  return <MainLayout><WidgetGrid /></MainLayout>;\n}\n```",
                "options": [
                    "Komponentli arxitektura, qayta foydalanuvchanlik hamda Virtual DOM orqali yuqori unumdorlik va holatni samarali boshqarish",
                    "Loyiha hajmining har doim 1KB dan kam bo'lishi",
                    "Har qanday ma'lumotlar bazasiga to'g'ridan-to'g'ri ulanishi",
                    "Serverga bo'lgan barcha so'rovlarni avtomatik bloklashi"
                ],
                "correctAnswer": 0,
                "round": 3
            },
            {
                "question": "SPA ilovalarda sahifa yo'nalishlari (routes) o'zgarganda brauzer qayta yuklanmasligining texnik sababi nimada?",
                "options": [
                    "HTML5 History API (`pushState`) yordamida URL o'zgartiriladi va React Router kerakli komponentni almashtiradi",
                    "Brauzer `window.stop()` buyrug'ini beradi",
                    "Cookie fayllar avtomatik o'chiriladi",
                    "Server barcha sahifalarni birdaniga yuklab beradi"
                ],
                "correctAnswer": 0,
                "round": 3
            },
            {
                "question": "React ilovasini ishlab chiqarishga (production build) o'tkazishda bundle (to'plam) fayllarini kichraytirish (minification) va optimallashtirish uchun qaysi vositadan foydalaniladi?",
                "options": [
                    "Vite / Webpack kabi bundlerlar",
                    "HTML Validator",
                    "CSS Reset fayli",
                    "Browser Storage"
                ],
                "correctAnswer": 0,
                "round": 3
            }
        ]
    }

def get_lesson_83_quiz():
    return {
        "passingScore": 80,
        "questions": [
            {
                "question": "React-da `useState` hook'ining asosiy vazifasi nima?",
                "options": [
                    "Komponent ichida reaktiv holatni (state) saqlash va u o'zgarganda komponentni qayta render qilish (re-render)",
                    "DOM elementlarini to'g'ridan-to'g'ri tanlab olish",
                    "CSS fayllarini dynamically ulash",
                    "Serverga avtomatik HTTP so'rov yuborish"
                ],
                "correctAnswer": 0,
                "round": 1
            },
            {
                "question": "React-da state immutable (o'zgarmas) hisoblanadi. State-ni to'g'ridan-to mezon mutatsiya qilish (`state.count = 5`) nega taqiqlanadi?",
                "options": [
                    "Chunki React o'zgarishni sepmaydi va komponent qayta render bo'lmaydi",
                    "Chunki JavaScript xatolik otadi",
                    "Chunki xotira to'lib qoladi",
                    "Chunki `count` kalit so'z hisoblanadi"
                ],
                "correctAnswer": 0,
                "round": 1
            },
            {
                "question": "Avvalgi state qiymatiga asoslanib state-ni yangilashda (`setCount(prev => prev + 1)`) funksional yangilanish (functional updater) nega ishlatiladi?",
                "options": [
                    "Asinxron holatda state-ning eng so'nggi va to'g'ri qiymati bilan ishlashni kafolatlash uchun",
                    "Kodni bitta qatorga qisqartirish uchun",
                    "Faqat `useEffect` ichida ishlashi uchun",
                    "State-ni `undefined` qilish uchun"
                ],
                "correctAnswer": 0,
                "round": 1
            },
            {
                "question": "Quyidagi komponentdagi tugma 3 marta bosilgach, ekranda `count` qiymati necha bo'ladi?\n```jsx\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  const handleClick = () => {\n    setCount(count + 1);\n  };\n  return <button onClick={handleClick}>{count}</button>;\n}\n```",
                "options": [
                    "3",
                    "1",
                    "0",
                    "9"
                ],
                "correctAnswer": 0,
                "round": 2
            },
            {
                "question": "Quyidagi koddagi `setCount` chaqiruvlari ketma-ketligida tugma 1 marta bosilganda `count` nechaga oshadi?\n```jsx\nconst handleClick = () => {\n  setCount(prev => prev + 1);\n  setCount(prev => prev + 1);\n};\n```",
                "options": [
                    "2 ga oshadi (chunki funksional updater prev qiymatni ketma-ket oladi)",
                    "1 ga oshadi",
                    "0 bo'lib qoladi",
                    "Error beradi"
                ],
                "correctAnswer": 0,
                "round": 2
            },
            {
                "question": "Quyidagi koddagi xatolikni ko'rsating:\n```jsx\nfunction User() {\n  const [user, setUser] = useState({ name: 'Ali', age: 20 });\n  const updateAge = () => {\n    user.age = 21;\n    setUser(user);\n  };\n}\n```",
                "options": [
                    "Obyekt nusxalanmagan va to'g'ridan-to'g'ri mutatsiya qilingan (`setUser({ ...user, age: 21 })` bo'lishi kerak edi)",
                    "`useState` obyekt qabul qilmaydi",
                    "`updateAge` funksiyasi arrow function bo'lishi shart",
                    "`user` o'zgaruvchisi `const` bo'la olmaydi"
                ],
                "correctAnswer": 0,
                "round": 2
            },
            {
                "question": "Formada foydalanuvchi ma'lumotlarini (ism, email) `useState` orqali boshqarishda bitta obyekt state-dan foydalanish usuli qanday to'g'ri yoziladi?",
                "options": [
                    "```jsx\nconst [form, setForm] = useState({ name: '', email: '' });\nconst handleChange = (e) => {\n  setForm({ ...form, [e.target.name]: e.target.value });\n};\n```",
                    "```jsx\nconst [form, setForm] = useState('');\nconst handleChange = (e) => {\n  form[e.target.name] = e.target.value;\n};\n```",
                    "```jsx\nsetForm(e.target.value);\n```",
                    "```jsx\nconst form = { name: '', email: '' };\n```"
                ],
                "correctAnswer": 0,
                "round": 3
            },
            {
                "question": "State yangilanganda React nima uchun butun sahifani emas, faqat mos komponentni qayta render qiladi?",
                "options": [
                    "Chunki `useState` o'sha komponentning fiber tuguniga va state ro'yxatiga bog'langan bo'ladi",
                    "Chunki u sahifani avtomatik qulflaydi",
                    "Chunki HTML5 buni talab qiladi",
                    "Chunki CSS o'zgaradi"
                ],
                "correctAnswer": 0,
                "round": 3
            },
            {
                "question": "Ko'p marotaba murakkab hisob-kitob bajaradigan boshlang'ich state qiymatini berishda `useState` lazy initial state usulidan nega foydalaniladi?\n```jsx\nconst [data, setData] = useState(() => calculateHeavyData());\n```",
                "options": [
                    "Og'ir `calculateHeavyData()` funksiyasi har bir re-renderda emas, faqat birinchi mount bo'lishida ishlatilishi uchun",
                    "State-ni o'chirib yuborish uchun",
                    "Asinxron API ga so'rov yuborish uchun",
                    "Faqat `useEffect` o'rnini bosish uchun"
                ],
                "correctAnswer": 0,
                "round": 3
            }
        ]
    }

if __name__ == '__main__':
    generate_all_curriculum()

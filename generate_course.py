import json

# Define the topics for the course
# Each topic is a tuple: (title, description, language, topic_type, starter_code, validation_rules)
html_topics = [
    ("HTML Kirish va Tuzilishi", "HTML hujjati strukturasini o'rganish", "html", "html", "<!-- HTML tuzilishini yarating -->", ["<html>", "</html>", "<head>", "<body>"]),
    ("H1-H6 Sarlavhalar", "HTML heading elementlarini o'rganish", "html", "h1", "<!-- H1 sarlavha yarating -->", ["<h1>", "</h1>"]),
    ("Paragraf va Matn formatlash", "p va strong, em teglari orqali matnlarni formatlash", "html", "p", "<!-- Kamida bitta p va strong elementi yarating -->", ["<p>", "</p>", "<strong>", "</strong>"]),
    ("Havolalar va a tegi", "a tegi orqali boshqa sahifalarga yo'llanma berish", "html", "a", "<!-- Havola yarating -->", ["href=", "</a>"]),
    ("Rasmlar va img tegi", "img tegi va alt atributi orqali rasm joylashtirish", "html", "img", "<!-- Rasm elementi joylashtiring -->", ["<img", "src=", "alt="]),
    ("Ro'yxatlar", "ul, ol va li teglari bilan ro'yxatlar yaratish", "html", "ul", "<!-- Tartibsiz ro'yxat yarating -->", ["<ul>", "</ul>", "<li>", "</li>"]),
    ("Blok va Qatorli elementlar", "div va span elementlarining farqi", "html", "div", "<!-- Blok va qatorli element yarating -->", ["<div>", "</div>", "<span>", "</span>"]),
    ("Jadvallar asoslari", "table, tr va td teglari bilan ishlash", "html", "table", "<!-- Sodda jadval yarating -->", ["<table>", "</table>", "<tr>", "</tr>", "<td>", "</td>"]),
    ("Murakkab jadvallar", "thead, tbody, colspan va rowspan yordamida jadvallar", "html", "table", "<!-- Ustunlarni birlashtiruvchi jadval yarating -->", ["<table>", "colspan=", "<td>"]),
    ("Form elementlari kirish", "form va input teglari orqali form yaratish", "html", "form", "<!-- Form elementini yarating -->", ["<form>", "</form>"]),
    ("Matnli inputlar va Textarea", "input type text, email, password va textarea", "html", "input", "<!-- Matn kiritish inputini yarating -->", ["<input", "type=\"text\"", "<textarea>"]),
    ("Checkbox va Radio tugmalar", "Checkbox va radio tanlov elementlari", "html", "input", "<!-- Checkbox yarating -->", ["<input", "type=\"checkbox\""]),
    ("Select dropdown va Option", "Select va option teglari orqali dropdown yaratish", "html", "select", "<!-- Dropdown tanlovini yarating -->", ["<select>", "</select>", "<option>"]),
    ("Tugmalar", "button, submit va reset tugmalari", "html", "button", "<!-- Submit tugmasini yarating -->", ["<button", "type=\"submit\""]),
    ("HTML5 Semantik teglari", "header, footer, nav semantik teglari", "html", "header", "<!-- Semantik header va nav yarating -->", ["<header>", "</header>", "<nav>", "</nav>"]),
    ("HTML5 Sectional teglari", "section, article va aside semantik teglari", "html", "section", "<!-- Section va article yarating -->", ["<section>", "</section>", "<article>", "</article>"]),
    ("Media: Audio elementlari", "audio tegi orqali ovozli fayllar qo'yish", "html", "audio", "<!-- Audio elementini yarating -->", ["<audio", "src="]),
    ("Media: Video elementlari", "video tegi va uning atributlari", "html", "video", "<!-- Video elementini yarating -->", ["<video", "src="]),
    ("Iframe va tashqi resurslar", "iframe tegi orqali boshqa saytni integratsiya qilish", "html", "iframe", "<!-- Iframe elementini yarating -->", ["<iframe", "src="]),
    ("HTML Metama'lumotlar", "meta tags, charset va viewport sozlamalari", "html", "meta", "<!-- Viewport meta tegini yarating -->", ["<meta", "name=\"viewport\"", "content="]),
    ("HTML Izohlar", "Koddagi izohlar (comments) yozish formatlari", "html", "comment", "<!-- Bu yerda izoh yozing -->", ["<!--", "-->"]),
    ("HTML Atributlari", "id, class, title, style atributlarini qo'llash", "html", "attr", "<!-- Elementga id va class bering -->", ["id=", "class="]),
    ("Maxsus belgilar", "HTML entities (&nbsp;, &lt;, &gt;, &amp;)", "html", "entity", "<!-- Bo'sh joy va belgini kiriting -->", ["&nbsp;", "&lt;"]),
    ("SVG elementlariga kirish", "svg, path, circle teglari bilan ishlash", "html", "svg", "<!-- Aylana shaklidagi SVG yarating -->", ["<svg", "<circle", "cx="]),
    ("Fayllarni yuklash inputi", "input type file atributi", "html", "input", "<!-- Fayl yuklash inputini yarating -->", ["<input", "type=\"file\""]),
    ("Sana va vaqt inputlari", "input type date va time", "html", "input", "<!-- Sana tanlash inputini yarating -->", ["<input", "type=\"date\""]),
    ("Qidiruv va URL inputlari", "input type search va url", "html", "input", "<!-- Qidiruv inputini yarating -->", ["<input", "type=\"search\""]),
    ("Progress bar va Meter", "progress va meter teglari bilan ishlash", "html", "progress", "<!-- Progress bar yarating -->", ["<progress", "value=", "max="]),
    ("Datalist va Details/Summary", "datalist, details va summary elementlari", "html", "details", "<!-- Details va summary yarating -->", ["<details>", "<summary>", "</details>"]),
    ("HTML SEO va Validatsiya", "W3C validatsiya va SEO qoidalari", "html", "seo", "<!-- Description meta tegini yarating -->", ["<meta", "name=\"description\""])
]

css_topics = [
    ("CSS Kirish va Ulash usullari", "inline, internal, external ulash usullari", "css", "link", "/* CSS ulash uchun link yozing (HTML da external ulash qoidasini tasavvur qiling yoki internal style oching) */\n<style>\n\n</style>", ["<style>", "</style>"]),
    ("CSS Selektorlar: Element, Class va ID", "Element nomi, .class va #id selektorlari", "css", "selectors", "/* ID va class selektorlarini yozing */\n#main-title {\n  \n}\n.text-center {\n  \n}", ["#main-title", ".text-center"]),
    ("CSS Selektorlar: Universal va Attribut", "Universal (*), attribut selektorlari bilan ishlash", "css", "selectors", "/* Universal selektor yozing */\n* {\n  \n}", ["* {"]),
    ("CSS Ranglar", "RGB, HEX, HSL rang formatlari", "css", "colors", "body {\n  color: ;\n}", ["color:", "body"]),
    ("CSS Matn xususiyatlari", "color, font-family, font-size", "css", "fonts", "p {\n  font-size: ;\n  font-family: ;\n}", ["font-size", "font-family"]),
    ("CSS Matn tekislash", "text-align, line-height, text-decoration", "css", "text", "p {\n  text-align: ;\n  text-decoration: ;\n}", ["text-align", "text-decoration"]),
    ("CSS Box Model: Margin va Padding", "Margin va padding xususiyatlarining farqi", "css", "box-model", "div {\n  margin: ;\n  padding: ;\n}", ["margin", "padding"]),
    ("CSS Box Model: Border va Outline", "Border va outline chegaralari", "css", "box-model", "div {\n  border: ;\n  outline: ;\n}", ["border", "outline"]),
    ("CSS Box Model: Width, Height va Box-sizing", "Width, height va border-box rejimi", "css", "box-model", "div {\n  box-sizing: ;\n}", ["box-sizing", "border-box"]),
    ("CSS Display xususiyati", "block, inline, inline-block, none turlari", "css", "display", "span {\n  display: ;\n}", ["display"]),
    ("CSS Position: Static va Relative", "Static va relative joylashuv turlari", "css", "position", "div {\n  position: ;\n}", ["position", "relative"]),
    ("CSS Position: Absolute va Fixed", "Absolute va fixed joylashuv turlari", "css", "position", "div {\n  position: ;\n}", ["position", "absolute"]),
    ("CSS Position: Sticky va Z-index", "Sticky va elementlar ustma-ustligi (z-index)", "css", "position", "header {\n  position: ;\n  z-index: ;\n}", ["position", "sticky", "z-index"]),
    ("CSS Orqa fon", "background-image, position, repeat", "css", "background", "body {\n  background-image: ;\n}", ["background-image"]),
    ("CSS Float va Clear", "Float va clear xususiyatlari bilan ishlash", "css", "float", ".col {\n  float: ;\n}\n.clearfix {\n  clear: ;\n}", ["float", "clear"]),
    ("Flexbox: Kirish va Flex-container", "Flexbox moduli va display flex", "css", "flexbox", ".container {\n  display: ;\n}", ["display", "flex"]),
    ("Flexbox: Flex-direction va Flex-wrap", "Flex-direction va flex-wrap xususiyatlari", "css", "flexbox", ".container {\n  display: flex;\n  flex-direction: ;\n}", ["flex-direction"]),
    ("Flexbox: Justify-content va Align-items", "Justify-content va align-items elementlarni tekislash", "css", "flexbox", ".container {\n  display: flex;\n  justify-content: ;\n  align-items: ;\n}", ["justify-content", "align-items"]),
    ("Flexbox: Align-content va Gap", "Ko'p qatorli elementlarni tekislash va masofalar", "css", "flexbox", ".container {\n  display: flex;\n  gap: ;\n}", ["gap"]),
    ("Flexbox: Flex-grow, Flex-shrink va Flex-basis", "Moslashuvchan o'lchamlar", "css", "flexbox", ".item {\n  flex-grow: ;\n}", ["flex-grow"]),
    ("Flexbox: Align-self va Order", "Alohida elementlarni tekislash va joylashuv tartibi", "css", "flexbox", ".item {\n  align-self: ;\n}", ["align-self"]),
    ("CSS Grid: Kirish va Grid-template-columns", "CSS Grid to'ri va template-columns", "css", "grid", ".grid-container {\n  display: ;\n  grid-template-columns: ;\n}", ["display", "grid", "grid-template-columns"]),
    ("CSS Grid: Grid-gap va Grid-template-areas", "Grid masofalari va hududlar bo'yicha maket", "css", "grid", ".grid-container {\n  display: grid;\n  grid-gap: ;\n}", ["grid-gap"]),
    ("CSS Grid: Grid-column va Grid-row alignment", "Grid elementlarining joylashuvi", "css", "grid", ".item {\n  grid-column: ;\n}", ["grid-column"]),
    ("CSS Grid: Minmax va Auto-fit/Auto-fill", "Grid-da moslashuvchan ustunlar yaratish", "css", "grid", ".grid-container {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));\n}", ["auto-fit", "minmax"]),
    ("CSS O'lchov birliklari", "px, %, em, rem, vw, vh", "css", "units", "p {\n  font-size: ;\n  width: ;\n}", ["rem", "vw"]),
    ("CSS Soyalar", "box-shadow va text-shadow", "css", "shadow", "div {\n  box-shadow: ;\n}", ["box-shadow"]),
    ("CSS Chegaralarni yumaloqlash", "border-radius bilan ishlash", "css", "border", "img {\n  border-radius: ;\n}", ["border-radius"]),
    ("CSS Transition va Transform", "Elementlarni shaklini o'zgartirish va silliq o'tishlar", "css", "animation", "div {\n  transition: ;\n  transform: ;\n}", ["transition", "transform"]),
    ("CSS Animation va Keyframes", "@keyframes yordamida animatsiyalar yaratish", "css", "animation", "@keyframes slide {\n  from { }\n  to { }\n}\ndiv {\n  animation: ;\n}", ["@keyframes", "animation"]),
    ("CSS Pseudo-klasslar", ":hover, :active, :focus, :nth-child", "css", "pseudo", "a:hover {\n  \n}", [":hover"]),
    ("CSS Pseudo-elementlar", "::before, ::after, ::placeholder", "css", "pseudo", "p::before {\n  content: \"\";\n}", ["::before", "content"]),
    ("CSS Responsive Design", "Media Queries (@media) bilan ishlash", "css", "responsive", "@media (max-width: 768px) {\n  body {\n    \n  }\n}", ["@media", "max-width"]),
    ("CSS Custom Properties", "CSS variables (o'zgaruvchilar) yaratish va ishlatish", "css", "variables", ":root {\n  --main-color: ;\n}\nbody {\n  color: var(--main-color);\n}", ["--", "var("]),
    ("CSS Flexbox va Grid birgalikda", "Flexbox va Grid modullarini birga qo'llash", "css", "layout", ".container {\n  display: grid;\n}\n.header {\n  display: flex;\n}", ["display", "grid", "display", "flex"])
]

js_topics = [
    ("JS Kirish va Script ulash", "Javascript asoslari va script tegi", "javascript", "script", "<!-- Script tegini async bilan ulash -->", ["<script", "async"]),
    ("O'zgaruvchilar", "var, let, const farqlari va qo'llanilishi", "javascript", "variables", "let x = 10;\nconst y = 20;", ["let", "const"]),
    ("Ma'lumot turlari", "Primitive va Reference turlari", "javascript", "types", "let name = \"InFast\";\nlet age = 5;", ["\"", "age"]),
    ("Operatorlar: Arifmetik va Solishtirish", "Arifmetik amallar va taqqoslashlar", "javascript", "operators", "let isGreater = 5 > 3;", ["="]),
    ("Operatorlar: Mantiqiy", "AND (&&), OR (||), NOT (!) operatorlari", "javascript", "operators", "let result = true && false;", ["&&"]),
    ("Shart operatorlari: if/else", "if, else if, else shartli qarorlar", "javascript", "conditions", "if (age > 18) {\n  \n} else {\n  \n}", ["if", "else"]),
    ("Shart operatorlari: switch-case", "switch case va Ternary (? :) operatori", "javascript", "conditions", "let allowed = age >= 18 ? true : false;", ["?"]),
    ("Tsikllar: for loop", "for tsikli yordamida takrorlanuvchi amallar", "javascript", "loops", "for (let i = 0; i < 5; i++) {\n  \n}", ["for", "let", ";", "++"]),
    ("Tsikllar: while va do-while", "while va do-while tsikllari", "javascript", "loops", "let i = 0;\nwhile (i < 5) {\n  i++;\n}", ["while", "i++"]),
    ("Funksiyalar: Function Declaration", "Standart funksiya yaratish sintaksisi", "javascript", "functions", "function sayHello() {\n  \n}", ["function", "()", "{", "}"]),
    ("Funksiyalar: Function Expression", "Arrow funksiyalar va expression shakli", "javascript", "functions", "const sayHello = () => {\n  \n};", ["const", "=>"]),
    ("Funksiyalarda parametrlar va return", "Funksiyalarga parametr uzatish va qiymat qaytarish", "javascript", "functions", "function add(a, b) {\n  return a + b;\n}", ["return", "a", "b"]),
    ("Scope: Global, Local va Block", "O'zgaruvchilarning ko'rinish doirasi", "javascript", "scope", "{\n  let blockScoped = \"OK\";\n}", ["let"]),
    ("Array (Massiv) yaratish va metodlar", "push, pop, shift, unshift metodlari", "javascript", "arrays", "let arr = [];\narr.push(1);", ["arr", "push"]),
    ("Array metodlari: slice va splice", "Massivlarni kesish va o'zgartirish", "javascript", "arrays", "let subset = arr.slice(0, 2);", ["slice"]),
    ("Array iteratsiyasi: forEach va map", "Massiv elementlari bo'ylab aylanish va yangi massiv yaratish", "javascript", "arrays", "arr.map(x => x * 2);", ["map"]),
    ("Array filtrlash va qidirish", "filter, find va findIndex metodlari", "javascript", "arrays", "let filtered = arr.filter(x => x > 5);", ["filter"]),
    ("Array metodlari: reduce", "reduce metodi orqali massiv elementlarini yig'ish", "javascript", "arrays", "let sum = arr.reduce((acc, val) => acc + val, 0);", ["reduce"]),
    ("Object (Obyekt) yaratish va metodlar", "Obyekt xususiyatlari va metodlari", "javascript", "objects", "let user = { name: \"Ali\", age: 20 };", ["user", "name:", "age:"]),
    ("Object iteratsiyasi", "for-in tsikli, Object.keys va values", "javascript", "objects", "let keys = Object.keys(user);", ["Object.keys"]),
    ("DOM (Document Object Model) kirish", "querySelector va getElementById yordamida element tanlash", "javascript", "dom", "let el = document.querySelector(\".title\");", ["document.querySelector"]),
    ("DOM: Elementlar contenti", "textContent va innerHTML o'rtasidagi farq", "javascript", "dom", "el.textContent = \"Salom\";", ["textContent"]),
    ("DOM: Elementlar atributlari va stillari", "style va setAttribute yordamida dizaynni o'zgartirish", "javascript", "dom", "el.style.color = \"red\";", ["style.color"]),
    ("DOM: Classlar bilan ishlash", "classList.add, remove va toggle", "javascript", "dom", "el.classList.add(\"active\");", ["classList.add"]),
    ("DOM: Elementlar yaratish va o'chirish", "createElement va appendChild metodlari", "javascript", "dom", "let div = document.createElement(\"div\");\ndocument.body.appendChild(div);", ["document.createElement", "appendChild"]),
    ("DOM: Eventlar kirish", "addEventListener yordamida click hodisasini tutish", "javascript", "dom", "el.addEventListener(\"click\", () => {});", ["addEventListener", "\"click\""]),
    ("DOM: Event object", "e.target va e.preventDefault metodlari", "javascript", "dom", "el.addEventListener(\"click\", (e) => {\n  e.preventDefault();\n});", ["preventDefault()"]),
    ("DOM: Input va Form eventlari", "change, submit eventlari bilan ishlash", "javascript", "dom", "form.addEventListener(\"submit\", (e) => {});", ["\"submit\""]),
    ("String metodlari", "indexOf, slice, replace, split metodlari", "javascript", "strings", "let words = str.split(\" \");", ["split"]),
    ("Math object va tasodifiy sonlar", "Math.random va Math.floor metodlari", "javascript", "math", "let randomNum = Math.floor(Math.random() * 10);", ["Math.floor", "Math.random"])
]

advanced_js_topics = [
    ("Destructuring va Rest/Spread", "Obyekt va massivlarni destructuring qilish hamda spread (...) operatori", "javascript", "es6", "const { name, age } = user;\nconst newArr = [...arr];", ["...", "} ="]),
    ("ES6 klasslari va OOP basics", "class, constructor va metodlar", "javascript", "oop", "class Animal {\n  constructor(name) {\n    this.name = name;\n  }\n}", ["class", "constructor", "this."]),
    ("Callback funksiyalar", "Asinxronlik kirish va callback funksiyalar", "javascript", "async", "function fetch(callback) {\n  callback();\n}", ["callback"]),
    ("Promise va uning holatlari", "resolve va reject holatlari", "javascript", "async", "const promise = new Promise((resolve, reject) => {\n  resolve();\n});", ["Promise", "resolve", "reject"]),
    ("Async / Await sintaksisi", "Asinxron funksiyalarni oson yozish", "javascript", "async", "async function loadData() {\n  await getData();\n}", ["async", "await"]),
    ("JSON ma'lumot formati", "JSON.parse va JSON.stringify metodlari", "javascript", "json", "let obj = JSON.parse(jsonStr);", ["JSON.parse"]),
    ("Fetch API orqali GET so'rovi", "Serverdan ma'lumot olish", "javascript", "fetch", "fetch(\"url\").then(res => res.json());", ["fetch", ".then"]),
    ("Fetch API: POST, PUT, DELETE", "Serverga ma'lumot yuborish va o'chirish", "javascript", "fetch", "fetch(\"url\", { method: \"POST\" });", ["method:", "\"POST\""]),
    ("LocalStorage va SessionStorage", "Ma'lumotlarni brauzerda saqlash", "javascript", "storage", "localStorage.setItem(\"token\", \"xyz\");", ["localStorage.setItem"]),
    ("Error Handling (try...catch)", "Xatoliklarni tutish va dasturni himoyalash", "javascript", "error", "try {\n  \n} catch (error) {\n  \n}", ["try", "catch"]),
    ("JS Regular Expressions", "RegExp asoslari va test/match metodlari", "javascript", "regexp", "let pattern = /abc/;\nlet isMatch = pattern.test(\"abcdef\");", ["/", ".test"]),
    ("Set va Map ma'lumot tuzilmalari", "Noyob elementlar to'plami va kalit-qiymat xaritasi", "javascript", "structures", "let uniqueSet = new Set();", ["new Set()"]),
    ("JS Event Loop va Call Stack", "Asinxron operatsiyalar qanday bajariladi", "javascript", "eventloop", "setTimeout(() => {}, 0);", ["setTimeout"]),
    ("Date obyekti bilan ishlash", "Sana va vaqt qiymatlarini boshqarish", "javascript", "date", "let now = new Date();", ["new Date()"]),
    ("JavaScript modullari", "import va export orqali kodni bo'laklash", "javascript", "modules", "export const data = {};\nimport { data } from \"./file\";", ["export", "import"]),
    ("Debounce va Throttle", "Hodisalar chaqirilishini cheklash", "javascript", "optimization", "function debounce() {\n  \n}", ["debounce"]),
    ("Git va GitHub asoslari", "Versiyalar nazorati tizimi", "javascript", "git", "# Git repository init\ngit init", ["git"]),
    ("Chrome DevTools", "Kod xatolarini tekshirish va debug qilish", "javascript", "devtools", "console.log(\"Debugging...\");", ["console.log"]),
    ("Kurs yakuni: Portfolioga loyiha joylash", "Loyiha yuklash va Frontend kelajagi", "javascript", "career", "// Portfolio template setup\nconst portfolio = {};", ["portfolio"])
]

# Quick sanity check on counts
print(f"HTML: {len(html_topics)}")
print(f"CSS: {len(css_topics)}")
print(f"JS: {len(js_topics)}")
print(f"Adv JS: {len(advanced_js_topics)}")
print(f"Total Lessons: {len(html_topics) + len(css_topics) + len(js_topics) + len(advanced_js_topics)}")

def generate_questions(topic_title, language, order):
    """Generates 9 quiz questions (3 rounds x 3 questions) tailored to the lesson topic."""
    questions = []
    
    # We will generate 3 rounds, each containing 3 questions
    for round_num in [1, 2, 3]:
        for q_idx in range(1, 4):
            q_num = (round_num - 1) * 3 + q_idx
            
            # Simple question generation templates to make them realistic
            if q_num == 1:
                question_text = f"{topic_title} mavzusida asosan nima o'rganiladi?"
                options = [
                    f"Mavzuning asosiy sintaksisi va qo'llanish doirasi",
                    f"Faqat ma'lumotlar bazasi bilan ishlash",
                    f"Faqat server sozlamalari",
                    f"Dizayn loyihalash bosqichlari"
                ]
                correct_answer = 0
            elif q_num == 2:
                if language == "html":
                    question_text = f"Quyidagilardan qaysi biri {topic_title} ga tegishli to'g'ri HTML elementi hisoblanadi?"
                    options = ["<div class='test'>", "<selector>", "<property: value>", "function() {}"]
                    correct_answer = 0
                elif language == "css":
                    question_text = f"Quyidagilardan qaysi biri {topic_title} ga oid to'g'ri CSS yozilishi hisoblanadi?"
                    options = ["{ color: red; }", ".class-name { }", "<style>", "let x = 10;"]
                    correct_answer = 1
                else:
                    question_text = f"Quyidagilardan qaysi biri {topic_title} ga tegishli to'g'ri JavaScript sintaksisi hisoblanadi?"
                    options = ["const myVar = 5;", "var-name = 5;", "dim myVar = 5", "<script name='var'>"]
                    correct_answer = 0
            elif q_num == 3:
                question_text = f"{topic_title} yordamida quyidagi amallardan qaysi birini bajarib bo'lmaydi?"
                options = [
                    "Ma'lumotlar bazasini to'g'ridan-to'g'ri (server-side) boshqarish",
                    "Foydalanuvchi interfeysini loyihalash",
                    "Sahifa elementlarini dinamik boshqarish",
                    "Dizayn stillarini o'zgartirish va moslashuvchan qilish"
                ]
                correct_answer = 0
            elif q_num == 4:
                question_text = f"{topic_title} texnologiyasi Frontend dasturchi uchun nega muhim?"
                options = [
                    "Foydalanuvchi ko'radigan interfeys qismini yaratish va boshqarish uchun",
                    "Faqat server tezligini oshirish uchun",
                    "Faqat rasmlarni siqish uchun",
                    "Kompyuter xavfsizligini ta'minlash uchun"
                ]
                correct_answer = 0
            elif q_num == 5:
                if language == "html":
                    question_text = f"{topic_title} kodlarini brauzer qanday o'qiydi?"
                    options = [
                        "Yuqoridan pastga qarab, ketma-ket (parsing)",
                        "Faqat oxiridan boshlab",
                        "Faqat o'rtasidan boshlab",
                        "Kodlarni umuman o'qimaydi, faqat rasm qilib ko'rsatadi"
                    ]
                    correct_answer = 0
                elif language == "css":
                    question_text = f"{topic_title} qoidalarini yozishda eng ko'p qo'llaniladigan selektor turi qaysi?"
                    options = ["Class (nuqta bilan boshlanadigan)", "Faqat ID", "Faqat universal", "Hech qanday selektor ishlatilmaydi"]
                    correct_answer = 0
                else:
                    question_text = f"{topic_title} kodida yuz bergan sintaktik xatolarni qayerda tekshirish qulay?"
                    options = [
                        "Brauzer konsolida (Console tab)",
                        "Faqat matn muharririning o'zida",
                        "HTML hujjati ichida",
                        "Xatolarni tekshirib bo'lmaydi"
                    ]
                    correct_answer = 0
            elif q_num == 6:
                question_text = f"{topic_title} mavzusida xavfsizlik va samaradorlik nuqtai nazaridan qaysi yondashuv to'g'ri?"
                options = [
                    "Kodni toza, tushunarli yozish va ortiqcha takrorlanishlardan qochish",
                    "Barcha kodlarni bitta qatorda yozish",
                    "Barcha o'zgaruvchilarni global darajada e'lon qilish",
                    "Izohlarni umuman yozmaslik"
                ]
                correct_answer = 0
            elif q_num == 7:
                question_text = f"Quyidagi ta'riflardan qaysi biri {topic_title} ga mos keladi?"
                options = [
                    f"Foydalanuvchi brauzerida ishlaydigan va loyihaning tegishli qismini boshqaruvchi texnologiya",
                    "Faqat operatsion tizimlar bilan ishlaydigan dastur",
                    "Ma'lumotlar ombori uchun SQL so'rovlar tili",
                    "Faqat grafik dizayn chizish dasturi"
                ]
                correct_answer = 0
            elif q_num == 8:
                if language == "html":
                    question_text = f"HTML-da {topic_title} elementlarini yozgandan so'ng brauzerda natijani ko'rish uchun nima qilish kerak?"
                    options = [
                        "Faylni saqlab, brauzerda ochish (yoki yangilash)",
                        "Kompyuterni o'chirib yoqish",
                        "Faylni PDF formatiga o'tkazish",
                        "Hech narsa qilish shart emas, avtomat ko'rinadi"
                    ]
                    correct_answer = 0
                elif language == "css":
                    question_text = f"CSS-da {topic_title} xususiyatlarining qiymatlarini yozganda qaysi belgilar ishlatiladi?"
                    options = [
                        "Ikki nuqta (:) va nuqtali vergul (;)",
                        "Tenglik (=) va vergul (,)",
                        "Qavslar ( ) va slesh ( / )",
                        "Faqat bo'sh joy"
                    ]
                    correct_answer = 0
                else:
                    question_text = f"JavaScript-da {topic_title} elementlari bilan ishlashda qaysi turdagi xatoliklar ko'p uchraydi?"
                    options = [
                        "SyntaxError, ReferenceError va TypeError",
                        "Faqat HTML xatoliklari",
                        "Operatsion tizim xatoliklari",
                        "Hech qanday xatolik uchramaydi"
                    ]
                    correct_answer = 0
            else:
                question_text = f"Ushbu {topic_title} darsi yakunida qanday amaliy ko'nikmaga ega bo'lasiz?"
                options = [
                    f"Mavzuni tushunish, amaliy mashg'ulotda kod yozish va uni to'g'ri validatsiya qilish",
                    "Faqat savollarga javob berish",
                    "Hech qanday amaliy ko'nikma berilmaydi",
                    "Faqat nazariy ma'lumotga ega bo'lish"
                ]
                correct_answer = 0

            questions.append({
                "question": question_text,
                "options": options,
                "correctAnswer": correct_answer,
                "round": round_num
            })
            
    return questions

def build_lesson(topic, order):
    title, desc, language, topic_type, starter_code, validation_rules = topic
    
    practice = {
        "title": f"{title} elementlarini yarating",
        "description": f"Ushbu mashqda {title} bo'yicha berilgan boshlang'ich koddan foydalanib, shartlarni bajaring va kod yozing.",
        "language": language,
        "starterCode": starter_code,
        "validationType": "contains",
        "validationRules": validation_rules,
        "xpReward": 50,
        "coinReward": 10
    }
    
    quiz = {
        "passingScore": 80,
        "questions": generate_questions(title, language, order)
    }
    
    return {
        "title": title,
        "description": desc,
        "order": order,
        "practice": practice,
        "quiz": quiz
    }

def main():
    modules = []
    
    # HTML Asoslari (18 lessons)
    html_lessons = []
    for idx, topic in enumerate(html_topics[:18]):
        html_lessons.append(build_lesson(topic, idx + 1))
        
    modules.append({
        "title": "HTML Asoslari",
        "order": 1,
        "lessons": html_lessons
    })
    
    # CSS Asoslari (24 lessons)
    css_lessons = []
    for idx, topic in enumerate(css_topics[:24]):
        css_lessons.append(build_lesson(topic, idx + 1))
        
    modules.append({
        "title": "CSS Asoslari",
        "order": 2,
        "lessons": css_lessons
    })
    
    # JavaScript Asoslari (20 lessons)
    js_lessons = []
    for idx, topic in enumerate(js_topics[:20]):
        js_lessons.append(build_lesson(topic, idx + 1))
        
    modules.append({
        "title": "JavaScript Asoslari",
        "order": 3,
        "lessons": js_lessons
    })
    
    # Kengaytirilgan JavaScript va Web Texnologiyalari (10 lessons)
    adv_js_lessons = []
    for idx, topic in enumerate(advanced_js_topics[:10]):
        adv_js_lessons.append(build_lesson(topic, idx + 1))
        
    modules.append({
        "title": "Kengaytirilgan JavaScript va Web Texnologiyalari",
        "order": 4,
        "lessons": adv_js_lessons
    })
    
    course_json = {
        "title": "Frontend Development",
        "description": "HTML, CSS va JavaScript asoslarini o'rganish kursi",
        "price": 0,
        "duration": "6 oy",
        "level": "Frontend Asoslari",
        "status": "ACTIVE",
        "modules": modules
    }
    
    with open("frontend_course.json", "w", encoding="utf-8") as f:
        json.dump(course_json, f, ensure_ascii=False, indent=2)
        
    print("Muvaffaqiyatli saqlandi: frontend_course.json!")

if __name__ == "__main__":
    main()

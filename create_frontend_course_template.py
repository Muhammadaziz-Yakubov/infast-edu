import json

MODULES_DATA = [
    # 1-3 Oylar: HTML & CSS (38 dars)
    {
        "module_title": "1-Modul: HTML5 Asoslari va Semantik Tuzilishi (1-Oy)",
        "lessons": [
            ("Web rivojlanishi, Brauzerlar ishlashi va HTML ga kirish", "html", "<!-- 1-Dars: HTML ga kirish -->\n<h1>InFast Academy Frontend</h1>", ["<h1>"]),
            ("HTML Teglar, Elementlar va Atributlar", "html", "<p class=\"text\">Front-end dasturlash kursi</p>", ["<p", "class="]),
            ("Matn bilan ishlash teglari: h1-h6, p, span, strong, em", "html", "<h1>Sarlavha</h1>\n<p><strong>Muhim matn</strong></p>", ["<h1>", "<strong>"]),
            ("Ro'yxatlar bilan ishlash: ul, ol, li va nested lists", "html", "<ul>\n  <li>HTML5</li>\n  <li>CSS3</li>\n</ul>", ["<ul>", "<li>"]),
            ("Linklar va Havolalar: a tegi, target va href atributlari", "html", "<a href=\"https://google.com\" target=\"_blank\">Qidiruv</a>", ["<a", "href="]),
            ("Rasm va Multimedia teglari: img, video, audio va alt", "html", "<img src=\"logo.png\" alt=\"Logo\" width=\"200\" />", ["<img", "alt="]),
            ("HTML Jadval elementlari: table, tr, th, td, colspan, rowspan", "html", "<table>\n  <tr><th>Ism</th><th>Yosh</th></tr>\n</table>", ["<table>", "<th>"]),
            ("HTML Form elementlari: form, input turlari (text, password, email)", "html", "<form>\n  <input type=\"text\" placeholder=\"Ismingiz\" />\n</form>", ["<form", "input"]),
            ("Form interaktiv elementlari: select, option, textarea, button", "html", "<select>\n  <option value=\"1\">Frontend</option>\n</select>", ["<select", "<option"]),
            ("HTML5 Semantik teglar: header, nav, main, section, article, footer", "html", "<header>\n  <nav>Bosh sahifa</nav>\n</header>", ["<header>", "<nav>"]),
            ("Meta teglar va SEO asoslari: head, meta description, viewport", "html", "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />", ["<meta", "viewport"]),
            ("HTML Validator va Semantik standartlarga rioya qilish", "html", "<main>\n  <article>Maqola</article>\n</main>", ["<main>", "<article>"])
        ]
    },
    {
        "module_title": "2-Modul: CSS3 Stil Berish va Layout Asoslari (2-Oy)",
        "lessons": [
            ("CSS3 ga kirish: Inline, Internal va External CSS ulash", "html", "<link rel=\"stylesheet\" href=\"style.css\" />", ["<link", "stylesheet"]),
            ("CSS Selektorlar: Element, Class, ID va universal selektorlar", "css", ".card {\n  background-color: #f5f5f5;\n}", [".card", "background-color"]),
            ("Ranglar bilan ishlash: HEX, RGB, HSL va Opacity/RGBA", "css", ".box {\n  color: rgba(0, 0, 0, 0.8);\n}", ["color", "rgba"]),
            ("CSS Typography: font-family, font-size, font-weight, line-height", "css", "body {\n  font-family: 'Inter', sans-serif;\n}", ["font-family", "sans-serif"]),
            ("Box Model tushunchasi: Content, Padding, Border, Margin", "css", ".container {\n  padding: 20px;\n  margin: 0 auto;\n}", ["padding", "margin"]),
            ("Box-Sizing xususiyati: content-box va border-box", "css", "* {\n  box-sizing: border-box;\n}", ["box-sizing", "border-box"]),
            ("CSS Position xususiyati: static, relative, absolute, fixed, sticky", "css", ".modal {\n  position: fixed;\n  top: 50%;\n}", ["position", "fixed"]),
            ("CSS Display xususiyati: block, inline, inline-block, none", "css", ".btn {\n  display: inline-block;\n}", ["display", "inline-block"]),
            ("Overflow va z-index layer tushunchalari", "css", ".drawer {\n  z-index: 999;\n  overflow-y: auto;\n}", ["z-index", "overflow"]),
            ("CSS Pseudo-classlar: :hover, :active, :nth-child, :first-child", "css", "button:hover {\n  background: #007bff;\n}", [":hover", "background"]),
            ("CSS Pseudo-elementlar: ::before, ::after va content xususiyati", "css", ".title::after {\n  content: '';\n  display: block;\n}", ["::after", "content"]),
            ("CSS Variables (Custom Properties): --primary-color va var()", "css", ":root {\n  --primary: #3b82f6;\n}\n.btn { background: var(--primary); }", ["--primary", "var("])
        ]
    },
    {
        "module_title": "3-Modul: Modern CSS Grid, Flexbox, Figma & GitHub (3-Oy)",
        "lessons": [
            ("CSS Flexbox asoslari: display: flex, justify-content, align-items", "css", ".row {\n  display: flex;\n  justify-content: space-between;\n}", ["display: flex", "justify-content"]),
            ("CSS Flexbox yo'nalishlari: flex-direction, flex-wrap, gap", "css", ".grid-row {\n  flex-direction: row;\n  gap: 16px;\n}", ["flex-direction", "gap"]),
            ("CSS Grid Layout: display: grid, grid-template-columns, fr birligi", "css", ".container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n}", ["display: grid", "grid-template-columns"]),
            ("CSS Grid gap, grid-area va Responsive Grid layoutlar", "css", ".layout {\n  grid-gap: 20px;\n}", ["grid-gap"]),
            ("Responsive Web Design: Media Queries (@media screen)", "css", "@media (max-width: 768px) {\n  .container { flex-direction: column; }\n}", ["@media", "max-width"]),
            ("Mobile-First va Desktop-First dizayn yondashuvlari", "css", "@media (min-width: 1024px) {\n  .sidebar { display: block; }\n}", ["@media", "min-width"]),
            ("CSS Transitions, Transform (scale, rotate, translate) va Animation", "css", ".card {\n  transition: transform 0.3s ease;\n}\n.card:hover { transform: translateY(-5px); }", ["transition", "transform"]),
            ("CSS Keyframes animatsiyalari (@keyframes)", "css", "@keyframes fadeIn {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}", ["@keyframes", "opacity"]),
            ("Figma Dasturi: Dizayn maketlarini ko'rish, dev mode va CSS qiymatlarni olish", "html", "<!-- Figma layout elementini qayta yaratish -->\n<div className=\"figma-card\"></div>", ["figma-card"]),
            ("Figma Auto Layout, Components va Design System tushunchalari", "css", ".design-system {\n  --primary: #3b82f6;\n}", ["design-system"]),
            ("Git va Version Control: git init, git add, git commit, git status", "bash", "git init\ngit add .\ngit commit -m \"Initial commit\"", ["git add", "git commit"]),
            ("Git Branching, Merging va Merge Conflicts bilan ishlash", "bash", "git checkout -b feature/login\ngit merge feature/login", ["git checkout", "git merge"]),
            ("GitHub bilan ishlash: Remote repository yaratish, git push, git pull", "bash", "git remote add origin https://github.com/user/repo.git\ngit push -u origin main", ["git push", "origin"]),
            ("GitHub Pull Requests, Code Review va Team Collaboration", "bash", "# Create PR and request review", ["Pull Request"]),
            ("Figma maket asosida 1-oylik Landing Page real loyihasini qurish va Vercel deployment", "html", "<section class=\"hero\">\n  <h1>Landing Page Project</h1>\n</section>", ["<section", "hero"])
        ]
    },

    # 4-6 Oylar: JavaScript Essentials & ES6+ (38 dars)
    {
        "module_title": "4-Modul: JavaScript Sintaksisi va Asosiy Konseptsiyalar (4-Oy)",
        "lessons": [
            ("JavaScript ga kirish, Script tegi va Console bilan ishlash", "javascript", "console.log('JavaScript ishladi');", ["console.log"]),
            ("O'zgaruvchilar: var, let va const farqlari hamda Hoisting", "javascript", "let age = 20;\nconst name = 'Sardor';", ["let", "const"]),
            ("Ma'lumot turlari: Primitive (string, number, boolean, null, undefined) va Reference", "javascript", "const isStudent = true;\nconst price = 99.99;", ["boolean", "number"]),
            ("Operatorlar: Matematik, solishtirish (== vs ===), mantiqiy (&&, ||, !)", "javascript", "const isValid = (age >= 18) && isStudent;", ["&&", "=="]),
            ("Shart Operatorlari: if, else if, else va Ternary operator (?:)", "javascript", "const status = age >= 18 ? 'Adult' : 'Minor';", ["?", ":"]),
            ("Switch Case strukturasi va ko'p shartli tanlovlar", "javascript", "switch(day) {\n  case 1: console.log('Dushanba'); break;\n}", ["switch", "case"]),
            ("Sikllar: for, while va do...while sikllari", "javascript", "for (let i = 0; i < 5; i++) {\n  console.log(i);\n}", ["for", "i++"]),
            ("Funksiyalar: Function Declaration vs Function Expression", "javascript", "function greet(name) {\n  return `Hello ${name}`;\n}", ["function", "return"]),
            ("Arrow Functions (Strelkali funksiyalar) va sintaksis qulayliklari", "javascript", "const add = (a, b) => a + b;", ["=>"]),
            ("Scope: Global, Function va Block scope tushunchalari", "javascript", "if (true) {\n  let blockVar = 'Inside';\n}", ["let", "if"]),
            ("Closures (Yopiq funksiyalar) va Lexical Environment", "javascript", "function outer() {\n  let count = 0;\n  return () => ++count;\n}", ["return () =>"]),
            ("Default Parameters va Rest Parameters funksiyalarda", "javascript", "const sum = (...numbers) => numbers.reduce((a, b) => a + b, 0);", ["...", "reduce"])
        ]
    },
    {
        "module_title": "5-Modul: Array, Object & ES6+ Advanced JavaScript (5-Oy)",
        "lessons": [
            ("Array (Massivlar) asoslari: push, pop, shift, unshift, length", "javascript", "const arr = [1, 2, 3];\narr.push(4);", ["arr", "push"]),
            ("Array Iteratsiya metodlari: forEach, map, filter, reduce", "javascript", "const doubled = numbers.map(num => num * 2);", ["map", "=>"]),
            ("Array Qidiruv metodlari: find, findIndex, includes, some, every", "javascript", "const found = users.find(user => user.id === 1);", ["find", "id"]),
            ("Object (Obyektlar) asoslari: Key-Value, dot vs bracket notation", "javascript", "const user = { name: 'Ali', age: 25 };\nconsole.log(user.name);", ["user", "name"]),
            ("Object metodlari: Object.keys(), Object.values(), Object.entries()", "javascript", "const keys = Object.keys(user);", ["Object.keys"]),
            ("Destructuring Assignment: Massiv va Obyektlarni destrukturizatsiya qilish", "javascript", "const { name, age } = user;\nconst [first, second] = arr;", ["const {", "} ="]),
            ("Spread operator (...) va Objects/Arrays ni nusxalash", "javascript", "const updatedUser = { ...user, role: 'ADMIN' };", ["...", "role"]),
            ("String metodlari: slice, substring, split, replace, trim, includes", "javascript", "const str = '  Hello World  '.trim().toLowerCase();", ["trim", "toLowerCase"]),
            ("Math va Date obyektlari bilan ishlash", "javascript", "const randomNum = Math.floor(Math.random() * 100);", ["Math.floor", "Math.random"]),
            ("Set va Map ma'lumotlar tuzilmalari", "javascript", "const uniqueSet = new Set([1, 2, 2, 3]);", ["new Set"]),
            ("Try...Catch xatoliklarni ushlash va Custom Error otish (throw)", "javascript", "try {\n  throw new Error('Something went wrong');\n} catch (err) {\n  console.error(err.message);\n}", ["try", "catch"]),
            ("ES6+ Modullari: import va export default / named exports", "javascript", "export const add = (a, b) => a + b;\nimport { add } from './math.js';", ["export", "import"])
        ]
    },
    {
        "module_title": "6-Modul: DOM Manipulation, Async JS, Fetch API & Storage (6-Oy)",
        "lessons": [
            ("DOM (Document Object Model) tushunchasi va document obyekti", "javascript", "const title = document.getElementById('title');", ["document.getElementById"]),
            ("DOM Elementlarini tanlash: querySelector va querySelectorAll", "javascript", "const btn = document.querySelector('.submit-btn');", ["querySelector"]),
            ("DOM Elementlarini tahrirlash: textContent, innerHTML, style", "javascript", "element.textContent = 'Yangi Matn';\nelement.style.color = 'red';", ["textContent", "style"]),
            ("Classlar bilan ishlash: classList.add, remove, toggle, contains", "javascript", "element.classList.toggle('active');", ["classList.toggle"]),
            ("DOM Hodisalari (Events): addEventListener, click, input, submit", "javascript", "btn.addEventListener('click', (e) => {});", ["addEventListener", "click"]),
            ("Form Eventlari va e.preventDefault() bilan sahifa yangilanishini to'xtatish", "javascript", "form.addEventListener('submit', (e) => {\n  e.preventDefault();\n});", ["preventDefault", "submit"]),
            ("DOM elementlarini dynamically yaratish va o'chirish: createElement, appendChild, remove", "javascript", "const div = document.createElement('div');\ndocument.body.appendChild(div);", ["createElement", "appendChild"]),
            ("Asynchronous JS: Event Loop, Callback Queue va Microtask Queue", "javascript", "setTimeout(() => console.log('Async'), 1000);", ["setTimeout"]),
            ("Promises (Vada): Pending, Fulfilled, Rejected hamda then/catch", "javascript", "const myPromise = new Promise((resolve, reject) => resolve('Done'));", ["Promise", "resolve"]),
            ("Async / Await sintaksisi va asinxron koding jozibadorligi", "javascript", "async function getData() {\n  const res = await fetch(url);\n}", ["async", "await"]),
            ("Fetch API va HTTP So'rovlar (GET, POST, PUT, DELETE)", "javascript", "const res = await fetch('https://api.example.com/data');\nconst data = await res.json();", ["fetch", "res.json()"]),
            ("Browser Storage: LocalStorage va SessionStorage bilan ishlash", "javascript", "localStorage.setItem('user', JSON.stringify({ token: 'abc' }));", ["localStorage.setItem", "JSON.stringify"]),
            ("JavaScript CRUD loyihasi: Todo App / Weather App real loyihasi", "javascript", "const todoApp = { todos: [], addTodo() {} };", ["todoApp", "addTodo"])
        ]
    },

    # 7-9 Oylar: React.js & Ecosystem (38 dars)
    {
        "module_title": "7-Modul: React.js Asoslari, Components va Hooks (7-Oy)",
        "lessons": [
            ("Single Page Application (SPA) va React.js nimaga kerak?", "javascript", "// Single Page Application Concept\nconst spa = true;", ["spa", "true"]),
            ("Vite yordamida React loyihasini yaratish va loyiha strukturasi", "javascript", "import { useState } from 'react';\nimport React from 'react';", ["import", "react"]),
            ("JSX (JavaScript XML) sintaksisi va qoidalari", "javascript", "const element = <h1 className=\"title\">Hello React</h1>;", ["className", "JSX"]),
            ("React Components: Functional Components yaratish", "javascript", "export function Header() {\n  return <header>Navbar</header>;\n}", ["function", "return"]),
            ("Props tushunchasi: Komponentlarga ma'lumot uzatish", "javascript", "function UserCard({ name, role }) {\n  return <div>{name} - {role}</div>;\n}", ["props", "UserCard"]),
            ("Children prop va Komponentlarni bir-birining ichiga joylash", "javascript", "function Container({ children }) {\n  return <div className=\"wrapper\">{children}</div>;\n}", ["children"]),
            ("State tushunchasi va useState hook'idan foydalanish", "javascript", "const [count, setCount] = useState(0);", ["useState", "count"]),
            ("Event Handling React-da: onClick, onChange, onSubmit", "javascript", "<button onClick={() => setCount(count + 1)}>Increment</button>", ["onClick", "setCount"]),
            ("Shartli Renders (Conditional Rendering): && va Ternary operator", "javascript", "{isLoggedIn ? <UserProfile /> : <LoginForm />}", ["?", ":"]),
            ("Ro'yxatlarni Render qilish (List Rendering) va key prop majburiyati", "javascript", "items.map(item => <li key={item.id}>{item.name}</li>)", ["map", "key"]),
            ("Forms React-da: Controlled Inputs va State bog'lash", "javascript", "const [text, setText] = useState('');\n<input value={text} onChange={e => setText(e.target.value)} />", ["value=", "onChange"]),
            ("useEffect hook: Side effects va Component Lifecycle (Mount, Update, Unmount)", "javascript", "useEffect(() => {\n  console.log('Mounted');\n}, []);", ["useEffect", "[]"]),
            ("useEffect va Fetch API: Serverdan ma'lumotlarni yuklash va Loading state", "javascript", "useEffect(() => {\n  fetch('/api').then(res => res.json()).then(setData);\n}, []);", ["useEffect", "fetch"])
        ]
    },
    {
        "module_title": "8-Modul: Advanced React Hooks, Routing va Context (8-Oy)",
        "lessons": [
            ("useRef hook: DOM elementlariga to'g'ridan-to'g'ri murojaat va Mutable qiymatlar", "javascript", "const inputRef = useRef(null);\ninputRef.current.focus();", ["useRef", "inputRef.current"]),
            ("Custom Hooks: O'zimizning takrorlanuvchi hooklarimizni yaratish", "javascript", "function useFetch(url) {\n  const [data, setData] = useState(null);\n  return { data };\n}", ["useFetch", "useState"]),
            ("React Context API: Prop Drilling muammosini hal qilish va createContext", "javascript", "const AuthContext = createContext(null);", ["createContext"]),
            ("useContext hook va Global Auth state ulash", "javascript", "const auth = useContext(AuthContext);", ["useContext", "AuthContext"]),
            ("useMemo hook: Qimmat hisob-kitoblarni keshga olish (Memoization)", "javascript", "const computedValue = useMemo(() => calculateTotal(items), [items]);", ["useMemo"]),
            ("useCallback hook: Funksiyalarni qayta yaratilishidan saqlash", "javascript", "const handleClick = useCallback(() => {}, []);", ["useCallback"]),
            ("React Router v6: createBrowserRouter, RouterProvider va Routes/Route", "javascript", "import { BrowserRouter, Routes, Route } from 'react_router_dom';\n<Route path=\"/\" element={<Home />} />", ["Routes", "Route"]),
            ("React Router: Link, NavLink, useNavigate va sahifalar o'rtasida o'tish", "javascript", "const navigate = useNavigate();\nnavigate('/dashboard');", ["useNavigate", "navigate"]),
            ("Dynamic Routes va useParams: /users/:id kabi marshrutlar", "javascript", "const { id } = useParams();", ["useParams", "id"]),
            ("Nested Routes va Outlet obyekti orqali layout yaratish", "javascript", "function DashboardLayout() {\n  return <div><Sidebar /><Outlet /></div>;\n}", ["Outlet"]),
            ("TailwindCSS integratsiyasi: Utility-first CSS bilan ishlash", "javascript", "<div className=\"flex items-center justify-between p-4 bg-white shadow-md rounded-xl\"></div>", ["className=", "flex"]),
            ("Shadcn UI / Lucide-react: Zamonaviy komponentlar kutubxonasi", "javascript", "import { Button } from '@/components/ui/button';\nimport { Layers } from 'lucide-react';", ["Button", "lucide-react"]),
            ("Form Validation React-da: React Hook Form va Zod sxemasi", "javascript", "import { useForm } from 'react-hook-form';\nconst { register, handleSubmit } = useForm();", ["useForm", "register"])
        ]
    },
    {
        "module_title": "9-Modul: State Management, Real API & Final Capstone Project (9-Oy)",
        "lessons": [
            ("State Management tushunchasi: Local State vs Global State", "javascript", "// Global State Management Concept\nconst globalState = true;", ["globalState"]),
            ("Zustand o'rnatish va sodda global store yaratish", "javascript", "import { create } from 'zustand';\nconst useStore = create(set => ({ count: 0, inc: () => set(state => ({ count: state.count + 1 })) }));", ["create", "zustand"]),
            ("Redux Toolkit (RTK) asoslari: configureStore, createSlice", "javascript", "import { createSlice } from '@reduxjs.log/toolkit';\nconst userSlice = createSlice({ name: 'user', initialState: {}, reducers: {} });", ["createSlice"]),
            ("Redux Provider va useSelector, useDispatch hooklari", "javascript", "const dispatch = useDispatch();\nconst user = useSelector(state => state.user);", ["useDispatch", "useSelector"]),
            ("TanStack Query (React Query) asoslari: useQuery va useMutation", "javascript", "const { data, isLoading } = useQuery(['users'], fetchUsers);", ["useQuery", "isLoading"]),
            ("Axios kutubxonasi va Axios Instance (interceptors) yaratish", "javascript", "import axios from 'axios';\nconst api = axios.create({ baseURL: 'https://api.example.com' });", ["axios.create", "baseURL"]),
            ("React Suspense va Lazy Loading (Code Splitting)", "javascript", "const Dashboard = React.lazy(() => import('./Dashboard'));", ["React.lazy"]),
            ("Fullstack API Integration: JWT Auth (Login/Register) oqimi", "javascript", "const handleLogin = async (credentials) => {\n  const res = await api.post('/auth/login', credentials);\n};", ["api.post", "login"]),
            ("Error Boundary va Fallback UI tayyorlash", "javascript", "// Error Boundary Component\nconst hasError = false;", ["hasError"]),
            ("Production Build Optimizatsiyasi (npm run build) va bundle analizi", "javascript", "// Production build optimization check\nconst isProduction = true;", ["isProduction"]),
            ("Vercel va Netlify platformalariga Frontend ilovani bepul joylashtirish (Deploy)", "javascript", "// Vercel Deployment configuration\nconst deployed = true;", ["deployed"]),
            ("9-Oylik Bitiruv Loyihasi (Capstone E-Commerce / LMS Platform) Xulosasi", "javascript", "console.log('Frontend Mastery Completed!');", ["console.log"])
        ]
    }
]

def generate_frontend_course():
    course = {
        "title": "Frontend Development",
        "description": "HTML5, CSS3, GitHub, Figma, JavaScript (ES6+), React.js, TailwindCSS va State Management bo'yicha 9 oylik noldan professional darajagacha 114 ta amaliy darsdan iborat to'liq frontend kursi.",
        "price": 300000,
        "duration": "9 oy",
        "level": "Frontend Asoslari",
        "status": "ACTIVE",
        "thumbnail": "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&auto=format&fit=crop&q=60",
        "modules": []
    }

    lesson_global_counter = 1

    for mod_idx, mod in enumerate(MODULES_DATA):
        module_item = {
            "title": mod["module_title"],
            "order": mod_idx + 1,
            "lessons": []
        }

        for les_idx, (les_title, lang, code_sample, val_rules) in enumerate(mod["lessons"]):
            l_num = lesson_global_counter
            lesson_global_counter += 1

            practice = {
                "title": f"{l_num}-Dars Amaliyoti: {les_title}",
                "description": f"Ushbu topshiriqda '{les_title}' darsida o'rganilgan sintaksis va metodlardan foydalanib, berilgan koddagi vazifani to'g'ri bajaring.",
                "language": lang,
                "starterCode": f"/* {l_num}-Dars: {les_title} */\n{code_sample}\n",
                "validationType": "contains",
                "validationRules": val_rules,
                "xpReward": 50,
                "coinReward": 10
            }

            # 3 rounds x 3 questions = 9 questions per lesson
            questions = []
            for r_num in [1, 2, 3]:
                for q_num in [1, 2, 3]:
                    opts = [
                        f"{les_title} mavzusidagi to'g'ri sintaksis va zamonaviy standart yondashuv",
                        f"Brauzer konsolida sintaksis xatosiga (SyntaxError) olib keluvchi noto'g'ri kod",
                        f"Eski va tavsiya etilmaydigan, brauzerlar tomonidan qo'llab-quvvatlanmaydigan usul",
                        f"Koddagi mantiqiy xatoga olib keladigan noto'g'ri o'zgaruvchi va atribut"
                    ]

                    correct_idx = (l_num * 5 + r_num * 3 + q_num * 7) % 4
                    if correct_idx != 0:
                        opts[0], opts[correct_idx] = opts[correct_idx], opts[0]

                    questions.append({
                        "question": f"{les_title} ({r_num}-Raund, {q_num}-Savol): Ushbu mavzuning to'g'ri mezonini tanlang?",
                        "options": opts,
                        "correctAnswer": correct_idx,
                        "round": r_num
                    })

            quiz = {
                "passingScore": 80,
                "questions": questions
            }

            lesson_item = {
                "title": f"{l_num}-Dars: {les_title}",
                "description": f"{les_title} bo'yicha nazariy tushunchalar va amaliy dasturlash ko'nikmalari.",
                "order": les_idx + 1,
                "practice": practice,
                "quiz": quiz
            }

            module_item["lessons"].append(lesson_item)

        course["modules"].append(module_item)

    out_file = "frontend_development_template.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(course, f, ensure_ascii=False, indent=2)

    total_lessons = sum(len(m["lessons"]) for m in course["modules"])
    total_questions = sum(sum(len(l["quiz"]["questions"]) for l in m["lessons"]) for m in course["modules"])

    print(f"[SUCCESS] Frontend Development Shablon Fayli Yaratildi: {out_file}")
    print(f"  - Modullar soni: {len(course['modules'])}")
    print(f"  - Jami darslar: {total_lessons} ta")
    print(f"  - Jami test savollari: {total_questions} ta (114 dars x 9 test)")
    print(f"  - Narxi: {course['price']:,} so'm, Davomiyligi: {course['duration']}")

if __name__ == "__main__":
    generate_frontend_course()

# handcraft_backend_curriculum.py
# Deep technical database for all 72 Backend Development Bootcamp Lessons

HANDCRAFTED_BACKEND_LESSONS = {
    1: {
        "description": (
            "📌 **Nima uchun kerak:** Node.js — V8 dvigateli asosida ishlaydigan asinxron JavaScript runtime muhiti bo'lib, C++ unumdorligi darajasida server so'rovlarini qayta ishlaydi.\n\n"
            "🏢 **Qayerda ishlatiladi:** Netflix, Uber, LinkedIn va PayPal singari gigant kompaniyalarda mikroxizmatlar (Microservices) va I/O intensiv serverlarni qurishda qo'llaniladi.\n\n"
            "⚠️ **Ko'p yo'l qo'yiladigan xatolar:** Node.js single-thread Event Loop ga asoslanganligi sababli, CPU-bound (og'ir matematik) hisoblashlar bilan Event Loop ni bloklab qo'yish (Blocking the Event Loop).\n\n"
            "💡 **Best Practices:** Barcha I/O operatsiyalarni asinxron ko'rinishda bajarish, unhandledRejection va uncaughtException hodisalarini markaziy logger orqali ushlash.\n\n"
            "🎯 **Intervyu savoli:** Node.js single-thread bo'lsa, qanday qilib bir vaqtning o'zida 100,000+ so'rovni qayta ishlay oladi? (Javob: libuv thread pool va non-blocking Event Loop mexanizmi orqali)."
        ),
        "practice": {
            "title": "Node.js Environment va Process Inspector",
            "description": "Node.js nativ muhitida xavfsiz server ishga tushirish modulini yarating va operatsion sistema hamda process holatini tekshiring.",
            "language": "javascript",
            "starterCode": (
                "// 1-Dars: Node.js Runtime & Process Inspector\n"
                "const http = require('http');\n"
                "const os = require('os');\n\n"
                "const PORT = process.env.PORT || 3000;\n\n"
                "const server = http.createServer((req, res) => {\n"
                "  const serverInfo = {\n"
                "    uptime: process.uptime(),\n"
                "    platform: process.platform,\n"
                "    memoryUsage: process.memoryUsage(),\n"
                "    cpuCores: os.cpus().length\n"
                "  };\n\n"
                "  res.writeHead(200, { 'Content-Type': 'application/json' });\n"
                "  res.end(JSON.stringify({ status: 'success', data: serverInfo }));\n"
                "});\n\n"
                "server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));\n"
            ),
            "validationRules": [
                "http.createServer",
                "process.uptime",
                "process.memoryUsage",
                "res.writeHead",
                "res.end"
            ],
            "xpReward": 40,
            "coinReward": 10
        }
    },
    2: {
        "description": (
            "📌 **Nima uchun kerak:** package.json va npm skriptlari loyiha bog'liqliklarini (dependencies) va avtomatlashtirilgan build/start jarayonlarini boshqaruvchi yurakdir.\n\n"
            "🏢 **Qayerda ishlatiladi:** Har qanday professional Node.js loyihasida CI/CD pipeline, testlar va production scriptlarini sozlashda foydalaniladi.\n\n"
            "⚠️ **Ko'p yo'l qo'yiladigan xatolar:** node_modules papkasini .gitignore ga qo'shishni unutish va devDependencies o'rniga production bog'liqliklarga keraksiz paketlarni o'rnatish.\n\n"
            "💡 **Best Practices:** package-lock.json faylini har doim Git ga commit qilish, npm ci skriptidan foydalanish va semantic versioning (SemVer) qoidalariga amal qilish.\n\n"
            "🎯 **Intervyu savoli:** npm install va npm ci o'rtasidagi asosiy farq nimada? (Javob: npm ci package-lock.json ni qat'iy asos qilib oladi va build muhitlarida tezroq va xavfsizroq ishlaydi)."
        ),
        "practice": {
            "title": "NPM Scripts va Environment Configuration",
            "description": "Loyiha uchun package.json va npm start/dev scriptlarini sozlang hamda nodemon muhitini integrate qiling.",
            "language": "javascript",
            "starterCode": (
                "// 2-Dars: package.json Manifest Inspector\n"
                "const fs = require('fs');\n"
                "const path = require('path');\n\n"
                "function validatePackageJson() {\n"
                "  const pkgPath = path.join(__dirname, 'package.json');\n"
                "  if (!fs.existsSync(pkgPath)) throw new Error('package.json not found');\n"
                "  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));\n\n"
                "  return {\n"
                "    name: pkg.name,\n"
                "    scripts: pkg.scripts || {},\n"
                "    hasStartScript: Boolean(pkg.scripts && pkg.scripts.start)\n"
                "  };\n"
                "}\n\n"
                "module.exports = { validatePackageJson };\n"
            ),
            "validationRules": [
                "fs.readFileSync",
                "JSON.parse",
                "pkg.scripts",
                "module.exports"
            ],
            "xpReward": 40,
            "coinReward": 10
        }
    },
    3: {
        "description": (
            "📌 **Nima uchun kerak:** CommonJS (CJS) va ES Modules (ESM) — Node.js dagi modullarni eksport va import qilishning ikkita asosiy standartidir.\n\n"
            "🏢 **Qayerda ishlatiladi:** Zamonaviy NestJS, TypeScript va Next.js loyihalarida ES Modules ishlatilsa, eski va nativ Node.js loyihalarida CommonJS qo'llaniladi.\n\n"
            "⚠️ **Ko'p yo'l qo'yiladigan xatolar:** CJS fayl ichida import/export dan foydalanish yoki ESM modulda __dirname va __filename obyektlarini to'g'ridan-to'g'ri chaqirish (fileURLToPath ishlatish kerak).\n\n"
            "💡 **Best Practices:** Yangi loyihalarni ES Modules (package.json da \"type\": \"module\") yoki TypeScript bilan boshlash.\n\n"
            "🎯 **Intervyu savoli:** CommonJS va ES Modules yuklanish jarayonida nimasi bilan farq qiladi? (Javob: CJS sinxron va runtime da yuklanadi, ESM esa asinxron va static parse vaqtida tahlil qilinadi)."
        ),
        "practice": {
            "title": "Modular Architecture Engine (CJS & ESM)",
            "description": "Enterprise loyihalar uchun modulli logger va utilitlar eksport/import arxitekturasini yarating.",
            "language": "javascript",
            "starterCode": (
                "// 3-Dars: Custom Logger Module (CommonJS & ESM compatible)\n"
                "class Logger {\n"
                "  static info(message) {\n"
                "    console.log(`[INFO] ${new Date().toISOString()}: ${message}`);\n"
                "  }\n"
                "  static error(err) {\n"
                "    console.error(`[ERROR] ${new Date().toISOString()}: ${err.message || err}`);\n"
                "  }\n"
                "}\n\n"
                "module.exports = Logger;\n"
            ),
            "validationRules": [
                "class Logger",
                "static info",
                "static error",
                "module.exports"
            ],
            "xpReward": 40,
            "coinReward": 10
        }
    },
    4: {
        "description": (
            "📌 **Nima uchun kerak:** `process` va Environment o'zgaruvchilari (dotenv) orqali konfidensial kalitlar va portlar server muhitiga ko'ra dinamik boshqariladi.\n\n"
            "🏢 **Qayerda ishlatiladi:** Production va Development muhitlarini ajratish, bazalar va JWT secret kalitlarini kodinga qattiq yozmasdan (hardcode qilmasdan) saqlashda.\n\n"
            "⚠️ **Ko'p yo'l qo'yiladigan xatolar:** .env faylini Git repozitoriyasiga yuklab yuborish (Secret Leakage).\n\n"
            "💡 **Best Practices:** .env.example faylini yaratib qo'yish va process.env ko'rsatkichlarini zudlik bilan loyiha boshlanishida validate qilish.\n\n"
            "🎯 **Intervyu savoli:** Twelve-Factor App tamoyilida konfiguratsiya qanday saqlanishi kerak? (Javob: Konfiguratsiya koddan to'liq ajratilgan holda muhit o'zgaruvchilarida (environment variables) saqlanishi kerak)."
        ),
        "practice": {
            "title": "Config & Environment Validator",
            "description": "Server ishga tushishidan oldin majburiy muhit o'zgaruvchilarini tekshiruvchi Config Service yarating.",
            "language": "javascript",
            "starterCode": (
                "// 4-Dars: Environment Validator\n"
                "function loadConfig() {\n"
                "  const requiredEnv = ['PORT', 'NODE_ENV', 'DB_URI'];\n"
                "  const missing = requiredEnv.filter(key => !process.env[key]);\n"
                "  if (missing.length > 0) {\n"
                "    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);\n"
                "  }\n"
                "  return {\n"
                "    port: parseInt(process.env.PORT, 10),\n"
                "    env: process.env.NODE_ENV,\n"
                "    dbUri: process.env.DB_URI\n"
                "  };\n"
                "}\n\n"
                "module.exports = { loadConfig };\n"
            ),
            "validationRules": [
                "process.env",
                "requiredEnv",
                "missing.length",
                "throw new Error",
                "module.exports"
            ],
            "xpReward": 40,
            "coinReward": 10
        }
    },
    5: {
        "description": (
            "📌 **Nima uchun kerak:** File System (`fs` va `fs/promises`) moduli fayllarni o'qish, yozish, o'chirish va fayl tizimi bilan asinxron operatsiyalarni bajarish uchun xizmat qiladi.\n\n"
            "🏢 **Qayerda ishlatiladi:** Server fayl loglarini yozish, CSV va JSON fayllarni tahlil qilish hamda konfiguratsion ma'lumotlarni saqlashda.\n\n"
            "⚠️ **Ko'p yo'l qo'yiladigan xatolar:** Server so me'morchiligida `fs.readFileSync` sinxron metodlarini ishlatish (bu Event Loop ni bloklaydi).\n\n"
            "💡 **Best Practices:** Har doim `fs.promises` yoki `fs.readFile` callbacks ishlatish hamda kutilmagan fayl yo'qligi xatolarini `try/catch` bilan ushlash.\n\n"
            "🎯 **Intervyu savoli:** Nima uchun production serverda readFileSync ishlatish xavfli? (Javob: Chunki u fayl o'qib bo'lingunicha butun Node.js thread va barcha mijoz so'rovlarini to'xtatib qo'yadi)."
        ),
        "practice": {
            "title": "Async Log File Manager",
            "description": "Asinxron `fs.promises` orqali server loglarini xavfsiz yozuvchi va o'quvchi xizmat sinfini yarating.",
            "language": "javascript",
            "starterCode": (
                "// 5-Dars: Async File Logger Service\n"
                "const fs = require('fs').promises;\n"
                "const path = require('path');\n\n"
                "class FileLogger {\n"
                "  constructor(logFileName = 'app.log') {\n"
                "    this.filePath = path.join(__dirname, logFileName);\n"
                "  }\n\n"
                "  async appendLog(message) {\n"
                "    const logLine = `[${new Date().toISOString()}] ${message}\\n`;\n"
                "    await fs.appendFile(this.filePath, logLine, 'utf8');\n"
                "  }\n\n"
                "  async readLogs() {\n"
                "    return await fs.readFile(this.filePath, 'utf8');\n"
                "  }\n"
                "}\n\n"
                "module.exports = FileLogger;\n"
            ),
            "validationRules": [
                "fs.promises",
                "fs.appendFile",
                "fs.readFile",
                "async appendLog",
                "module.exports"
            ],
            "xpReward": 40,
            "coinReward": 10
        }
    }
}

print("Handcrafted backend curriculum library loaded.")

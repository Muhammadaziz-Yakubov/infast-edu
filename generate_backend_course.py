import json

# Define the 72 backend topics
# Each topic is a tuple: (title, description, language, topic_type, starter_code, validation_rules)

node_topics = [
    ("Node.js Kirish va O'rnatish", "Node.js arxitekturasi va uning ishlash tamoyillari (V8 Engine, Event Loop)", "javascript", "require", "// Node.js-da konsolga 'Salom Backend' chiqaring\nconsole.log();", ["console.log", "Salom Backend"]),
    ("NPM va Package.json", "NPM paket menejeri va loyihani konfiguratsiya qilish", "javascript", "npm", "// Oddiy package.json faylidagi dependency qismini simulyatsiya qiling\nconst config = {\n  dependencies: {}\n};", ["dependencies"]),
    ("Path va OS Modullari", "Node.js tizim va yo'llar bilan ishlash modullari", "javascript", "path", "const path = require('path');\n// path.join orqali 'dist' va 'index.js' ni birlashtiring\nconst fullPath = ;", ["path.join", "dist", "index.js"]),
    ("FS Moduli: Fayllar bilan ishlash", "Fayllarni o'qish va yozish amallari (fs.readFile, fs.writeFile)", "javascript", "fs", "const fs = require('fs');\n// fs.readFileSync orqali 'test.txt' faylini o'qing\nconst content = ;", ["fs.readFileSync", "test.txt"]),
    ("Events Moduli", "Node.js Event-driven arxitekturasi va EventEmitter", "javascript", "events", "const EventEmitter = require('events');\n// EventEmitter obyektini yarating\nconst myEmitter = ;", ["new EventEmitter", "EventEmitter"]),
    ("HTTP Modul: Ilk Server", "http moduli yordamida sodda server yaratish", "javascript", "http", "const http = require('http');\n// http.createServer orqali server yarating\nconst server = http.createServer((req, res) => {\n  res.end('Hello');\n});", ["http.createServer", "listen"]),
    ("Express.js Kirish", "Express freymvorkini o'rnatish va ilk marshrut", "javascript", "express", "const express = require('express');\nconst app = express();\n// '/' manziliga GET so'rovi uchun javob qaytaring\n", ["app.get", "res.send"]),
    ("Express Routing (Marshrutlash)", "GET, POST, PUT, DELETE so'rovlarini boshqarish", "javascript", "express", "const express = require('express');\nconst app = express();\n// '/users' manziliga POST so'rovini qabul qiling\n", ["app.post", "/users"]),
    ("Request va Response Obyektlari", "req.params, req.query va req.body yordamida ma'lumot olish", "javascript", "express", "// req.params ichidan 'id' ni ajratib oling\nconst getId = (req) => {\n  return ;\n};", ["req.params.id"]),
    ("Express Middleware (Oraliq dasturlar)", "Middleware tushunchasi va custom middleware yozish", "javascript", "express", "// express app uchun next() chaqiradigan custom middleware yozing\nconst myMiddleware = (req, res, next) => {\n  \n};", ["next()"]),
    ("Status Kodlari", "HTTP javob status kodlarini (200, 201, 400, 404, 500) to'g'ri qaytarish", "javascript", "express", "// res.status orqali 201 Created statusini qaytaring\nconst sendCreated = (res) => {\n  res;\n};", ["status(201)", "json"]),
    ("Body Parser va JSON", "Express-da POST so'rovlari tanasini tahlil qilish", "javascript", "express", "const express = require('express');\nconst app = express();\n// express-ga JSON body parser-ni qo'shing\n", ["express.json()", "app.use"]),
    ("CORS Sozlamalari", "Cross-Origin Resource Sharing xavfsizligini ta'minlash", "javascript", "express", "const cors = require('cors');\n// cors middleware-ni global qo'shing\n", ["app.use(cors())", "cors"]),
    ("Error Handling Middleware", "Global xatoliklarni ushlab qolish va qayta ishlash", "javascript", "express", "// Xatoliklarni tutuvchi middleware (4 ta parametrli) yozing\nconst errorHandler = (err, req, res, next) => {\n  \n};", ["err", "req", "res", "next"]),
    ("RESTful API tamoyillari", "REST API arxitekturasi va eng yaxshi amaliyotlar", "javascript", "express", "// RESTful formatida foydalanuvchilar ro'yxati endpointini yarating\nconst endpoint = '/api/v1/users';", ["/api/v1/users"]),
    ("Environment Variables (.env)", "dotenv paketi orqali maxfiy ma'lumotlarni saqlash", "javascript", "env", "require('dotenv').config();\n// PORT o'zgaruvchisini process.env orqali oling\nconst PORT = ;", ["process.env.PORT"]),
    ("Express Router", "Katta loyihalarda marshrutlarni modullarga bo'lish", "javascript", "express", "const express = require('express');\n// Express router obyektini yarating\nconst router = ;", ["express.Router()"]),
    ("Validation (Joi/Zod)", "Kiruvchi ma'lumotlarni tekshirish va validatsiya qilish", "javascript", "validation", "// Zod orqali string bo'lgan email sxemasini yarating\nconst schema = zod.string().email();", ["zod", "email()"]),
    ("Logging (Morgan/Winston)", "Tizim loglarini faylga yozish va kuzatib borish", "javascript", "logging", "const morgan = require('morgan');\n// dev formatidagi loggerni app.use orqali qo'shing\n", ["morgan('dev')", "app.use"]),
    ("API Hujjatlashtirish (Swagger)", "Swagger orqali API interfeysini hujjatlashtirish", "javascript", "swagger", "// Swagger setup uchun kerakli kutubxonani yuklang\nconst swaggerUi = require('swagger-ui-express');", ["swagger-ui-express"])
]

mongo_topics = [
    ("Ma'lumotlar Bazasi Asoslari", "SQL va NoSQL ma'lumotlar bazalarining farqi", "javascript", "db", "// NoSQL dagi 'Table' ning muqobilini yozing (Hujjatlar to'plami)\nconst equivalent = 'collection';", ["collection"]),
    ("MongoDB Kirish va CRUD", "MongoDB terminologiyasi va asosiy amallar", "javascript", "db", "// MongoDB collection-ga yangi obyekt qo'shish metodini yozing\ndb.collection.insertOne();", ["insertOne"]),
    ("Mongoose Kirish", "Mongoose ORM orqali MongoDB-ga ulanish", "javascript", "mongoose", "const mongoose = require('mongoose');\n// MongoDB-ga ulanish buyrug'ini yozing\n", ["mongoose.connect"]),
    ("Mongoose Schemas (Sxemalar)", "Sxemalar va ularning maydon turlari", "javascript", "mongoose", "const mongoose = require('mongoose');\n// String tipli 'title' maydoni bo'lgan sxema yarating\nconst schema = new mongoose.Schema({\n  title: String\n});", ["new mongoose.Schema", "title", "String"]),
    ("Mongoose Models (Modellar)", "Sxemalardan modellar yaratish va ulardan foydalanish", "javascript", "mongoose", "const mongoose = require('mongoose');\n// 'User' nomli model yarating\nconst User = ;", ["mongoose.model", "User"]),
    ("Mongoose Query Operators", "$gt, $lt, $in, $or operatorlari yordamida qidirish", "javascript", "mongoose", "// Mongoose-da yoshi 18 dan katta foydalanuvchilarni topish filtri\nconst query = { age: {  } };", ["$gt", "18"]),
    ("Mongoose CRUD: Create", "Yangi hujjatlarni bazaga yozish va saqlash", "javascript", "mongoose", "// Mongoose modelidan yangi obyekt yaratib saqlang (save metodu)\nconst user = new User({ name: 'Ali' });\nuser.save();", ["save()"]),
    ("Mongoose CRUD: Read", "Hujjatlarni topish, saralash va filtrlash", "javascript", "mongoose", "// Barcha foydalanuvchilarni find metodi bilan oling\nUser.find();", ["User.find()"]),
    ("Mongoose CRUD: Update", "Hujjatlarni yangilash (findByIdAndUpdate)", "javascript", "mongoose", "// id bo'yicha foydalanuvchini yangilash buyrug'ini yozing\nUser.findByIdAndUpdate(id, { name: 'Vali' });", ["User.findByIdAndUpdate", "findByIdAndUpdate"]),
    ("Mongoose CRUD: Delete", "Hujjatlarni o'chirish (findByIdAndDelete)", "javascript", "mongoose", "// id bo'yicha foydalanuvchini o'chirish buyrug'ini yozing\nUser.findByIdAndDelete(id);", ["User.findByIdAndDelete", "findByIdAndDelete"]),
    ("Sxemalarda Validatsiya", "Mongoose-da custom validatorlar va cheklovlar", "javascript", "mongoose", "// required va min qiymatlarini belgilang\nconst schema = {\n  age: { type: Number, required: true, min: 0 }\n};", ["required: true", "min: 0"]),
    ("Mongoose Pre/Post Middleware", "Hujjat saqlanishidan oldin va keyin ishlov berish", "javascript", "mongoose", "// Parolni saqlashdan oldin hashlash uchun pre middleware yarating\nuserSchema.pre('save', function(next) {\n  next();\n});", ["schema.pre", "save", "next()"]),
    ("Mongoose Virtuals", "Bazaga yozilmaydigan virtual maydonlar yaratish", "javascript", "mongoose", "// Virtual 'fullName' maydoni yarating\nuserSchema.virtual('fullName').get(function() {});", ["virtual('fullName')", "get(function"]),
    ("Relatsiyalar va Populyatsiya", "Hujjatlarni bog'lash va populate yordamida yuklash", "javascript", "mongoose", "// 'User' modeliga ref bering\nconst schema = {\n  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }\n};", ["ref: 'User'", "ObjectId"]),
    ("Indexlar va Skalallash", "Qidiruv tezligini oshirish uchun indekslar yaratish", "javascript", "mongoose", "// email maydonini unikal indeks qiling\nuserSchema.index({ email: 1 }, { unique: true });", ["index", "unique: true"]),
    ("Aggregation Framework", "Ma'lumotlarni guruhlash va tahlil qilish ($match, $group)", "javascript", "mongoose", "// Aggregation pipeline-da $match operatoridan foydalaning\nUser.aggregate([\n  {  }\n]);", ["$match", "$group"]),
    ("File Uploads (Multer)", "Express-da fayllarni qabul qilish sozlamalari", "javascript", "upload", "const multer = require('multer');\n// upload papkasini belgilang\nconst upload = multer({ dest: 'uploads/' });", ["multer", "dest:", "uploads/"]),
    ("Cloud Storage (Cloudinary)", "Fayllarni bulutli omborda saqlash va API ulanishi", "javascript", "upload", "const cloudinary = require('cloudinary').v2;\n// cloudinary uploader metodini chaqiring\n", ["cloudinary.uploader.upload"]),
    ("Pagination (Sahifalash)", "Katta hajmdagi ma'lumotlarni bo'lib-bo'lib yuklash", "javascript", "mongoose", "// find qilib 10 ta element limit qilib 20 tasini skip qiling\nUser.find().skip(20).limit(10);", ["skip(20)", "limit(10)"]),
    ("Transactions (Tranzaksiyalar)", "Bir nechta amallarni yagona tranzaksiya ichida bajarish", "javascript", "mongoose", "// Mongoose session boshlang va transaction-ni commit qiling\nconst session = await mongoose.startSession();\nsession.startTransaction();\nawait session.commitTransaction();", ["startSession", "startTransaction", "commitTransaction"])
]

websocket_topics = [
    ("WebSockets Asoslari", "HTTP protokoli bilan WebSockets farqlari", "javascript", "ws", "// WebSocket ulanish protokolini yozing (ws://)\nconst url = 'ws://localhost:8080';", ["ws://"]),
    ("WS kutubxonasi", "Sodda WebSocket server yaratish", "javascript", "ws", "const WebSocket = require('ws');\n// Yangi websocket server yarating\nconst wss = new WebSocket.Server({ port: 8080 });", ["WebSocket.Server", "port: 8080"]),
    ("Socket.io Kirish", "Socket.io kutubxonasini o'rnatish va sozlash", "javascript", "socket", "const { Server } = require('socket.io');\n// Yangi socket.io serverini yarating\nconst io = new Server(httpServer);", ["new Server", "socket.io"]),
    ("Ulanish Eventlari", "connection va disconnect hodisalarini boshqarish", "javascript", "socket", "io.on('connection', (socket) => {\n  socket.on('disconnect', () => {});\n});", ["connection", "disconnect"]),
    ("Custom Eventlar (Emit)", "Serverdan mijozga va mijozdan serverga xabar yuborish", "javascript", "socket", "io.on('connection', (socket) => {\n  // 'message' nomli custom event jo'nating\n  socket.emit('message', 'Hello');\n});", ["emit(", "'message'"]),
    ("Broadcasting (Eshittirish)", "Barcha mijozlarga (jo'natuvchidan tashqari) xabar yozish", "javascript", "socket", "socket.broadcast.emit('user_joined', 'Yangi foydalanuvchi');", ["broadcast.emit"]),
    ("Xonalar (Rooms)", "Mijozlarni xonalarga birlashtirish (join, leave)", "javascript", "socket", "socket.join('chat-room-1');\n// Xonaga xabar yuboring\nio.to('chat-room-1').emit('new_msg', 'Salom');", ["join(", "to("]),
    ("Namespaces (Nomlar makoni)", "Socket.io aloqalarini alohida kanallarga ajratish", "javascript", "socket", "// '/admin' nomlar makonini yarating\nconst adminNamespace = io.of('/admin');", ["of('/admin')"]),
    ("WebSocket Authentication", "WebSocket ulanishini JWT yordamida himoyalash", "javascript", "socket", "io.use((socket, next) => {\n  const token = socket.handshake.auth.token;\n  next();\n});", ["handshake.auth", "next()"]),
    ("Real-time Chat Yaratish", "Xonalar ichida jonli suhbat tizimi yaratish", "javascript", "socket", "// 'sendMessage' eventini kutib oling va xonaga yuboring\nsocket.on('sendMessage', (data) => {\n  io.to(data.room).emit('message', data);\n});", ["on('sendMessage'", "to(data.room)"]),
    ("Foydalanuvchi Holatlari (Online/Offline)", "Kim onlayn ekanligini ko'rsatuvchi tizim", "javascript", "socket", "// Foydalanuvchi ulanishi bilan uni onlayn ro'yxatga qo'shing\nonlineUsers.set(userId, socket.id);", ["onlineUsers", "socket.id"]),
    ("Typing Indicator", "Foydalanuvchi yozyotganini ko'rsatish ('typing')", "javascript", "socket", "// typing eventini tutib qolganlarga eshittiring\nsocket.on('typing', (data) => {\n  socket.broadcast.emit('typing', data);\n});", ["on('typing'", "broadcast.emit"]),
    ("Real-time Bildirishnomalar", "Foydalanuvchilarga real-time bildirishnoma yuborish", "javascript", "socket", "// Ma'lum foydalanuvchiga bildirishnoma jo'nating\nio.to(socketId).emit('notification', 'Sizda yangi xabar bor');", ["to(socketId).emit", "notification"]),
    ("Socket.io Middleware", "Ulanishdan oldin middleware orqali tekshirish", "javascript", "socket", "io.use((socket, next) => {\n  // Middleware tekshiruvini yozing\n  next();\n});", ["io.use", "next()"]),
    ("Reconnection Handling", "Aloqa uzilganda qayta ulanish logikasi", "javascript", "socket", "// Client-da reconnect_attempt eventini eshiting\nsocket.on('reconnect_attempt', () => {});", ["reconnect_attempt"]),
    ("Scaling WebSockets (Redis)", "Bir nechta serverlarda WebSocket holatlarini sinxronlash", "javascript", "socket", "const { createAdapter } = require('@socket.io/redis-adapter');\n// adapter yaratish kodini yozing\n", ["redis", "adapter"])
]

arch_topics = [
    ("MVC Arxitekturasi", "Model-View-Controller va Controller-Service-Repository na'munalari", "javascript", "arch", "// Controller, Service va Model papkalarini tuzish\nconst folderStructure = ['controllers', 'services', 'models'];", ["controllers", "services", "models"]),
    ("User Authentication (bcrypt)", "Parollarni xavfsiz heshlash va solishtirish", "javascript", "auth", "const bcrypt = require('bcrypt');\n// Parolni hashlash metodini yozing\nconst hash = await bcrypt.hash('secret', 10);", ["bcrypt.hash", "10"]),
    ("JWT (JSON Web Token)", "JWT yaratish, imzolash va verification", "javascript", "auth", "const jwt = require('jsonwebtoken');\n// JWT sign metodini chaqiring\nconst token = jwt.sign({ id: 1 }, 'secret');", ["jwt.sign", "jsonwebtoken"]),
    ("Refresh Token Pattern", "JWT xavfsizligini ta'minlash uchun refresh tokenlar", "javascript", "auth", "// Access va Refresh tokenlarni shakllantiring\nconst payload = { userId: 1 };", ["accessToken", "refreshToken"]),
    ("Role-based Access Control (RBAC)", "Foydalanuvchi huquqlari bo'yicha cheklovlar", "javascript", "auth", "// Rolni tekshiruvchi middleware yozing\nconst checkRole = (role) => (req, res, next) => {\n  next();\n};", ["checkRole", "next()"]),
    ("Security Middleware: Helmet", "Helmet orqali HTTP sarlavhalarini himoyalash", "javascript", "security", "const helmet = require('helmet');\n// Helmet-ni express ilovasiga ulang\napp.use(helmet());", ["helmet()", "app.use"]),
    ("Rate Limiting", "DDoS hujumlarining oldini olish so'rovlarni cheklash", "javascript", "security", "const rateLimit = require('express-rate-limit');\n// rateLimit sozlamasini yozing\nconst limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });", ["rateLimit", "windowMs", "max"]),
    ("Data Sanitization", "SQL/NoSQL Injection va XSS hujumlaridan himoyalanish", "javascript", "security", "const mongoSanitize = require('express-mongo-sanitize');\n// mongoSanitize orqali query larni tozalang\napp.use(mongoSanitize());", ["mongoSanitize()", "app.use"]),
    ("Unit Testing (Jest)", "Jest yordamida funksiyalarni testdan o'tkazish", "javascript", "testing", "// describe va test bloklarini yozing\ndescribe('Math tests', () => {\n  test('add', () => {\n    expect(1+1).toBe(2);\n  });\n});", ["describe", "test", "expect"]),
    ("Integration Testing (Supertest)", "Supertest orqali API so'rovlarni testlash", "javascript", "testing", "const request = require('supertest');\n// Supertest orqali '/' ga GET so'rovi jo'nating\nconst res = await request(app).get('/');", ["request(app).get", "supertest"]),
    ("Docker Asoslari", "Loyihani Dockerfile yordamida konteynerga joylash", "javascript", "docker", "# Dockerfile ichida Node asosiy obrazini belgilang\nFROM node:18\nWORKDIR /app", ["FROM node", "WORKDIR"]),
    ("Docker Compose", "Node va MongoDB-ni birgalikda konteynerda ishga tushirish", "javascript", "docker", "# docker-compose.yml tarkibini yozing\nversion: '3.8'\nservices:\n  web:", ["version", "services"]),
    ("PM2 Process Manager", "Production-da serverni PM2 yordamida boshqarish", "javascript", "deploy", "# PM2 konfiguratsiya faylini yarating\nmodule.exports = {\n  apps : [{ name: 'app', script: './index.js' }]\n};", ["apps", "name:", "script:"]),
    ("Deploying to Render", "Loyihani bulutli serverga joylashtirish (Render/Heroku)", "javascript", "deploy", "# render.yaml sozlamasi\nservices:\n  - type: web\n    name: backend\n    env: node", ["services", "type: web"]),
    ("Production Log monitoring", "Winston/Loki orqali loglarni to'plash", "javascript", "deploy", "const winston = require('winston');\n// Logger yarating\nconst logger = winston.createLogger({});", ["winston.createLogger", "winston"]),
    ("Loyiha Yakuni va Optimallashtirish", "Kod sifatini tekshirish, siqish va xulosa", "javascript", "optimization", "const compression = require('compression');\n// compression orqali payload hajmini siqing\napp.use(compression());", ["compression()", "app.use"])
]

# Print counts for validation
print(f"Node.js: {len(node_topics)}")
print(f"MongoDB: {len(mongo_topics)}")
print(f"WebSockets: {len(websocket_topics)}")
print(f"Architecture/Deploy: {len(arch_topics)}")
print(f"Total Backend Lessons: {len(node_topics) + len(mongo_topics) + len(websocket_topics) + len(arch_topics)}")

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
                    f"Mavzuning asosiy sintaksisi, o'rnatish va amaliy qo'llanish doirasi",
                    f"Faqat CSS dizayn stillari",
                    f"Faqat Figma loyiha chizmalari",
                    f"Faqat HTML sahifa tuzilishi"
                ]
                correct_answer = 0
            elif q_num == 2:
                question_text = f"Quyidagilardan qaysi biri {topic_title} ga oid to'g'ri kod/sintaksis yozilishi hisoblanadi?"
                options = [
                    "Loyihada to'g'ri bog'langan va sintaktik xatolarsiz yozilgan kod",
                    "Faqat CSS selektorlari bilan yozilgan kod",
                    "Hech qanday metodlarsiz, bo'sh yozilgan qator",
                    "Faqat import va export buyruqlari"
                ]
                correct_answer = 0
            elif q_num == 3:
                question_text = f"{topic_title} yordamida backend dasturlashda qaysi amalni bajarib bo'lmaydi?"
                options = [
                    "Mijoz brauzerining ekran o'lchamini CSS orqali to'g'ridan-to'g'ri o'zgartirish",
                    "Ma'lumotlar bazasiga so'rov yuborish",
                    "Server API endpointlarini yaratish",
                    "Tashqi kutubxonalar va modullarni ulash"
                ]
                correct_answer = 0
            elif q_num == 4:
                question_text = f"{topic_title} texnologiyasi zamonaviy Backend dasturchi uchun nega juda muhim?"
                options = [
                    "Loyiha xavfsizligi, tezligi va API integratsiyasini to'g'ri ta'minlash uchun",
                    "Faqat rasmlarga rang berish uchun",
                    "Faqat brauzer animatsiyalarini chizish uchun",
                    "Kompyuter ekranini yorqin qilish uchun"
                ]
                correct_answer = 0
            elif q_num == 5:
                question_text = f"{topic_title} kodida yuz bergan sintaktik xatolarni (SyntaxError/TypeError) qayerda tekshirish qulay?"
                options = [
                    "Server konsoli yoki Terminal oynasida (Node.js logs)",
                    "Faqat Figma loyihasida",
                    "Faqat brauzerning CSS tabida",
                    "Xatolarni tekshirib bo'lmaydi, server darhol o'chadi"
                ]
                correct_answer = 0
            elif q_num == 6:
                question_text = f"{topic_title} mavzusida xavfsizlik va samaradorlik nuqtai nazaridan qaysi yondashuv to'g'ri?"
                options = [
                    "Kodni toza yozish, ma'lumotlarni validatsiya qilish va maxfiy kalitlarni .env da saqlash",
                    "Barcha parollarni ochiq matn (plain text) holida bazada saqlash",
                    "Barcha portlarni ochiq qoldirish",
                    "Hech qanday log yozmaslik"
                ]
                correct_answer = 0
            elif q_num == 7:
                question_text = f"Quyidagi ta'riflardan qaysi biri {topic_title} ga eng to'g'ri mos keladi?"
                options = [
                    f"Backend arxitekturasida ma'lumotlarni qayta ishlovchi va tizim barqarorligini ta'minlovchi vosita",
                    "Faqat frontend animatsiyalar kutubxonasi",
                    "Faqat SQL triggerlari",
                    "Faqat brauzer storage ombori"
                ]
                correct_answer = 0
            elif q_num == 8:
                question_text = f"{topic_title} ga tegishli amallar bajarilgandan so'ng natijani tekshirishda qaysi vosita yordam beradi?"
                options = [
                    "Postman yoki Thunder Client (API testi uchun) hamda Terminal",
                    "Faqat MS Word dasturi",
                    "Faqat Photoshop",
                    "Hech qanday tekshirish vositasi yo'q"
                ]
                correct_answer = 0
            else:
                question_text = f"Ushbu {topic_title} darsi yakunida qanday amaliy ko'nikmaga ega bo'lasiz?"
                options = [
                    f"Mavzuni to'liq tushunish, amaliy mashqda kod yozish va uning validation qoidalaridan o'tish",
                    "Hech qanday amaliy ko'nikmaga ega bo'lmaslik",
                    "Faqat nazariy ma'lumot olish",
                    "Faqat loyiha chizmasini ko'rish"
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
        "title": f"{title} topshirig'ini bajaring",
        "description": f"Ushbu mashqda {title} bo'yicha berilgan boshlang'ich koddan foydalanib, topshiriq shartlarini bajaring.",
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
    
    # 1. Node.js va Express Asoslari (20 lessons)
    node_lessons = []
    for idx, topic in enumerate(node_topics):
        node_lessons.append(build_lesson(topic, idx + 1))
        
    modules.append({
        "title": "Node.js va Express Asoslari",
        "order": 1,
        "lessons": node_lessons
    })
    
    # 2. MongoDB va Mongoose bilan ishlash (20 lessons)
    mongo_lessons = []
    for idx, topic in enumerate(mongo_topics):
        mongo_lessons.append(build_lesson(topic, idx + 1))
        
    modules.append({
        "title": "MongoDB va Mongoose bilan ishlash",
        "order": 2,
        "lessons": mongo_lessons
    })
    
    # 3. WebSockets va Real-time Texnologiyalar (16 lessons)
    websocket_lessons = []
    for idx, topic in enumerate(websocket_topics):
        websocket_lessons.append(build_lesson(topic, idx + 1))
        
    modules.append({
        "title": "WebSockets va Real-time Texnologiyalar",
        "order": 3,
        "lessons": websocket_lessons
    })
    
    # 4. Backend Arxitektura, Xavfsizlik va Deploy (16 lessons)
    arch_lessons = []
    for idx, topic in enumerate(arch_topics):
        arch_lessons.append(build_lesson(topic, idx + 1))
        
    modules.append({
        "title": "Backend Arxitektura, Xavfsizlik va Deploy",
        "order": 4,
        "lessons": arch_lessons
    })
    
    course_json = {
        "title": "Backend Development",
        "description": "Node.js, MongoDB va WebSockets yordamida zamonaviy backend dasturlash kursi",
        "price": 0,
        "duration": "6 oy",
        "level": "Backend Professional",
        "status": "ACTIVE",
        "modules": modules
    }
    
    with open("backend_course.json", "w", encoding="utf-8") as f:
        json.dump(course_json, f, ensure_ascii=False, indent=2)
        
    print("Muvaffaqiyatli saqlandi: backend_course.json!")

if __name__ == "__main__":
    main()

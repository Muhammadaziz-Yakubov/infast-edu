export interface Course {
  id: string;
  name: string;
  slug: string;
  tag: string;
  description: string;
  longDescription: string;
  duration: string;
  schedule: string;
  difficulty: 'Boshlang‘ich' | 'O‘rta' | 'Yuqori' | 'Barcha darajalar';
  iconName: string;
  topics: string[];
  projectsCount: number;
  popular?: boolean;
}

export interface Mentor {
  id: string;
  name: string;
  role: string;
  experience: string;
  company: string;
  bio: string;
  avatar: string;
  skills: string[];
  social: {
    github?: string;
    linkedin?: string;
    telegram?: string;
  };
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  course: string;
  review: string;
  avatar: string;
  rating: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface Statistic {
  value: number;
  suffix: string;
  label: string;
  description: string;
}

export const ACADEMY_STATS: Statistic[] = [
  {
    value: 100,
    suffix: "+",
    label: "O‘quvchi",
    description: "Akademiyamizda muvaffaqiyatli bilim olgan va tahsil olayotgan talabalar",
  },
  {
    value: 10,
    suffix: "+",
    label: "Kurs",
    description: "Bozo'r talabiga to'liq mos keladigan zamonaviy IT yo'nalishlari",
  },
  {
    value: 5,
    suffix: "+",
    label: "IT Yo‘nalish",
    description: "Web, Mobile, Backend, AI va Kompyuter savodxonligi dasturlari",
  },
  {
    value: 1,
    suffix: "+ Yil",
    label: "Tajriba",
    description: "Amaliyotga asoslangan zamonaviy ta'lim tajribasi va sifat natijasi",
  },
];

export const COURSES: Course[] = [
  {
    id: "frontend-dev",
    slug: "frontend-development",
    name: "Frontend Development",
    tag: "Eng talabgir yo'nalish",
    description: "Interaktiv, tekor va zamonaviy veb-saytlar hamda ilovalar yaratishni o'rganing.",
    longDescription: "HTML5, CSS3, JavaScript ES6+, TypeScript, React va Next.js kabi eng zamonaviy texnologiyalar yordamida professional frontend dasturchi bo'ling. Real loyihalar yaratish orqali portfoliosini shakllantirasiz.",
    duration: "9 oy",
    schedule: "Haftada 3 kun / 2 soatdan",
    difficulty: "Boshlang‘ich",
    iconName: "Layout",
    topics: ["HTML5 / CSS3", "JavaScript ES6+", "TypeScript", "React.js", "Next.js", "Tailwind CSS", "Git / GitHub"],
    projectsCount: 6,
    popular: true,
  },
  {
    id: "backend-dev",
    slug: "backend-development",
    name: "Backend Development",
    tag: "Tizimlar yuragi",
    description: "Kuchli va xavfsiz server arxitekturalari, API va ma'lumotlar bazalarini quring.",
    longDescription: "Node.js, Express, NestJS va Python yordamida murakkab backend tizimlarini arxitektura qilish, SQL/NoSQL ma'lumotlar bazalari va bulutli texnologiyalar bilan ishlashni o'rganasiz.",
    duration: "6 oy",
    schedule: "Haftada 3 kun / 2 soatdan",
    difficulty: "O‘rta",
    iconName: "Server",
    topics: ["Node.js", "NestJS", "PostgreSQL", "MongoDB", "REST & GraphQL API", "Docker", "Authentication & Security"],
    projectsCount: 5,
    popular: false,
  },
  {
    id: "mobile-dev",
    slug: "mobile-development",
    name: "Mobile Development",
    tag: "iOS & Android",
    description: "React Native texnologiyasi orqali bir vaqtning o'zida iOS va Android ilovalar yarating.",
    longDescription: "Mobil ilovalar ishlab chiqish, UI/UX integratsiyasi, state management, native qurilma imkoniyatlaridan foydalanish hamda App Store va Google Play'ga chiqarish jarayonlarini o'rganasiz.",
    duration: "5 oy",
    schedule: "Haftada 3 kun / 2 soatdan",
    difficulty: "O‘rta",
    iconName: "Smartphone",
    topics: ["React Native", "Expo", "TypeScript", "Redux Toolkit / Zustand", "Native Features", "App Store & Play Store Deployment"],
    projectsCount: 4,
    popular: true,
  },
  {
    id: "fullstack-dev",
    slug: "full-stack-development",
    name: "Full-Stack Development",
    tag: "Kompleks mutaxassis",
    description: "Frontend va Backend texnologiyalarini noldan to to'liq ishlab chiqarishgacha o'zlashtiring.",
    longDescription: "Foydalanuvchi interfeysidan tortib ma'lumotlar bazasigacha bo'lgan to'liq IT loyihalarni mustaqil ravishda noldan yarata oladigan universal mutaxassis bo'ling.",
    duration: "12 oy",
    schedule: "Haftada 3 kun / 2 soatdan",
    difficulty: "O‘rta",
    iconName: "Layers",
    topics: ["React / Next.js", "Node.js / NestJS", "TypeScript", "PostgreSQL & Prisma", "System Design", "DevOps basics"],
    projectsCount: 8,
    popular: false,
  },
  {
    id: "computer-literacy",
    slug: "computer-literacy",
    name: "Computer Literacy",
    tag: "IT asoslari",
    description: "Kompyuter bilan ishlashning mukammal asoslari va raqamli savodxonlik.",
    longDescription: "Zamonaviy kompyuter texnologiyalari, operatsion tizimlar, Google Office, internet xavfsizligi hamda IT sohasiga birinchi qadam qo'yish uchun kerakli barcha bilimlar.",
    duration: "2 oy",
    schedule: "Haftada 3 kun / 2 soatdan",
    difficulty: "Boshlang‘ich",
    iconName: "Monitor",
    topics: ["Windows / macOS OS", "MS Office / Google Docs", "Internet & Security", "Typing Speed", "Intro to Code & Web"],
    projectsCount: 3,
    popular: false,
  },
  {
    id: "ai-inteligence",
    slug: "artificial-intelligence",
    name: "AI / Artificial Intelligence",
    tag: "Kelajak texnologiyasi",
    description: "Sun'iy intellekt, neyron tarmoqlar va neyron vositalarni amalda qo'llashni o'rganing.",
    longDescription: "Python, Machine Learning asoslari, LLM modellari bilan ishlash, Prompt Engineering va sun'iy intellektni biznes hamda dasturlash jarayonlariga integratsiya qilish.",
    duration: "4 oy",
    schedule: "Haftada 3 kun / 2 soatdan",
    difficulty: "Barcha darajalar",
    iconName: "BrainCircuit",
    topics: ["Python Programming", "Machine Learning Intro", "Prompt Engineering", "OpenAI & Claude API", "AI Automation Tools"],
    projectsCount: 4,
    popular: true,
  },
];

export const WHY_INFAST_FEATURES = [
  {
    number: "01",
    title: "Amaliy ta'lim",
    description: "Faqat nazariya emas. Har bir mavzu amaliy loyihalar va kod yozish orqali chuqur o‘rganiladi.",
    highlight: "100% amaliyotga yo'naltirilgan metodika",
  },
  {
    number: "02",
    title: "Real loyihalar",
    description: "O‘quvchilar portfolio uchun xalqaro va mahalliy standartlarga mos real loyihalar yaratadi.",
    highlight: "Tayyor va raqobatbardosh portfolio",
  },
  {
    number: "03",
    title: "Mentorlar",
    description: "Tajribali mentorlar va soha mutaxassislari bilan doimiy jonli aloqa, feedback va code-review.",
    highlight: "Soha ekspertlaridan shaxsiy ko'mak",
  },
  {
    number: "04",
    title: "Zamonaviy muhit",
    description: "Zamonaviy jihozlangan IT muhitida o‘rganish, tajriba qilish, co-working va rivojlanish.",
    highlight: "Erkin va ilhomlantiruvchi akademiya",
  },
];

export const LEARNING_STEPS = [
  {
    step: "01",
    title: "Boshlaysan",
    subtitle: "Orzuyingdagi IT yo'nalishini tanlaysan",
    description: "Bepul konsultatsiya va darajani aniqlash orqali mos kursni tanlaysan hamda guruhga qo'shilasan.",
  },
  {
    step: "02",
    title: "O‘rganasan",
    subtitle: "Chuqurlashtirilgan interaktiv darslar",
    description: "Tajribali mentorlardan eng so'nggi va zamonaviy texnologiyalarni noldan o'rganib borasan.",
  },
  {
    step: "03",
    title: "Amalda qo‘llaysan",
    subtitle: "Har bir darsdan so'ng vazifalar",
    description: "Nazariyani darhol amalda sinab ko'rasan va real masalalarni kod yordamida yechasan.",
  },
  {
    step: "04",
    title: "Loyiha yaratasan",
    subtitle: "Jamoaviy va individual startup loyihalar",
    description: "Haqiqiy foydalanuvchilar ishlatishi mumkin bo'lgan to'liq IT loyihalarni noldan ishlab chiqasan.",
  },
  {
    step: "05",
    title: "Portfolio yig‘asan",
    subtitle: "Kuchli rezyume va GitHub profili",
    description: "Bitirish loyihalari asosida ish beruvchilarga taqdim etish uchun nufuzli portfolio hosil qilasan.",
  },
  {
    step: "06",
    title: "Keyingi bosqichga o‘tasan",
    subtitle: "Sertifikat va amaliyot imkoniyati",
    description: "InFast IT-Academy sertifikatiga ega bo'lib, IT sohasida muvaffaqiyatli faoliyatingni boshlaysan.",
  },
];

export const STUDENT_RESULTS = [
  {
    id: "res-1",
    studentName: "Javohir Toshpulatov",
    course: "Full-Stack Development",
    projectTitle: "InFast LMS & Academic OS Platform",
    projectCategory: "Web Platform",
    description: "Talabalar o'zlashtirishi, ekstra-darslar band qilish hamda GPS davomatni nazorat qiluvchi zamonaviy LMS tizimi.",
    tags: ["Next.js", "NestJS", "TypeScript", "Tailwind CSS"],
    metrics: "1,200+ faol foydalanuvchilar",
    imageBg: "from-amber-500/20 to-orange-600/10",
  },
  {
    id: "res-2",
    studentName: "Madina Alimova",
    course: "Mobile Development",
    projectTitle: "Delivery Express Mobile App",
    projectCategory: "Mobile App",
    description: "Kuryerlar va foydalanuvchilar uchun real-vaqt rejimida GPS monitoring va yetkazib berish ilovasi.",
    tags: ["React Native", "Expo", "Zustand", "WebSockets"],
    metrics: "App Store & Play Store e'lon qilingan",
    imageBg: "from-blue-500/20 to-indigo-600/10",
  },
  {
    id: "res-3",
    studentName: "Azizbek Karimov",
    course: "Frontend Development",
    projectTitle: "Fintech Dashboard & Analytics",
    projectCategory: "Dashboard",
    description: "Kriptovalyuta va moliyaviy ma'lumotlarni interaktiv grafiklar orqali tahlil qiluvchi premium interfeys.",
    tags: ["React", "TypeScript", "Recharts", "Framer Motion"],
    metrics: "99/100 Lighthouse Performance",
    imageBg: "from-emerald-500/20 to-teal-600/10",
  },
];

export const MENTORS: Mentor[] = [
  {
    id: "m-1",
    name: "Muhammadaziz Yakubov",
    role: "Lead Full-Stack Instructor & Founder",
    experience: "5+ yil tajriba",
    company: "InFast OS & Tech Lead",
    bio: "Katta tajribaga ega dasturchi va InFast ekotizimi muallifi. 200+ dan ortiq talabalarga ustozlik qilgan.",
    avatar: "/logo.png",
    skills: ["Next.js", "NestJS", "TypeScript", "React Native", "System Design"],
    social: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      telegram: "https://t.me/infast_admin",
    },
  },
  {
    id: "m-2",
    name: "Sardor Muminov",
    role: "Senior Backend Engineer",
    experience: "4+ yil tajriba",
    company: "Senior Software Engineer",
    bio: "Yuqori yuklamali microservice arxitekturalari hamda ma'lumotlar bazasi xavfsizligi bo'yicha mutaxassis.",
    avatar: "/logo.png",
    skills: ["Node.js", "Python", "PostgreSQL", "Docker", "AWS"],
    social: {
      github: "https://github.com",
      telegram: "https://t.me",
    },
  },
  {
    id: "m-3",
    name: "Diyora Rustamova",
    role: "Mobile Apps Specialist",
    experience: "3+ yil tajriba",
    company: "Mobile Architect",
    bio: "Cross-platform iOS va Android ilovalarini zamonaviy UI va tezkor ishlash prinsiplari asosida yaratish boyicha ekspert.",
    avatar: "/logo.png",
    skills: ["React Native", "Expo", "Swift", "Kotlin", "Zustand"],
    social: {
      linkedin: "https://linkedin.com",
      telegram: "https://t.me",
    },
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t-1",
    name: "Asadbek Umarov",
    role: "Frontend Dasturchi",
    company: "IT Startup",
    course: "Frontend Development",
    review: "InFast IT-Academy'da o'qish hayotimni butunlay o'zgartirdi. Mentorlarning amaliy yondashuvi sababli 6 oy ichida tayyor dasturchiga aylandim va birinchi ish o'rnimni topdim.",
    avatar: "AU",
    rating: 5,
  },
  {
    id: "t-2",
    name: "Malika Rahimova",
    role: "Junior Mobile Dev",
    company: "Fintech Agency",
    course: "Mobile Development",
    review: "Noldan boshlab React Native ilovalar yaratishni o'rgandim. Akademyadagi zamonaviy muhit va real loyihalar ustida ishlash tajribasi menga juda katta seniki berdi.",
    avatar: "MR",
    rating: 5,
  },
  {
    id: "t-3",
    name: "Bobur Tursunov",
    role: "Backend Engineer",
    company: "E-Commerce Project",
    course: "Backend Development",
    review: "Nazariya va amaliyot o'rtasidagi muvozanat ajoyib. Har bir mavzu real kod yozish va server loyihalari orqali tushuntiriladi. Tavsiya qilaman!",
    avatar: "BT",
    rating: 5,
  },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: "faq-1",
    question: "Kurslar kimlar uchun?",
    answer: "InFast IT-Academy kurslari IT sohasiga noldan kirib kelmoqchi bo'lgan boshlovchilar, bilimlarini mustahkamlamoqchi bo'lgan havaskorlar hamda zamonaviy IT kasbini egallashni maqsad qilgan barcha yoshdagilar uchun mo'ljallangan.",
  },
  {
    id: "faq-2",
    question: "Darslar qanday o'tiladi?",
    answer: "Darslar zamonaviy jihozlangan xonalarda amaliy shaklda o'tiladi. Har bir dars nazariy tushuntirish va darhol kompyuterda mashq qilish hamda loyiha ustida ishlashdan iborat.",
  },
  {
    id: "faq-3",
    question: "Kurs qancha davom etadi?",
    answer: "Yo'nalishga qarab kurslar davomiyligi 2 oydan (Kompyuter savodxonligi) 8 oygacha (Full-Stack Development) davom etadi. Darslar haftada 3 kun, 2 soatdan tashkil etiladi.",
  },
  {
    id: "faq-4",
    question: "Uyga vazifalar beriladimi?",
    answer: "Ha, har bir darsdan so'ng mustahkamlash uchun amaliy vazifa va loyiha topshiriqlari beriladi. Mentorlar topshiriqlarni tekshirib, shaxsiy feedback berib boradilar.",
  },
  {
    id: "faq-5",
    question: "Portfolio yaratamizmi?",
    answer: "Albatta! O'quv jarayoni davomida har bir talaba kamida 4-6 ta real loyihani noldan yaratib, o'zining shaxsiy GitHub hamda online portfolio profilini shakllantiradi.",
  },
  {
    id: "faq-6",
    question: "Kursga qanday yozilish mumkin?",
    answer: "Veb-saytimizdagi 'Kursga yozilish' tugmasini bosib formani to'ldirishingiz yoki telegram hamda telefon orqali menejerlarimiz bilan bog'lanishingiz kifoya.",
  },
  {
    id: "faq-7",
    question: "Filiallar qayerda joylashgan?",
    answer: "Akademiyamiz Toshkent shahrining qulay transport bog'lamasiga ega hududida joylashgan. Aniq manzil va xarita ma'lumotlarini kontakt bo'limidan topishingiz mumkin.",
  },
];

export const CONTACT_INFO = {
  phone: "+998 90 123 45 67",
  phoneFormatted: "+998 (90) 123-45-67",
  telegram: "https://t.me/infast_admin",
  telegramHandle: "@infast_admin",
  instagram: "https://instagram.com/infast.academy",
  instagramHandle: "@infast.academy",
  address: "Toshkent shahri, Yakkasaroy tumani, Shota Rustaveli ko'chasi, 45-uy",
  workingHours: "Dush - Shanba: 09:00 - 20:00",
  email: "info@infast.uz",
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Users, ShieldCheck, Laptop, Zap } from 'lucide-react';

export const AcademyExperience: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const experienceTabs = [
    {
      id: 0,
      title: "Zamonaviy Muhit",
      subtitle: "Erkin va ilhomlantiruvchi co-working",
      icon: <Laptop className="w-5 h-5" />,
      contentTitle: "Yuqori tezlikdagi IT infratuzilma",
      description: "InFast IT-Academy xonalari eng so'nggi zamonaviy kompyuterlar, yuqori tezlikdagi internet hamda o'quvchilar darsdan tashqari kelib ishlashi uchun mo'ljallangan qulay co-working hududiga ega.",
      highlights: [
        "Modern kompyuter sinflari",
        "24/7 Co-working zonasiga kirish",
        "Yuqori tezlikdagi Optik Internet",
        "Interaktiv proyektorlar va taqdimot ekranlari",
      ],
      previewSnippet: `// InFast Infrastructure Status
{
  "workspace": "InFast Hub Tashkent",
  "internet_speed": "1 Gbps Fiber",
  "co_working_capacity": "50+ Workstations",
  "hardware": "High-Performance Workstations"
}`,
    },
    {
      id: 1,
      title: "Live Code Review",
      subtitle: "Mentorlardan har kunlik fikr-mulohaza",
      icon: <Code className="w-5 h-5" />,
      contentTitle: "Shaxsiy feedback va kod audit",
      description: "Har bir topshirgan vazifangiz va loyihangiz tajribali mentorlar tomonidan sintaksis, xavfsizlik va optimizatsiya bo'yicha shaxsan tekshiriladi hamda tahlil qilinadi.",
      highlights: [
        "1-on-1 Mentorship sessiyalari",
        "GitHub Pull Request review",
        "Clean Code va System Architecture tamoyillari",
        "Xatolarni tezkor tuzatish ko'magi",
      ],
      previewSnippet: `// Mentors Review Log
[✔] Clean Code Standard Approved
[✔] Security & Auth Verified
[✔] Performance Score: 100/100
Feedback: "Ajoyib arxitektura! Loyihangiz ishga tushishga tayyor."`,
    },
    {
      id: 2,
      title: "IT Jamiyat",
      subtitle: "Fikrdoshlar va kelajakdagi hamkorlar",
      icon: <Users className="w-5 h-5" />,
      contentTitle: "Haqiqiy IT netvorking hamjamiyati",
      description: "Biz shunchaki o'quv markazi emasmiz — biz bir xil maqsadga ega bo'lgan intiluvchan dasturchilar va soha vakillarini birlashtirgan katta texnologik oilamiz.",
      highlights: [
        "Hakatonda ishtirok etish imkoniyati",
        "Soha ekspertlari bilan uchrashuvlar",
        "Jamoaviy startup loyihalar",
        "InFast Alumnis yopiq kanali",
      ],
      previewSnippet: `// InFast Community Network
Community Members: 500+ Active Devs
Events: Monthly Hackathons & Meetups
Job Placements: Direct HR Referrals`,
    },
  ];

  return (
    <section className="py-28 relative overflow-hidden bg-grid-pattern">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#FF6A00]/10 blur-[180px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Apple Style Editorial Headline */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#FF6A00] text-xs font-semibold uppercase tracking-wider mb-4"
          >
            <Zap className="w-3.5 h-3.5" />
            Akademiya Muhiti
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]"
          >
            Bu yerda o‘rganishadi. <br />
            <span className="bg-gradient-to-r from-orange-200 via-[#FF6A00] to-amber-500 bg-clip-text text-transparent">
              Bu yerda yaratishadi.
            </span>
          </motion.h2>
        </div>

        {/* Tab Selection */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1.5 rounded-full bg-zinc-950/80 border border-white/10 backdrop-blur-xl gap-2 overflow-x-auto max-w-full">
            {experienceTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#FF6A00] text-white shadow-lg shadow-[#FF6A00]/25'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Showcase Box */}
        <div className="relative rounded-3xl bg-zinc-950/90 border border-white/10 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              {/* Content Description */}
              <div className="lg:col-span-7 space-y-6">
                <span className="text-xs font-mono uppercase tracking-widest text-[#FF6A00]">
                  {experienceTabs[activeTab].subtitle}
                </span>

                <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                  {experienceTabs[activeTab].contentTitle}
                </h3>

                <p className="text-base text-zinc-300 font-normal leading-relaxed">
                  {experienceTabs[activeTab].description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {experienceTabs[activeTab].highlights.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-sm text-zinc-200">
                      <ShieldCheck className="w-4 h-4 text-[#FF6A00] flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* High-tech Display Mockup */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl bg-zinc-900 border border-white/10 p-5 shadow-2xl relative font-mono text-xs text-zinc-300 overflow-hidden">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    </div>
                    <span>terminal@infast-academy</span>
                  </div>

                  <pre className="text-amber-200/90 whitespace-pre-wrap leading-relaxed">
                    {experienceTabs[activeTab].previewSnippet}
                  </pre>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-500 font-sans">
                    <span>Status: ACTIVE ENVIRONMENT</span>
                    <span className="text-[#FF6A00] font-semibold">100% Guaranteed Quality</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

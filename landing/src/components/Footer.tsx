'use client';

import React from 'react';
import Image from 'next/image';
import { CONTACT_INFO } from '@/data/academyData';
import { Phone, Send, MapPin, Clock } from 'lucide-react';
import { InstagramIcon } from '@/components/ui/Icons';

export const Footer: React.FC = () => {
  const scrollToSection = (href: string) => {
    const el = document.querySelector(href);
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-zinc-950 border-t border-white/10 text-zinc-400 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Col 1 & 2: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center p-1.5">
                <Image src="/logo.png" alt="InFast Logo" width={40} height={40} className="object-contain" />
              </div>
              <span className="text-xl font-black text-white tracking-wider">
                IN<span className="text-[#FF6A00]">FAST</span>
              </span>
            </div>

            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed font-normal">
              InFast IT-Academy — zamonaviy IT kasblarini amaliyot va tajriba orqali o‘rgatadigan nufuzli akademiya.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={CONTACT_INFO.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 hover:text-[#FF6A00] hover:border-[#FF6A00]/40 transition-colors"
                aria-label="Telegram"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href={CONTACT_INFO.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 hover:text-[#FF6A00] hover:border-[#FF6A00]/40 transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Navigatsiya</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => scrollToSection('#courses')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Kurslar
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('#academy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Akademiya
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('#results')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Natijalar
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('#mentors')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Ustozlar
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('#faq')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Courses list */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Yo'nalishlar</h4>
            <ul className="space-y-2.5 text-sm">
              <li>Frontend Development</li>
              <li>Backend Development</li>
              <li>Mobile Development</li>
              <li>Full-Stack Development</li>
              <li>Computer Literacy</li>
              <li>AI / Artificial Intelligence</li>
            </ul>
          </div>

          {/* Col 5: Contact details */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Bog'lanish</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#FF6A00] flex-shrink-0 mt-0.5" />
                <a href={`tel:${CONTACT_INFO.phone}`} className="hover:text-white transition-colors">
                  {CONTACT_INFO.phoneFormatted}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Send className="w-4 h-4 text-[#FF6A00] flex-shrink-0 mt-0.5" />
                <a
                  href={CONTACT_INFO.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {CONTACT_INFO.telegramHandle}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FF6A00] flex-shrink-0 mt-0.5" />
                <span className="text-xs">{CONTACT_INFO.address}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-zinc-400">{CONTACT_INFO.workingHours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} InFast IT-Academy. Barcha huquqlar himoyalangan.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white transition-colors cursor-pointer">Maxfiylik siyosati</span>
            <span className="hover:text-white transition-colors cursor-pointer">Foydalanish shartlari</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

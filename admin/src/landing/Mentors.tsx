import React from 'react';
import { motion } from 'framer-motion';
import { SectionHeader } from './SectionHeader';
import { MENTORS } from './academyData';
import type { Mentor } from './academyData';
import { Send, Sparkles } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './Icons';

export const Mentors: React.FC = () => {
  return (
    <section id="mentors" className="py-24 bg-zinc-950/60 border-y border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <SectionHeader
          badge="Bizning Ustozlar"
          title="Ustozlardan o‘rgan. Tajribadan foydalan."
          description="Har bir mentorimiz IT sohasida ko'p yillik amaliy tajribaga ega bo'lgan professional mutaxassislardir."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {MENTORS.map((mentor: Mentor, index: number) => (
            <motion.div
              key={mentor.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative p-7 rounded-3xl bg-zinc-900/40 border border-white/10 hover:border-[#FF6A00]/40 transition-all duration-300 backdrop-blur-xl hover:bg-zinc-900/80 hover:-translate-y-1.5 shadow-xl flex flex-col justify-between"
            >
              <div>
                {/* Photo / Avatar Header with Grayscale to Color Transition */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 group-hover:border-[#FF6A00] transition-colors p-2 flex items-center justify-center">
                    <img
                      src={mentor.avatar}
                      alt={mentor.name}
                      className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-[#FF6A00] transition-colors">
                      {mentor.name}
                    </h3>
                    <p className="text-xs font-medium text-zinc-400">{mentor.role}</p>
                    <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-[#FF6A00] bg-[#FF6A00]/10 px-2.5 py-0.5 rounded-full border border-[#FF6A00]/20">
                      <Sparkles className="w-3 h-3" />
                      {mentor.experience}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-zinc-300 font-normal leading-relaxed mb-6">
                  {mentor.bio}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {mentor.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs font-mono text-zinc-400 bg-zinc-950 border border-white/5 px-2.5 py-1 rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-mono">{mentor.company}</span>
                <div className="flex items-center gap-2">
                  {mentor.social.github && (
                    <a
                      href={mentor.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-zinc-950 border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 transition-colors"
                    >
                      <GithubIcon className="w-4 h-4" />
                    </a>
                  )}
                  {mentor.social.linkedin && (
                    <a
                      href={mentor.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-zinc-950 border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 transition-colors"
                    >
                      <LinkedinIcon className="w-4 h-4" />
                    </a>
                  )}
                  {mentor.social.telegram && (
                    <a
                      href={mentor.social.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-zinc-950 border border-white/10 text-zinc-400 hover:text-[#FF6A00] hover:border-[#FF6A00]/40 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

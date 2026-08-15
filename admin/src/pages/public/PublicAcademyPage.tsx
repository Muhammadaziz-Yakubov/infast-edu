import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../landing/Navbar';
import { WhyInfast } from '../../landing/WhyInfast';
import { AcademyExperience } from '../../landing/AcademyExperience';
import { LearningProcess } from '../../landing/LearningProcess';
import { FinalCTA } from '../../landing/FinalCTA';
import { Footer } from '../../landing/Footer';

const FORM_PATH = '/form/6a804e76a26d225b297e8f34';

export const PublicAcademyPage: React.FC = () => {
  const navigate = useNavigate();

  const handleOpenEnroll = () => {
    navigate(FORM_PATH);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-[#FF6A00] selection:text-white antialiased pt-20">
      <Navbar onOpenEnroll={handleOpenEnroll} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-6 text-center">
        <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-[#FF6A00]/15 text-[#FF6A00] uppercase tracking-wider">
          Akademiya Haqida
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mt-4 mb-4">
          InFast IT-Academy Muhiti
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Bizning falsafamiz, o'quv muhitimiz hamda amaliy metodikalarimiz haqida batafsil.
        </p>
      </div>

      <WhyInfast />
      <AcademyExperience />
      <LearningProcess />

      <FinalCTA onOpenEnroll={handleOpenEnroll} />
      <Footer />
    </div>
  );
};

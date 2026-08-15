import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../landing/Navbar';
import { StudentResults } from '../../landing/StudentResults';
import { StudentStories } from '../../landing/StudentStories';
import { FinalCTA } from '../../landing/FinalCTA';
import { Footer } from '../../landing/Footer';

const FORM_PATH = '/form/6a804e76a26d225b297e8f34';

export const PublicResultsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleOpenEnroll = () => {
    navigate(FORM_PATH);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-[#FF6A00] selection:text-white antialiased pt-20">
      <Navbar onOpenEnroll={handleOpenEnroll} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-6 text-center">
        <span className="px-[#FF6A00] px-3.5 py-1 rounded-full text-xs font-semibold bg-[#FF6A00]/15 text-[#FF6A00] uppercase tracking-wider">
          Bitiruvchilar Yutuqlari
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mt-4 mb-4">
          Talabalarimiz Natijalari & Portfoliolari
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Bitiruvchilarimiz yaratgan real IT loyihalar, ishga joylashish ko'rsatkichlari va samimiy fikrlar.
        </p>
      </div>

      <StudentResults />
      <StudentStories />

      <FinalCTA onOpenEnroll={handleOpenEnroll} />
      <Footer />
    </div>
  );
};

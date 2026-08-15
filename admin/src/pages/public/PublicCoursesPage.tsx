import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../landing/Navbar';
import { Courses } from '../../landing/Courses';
import { FinalCTA } from '../../landing/FinalCTA';
import { Footer } from '../../landing/Footer';
import { CourseDetailModal } from '../../landing/CourseDetailModal';
import type { Course } from '../../landing/academyData';

const FORM_PATH = '/form/6a804e76a26d225b297e8f34';

export const PublicCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [detailCourse, setDetailCourse] = useState<Course | null>(null);

  const handleOpenEnroll = () => {
    navigate(FORM_PATH);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-[#FF6A00] selection:text-white antialiased pt-20">
      <Navbar onOpenEnroll={handleOpenEnroll} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-6 text-center">
        <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-[#FF6A00]/15 text-[#FF6A00] uppercase tracking-wider">
          Ta'lim Dasturlari
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mt-4 mb-4">
          Zamonaviy IT Yo‘nalishlari
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          InFast IT-Academy'da bozor talabiga 100% mos keladigan barcha zamonaviy ta'lim yo'nalishlari va intensiv dasturlari.
        </p>
      </div>

      <Courses
        onSelectCourse={(course) => setDetailCourse(course)}
        onEnrollCourse={() => handleOpenEnroll()}
      />

      <FinalCTA onOpenEnroll={handleOpenEnroll} />
      <Footer />

      <CourseDetailModal
        course={detailCourse}
        onClose={() => setDetailCourse(null)}
        onEnroll={() => handleOpenEnroll()}
      />
    </div>
  );
};

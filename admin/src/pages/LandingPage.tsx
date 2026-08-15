import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../landing/Navbar';
import { Hero } from '../landing/Hero';
import { Stats } from '../landing/Stats';
import { Courses } from '../landing/Courses';
import { WhyInfast } from '../landing/WhyInfast';
import { AcademyExperience } from '../landing/AcademyExperience';
import { LearningProcess } from '../landing/LearningProcess';
import { StudentResults } from '../landing/StudentResults';
import { Mentors } from '../landing/Mentors';
import { StudentStories } from '../landing/StudentStories';
import { FAQ } from '../landing/FAQ';
import { FinalCTA } from '../landing/FinalCTA';
import { Footer } from '../landing/Footer';
import { CourseDetailModal } from '../landing/CourseDetailModal';
import type { Course } from '../landing/academyData';

const FORM_PATH = '/form/6a804e76a26d225b297e8f34';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [detailCourse, setDetailCourse] = useState<Course | null>(null);

  const handleOpenEnroll = (_courseName?: string) => {
    navigate(FORM_PATH);
  };

  const handleSelectCourseDetail = (course: Course) => {
    setDetailCourse(course);
  };

  const handleCloseDetail = () => {
    setDetailCourse(null);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-[#FF6A00] selection:text-white antialiased">
      {/* Header Navigation */}
      <Navbar onOpenEnroll={handleOpenEnroll} />

      {/* Hero Section */}
      <Hero onOpenEnroll={() => handleOpenEnroll()} />

      {/* Social Proof / Stats Counter */}
      <Stats />

      {/* Academy Courses */}
      <Courses
        onSelectCourse={handleSelectCourseDetail}
        onEnrollCourse={(name) => handleOpenEnroll(name)}
      />

      {/* Why InFast / 4 Feature Blocks */}
      <WhyInfast />

      {/* Academy Experience Showcase */}
      <AcademyExperience />

      {/* 6-Step Learning Timeline */}
      <LearningProcess />

      {/* Student Results & Bento Showcase */}
      <StudentResults />

      {/* Mentors */}
      <Mentors />

      {/* Student Stories / Testimonials */}
      <StudentStories />

      {/* FAQ Accordion */}
      <FAQ />

      {/* Final Call To Action */}
      <FinalCTA onOpenEnroll={() => handleOpenEnroll()} />

      {/* Footer */}
      <Footer />

      {/* Course Detail Modal */}
      <CourseDetailModal
        course={detailCourse}
        onClose={handleCloseDetail}
        onEnroll={(name) => handleOpenEnroll(name)}
      />
    </div>
  );
};

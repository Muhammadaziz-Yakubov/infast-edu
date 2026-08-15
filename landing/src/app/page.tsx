'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { Stats } from '@/components/Stats';
import { Courses } from '@/components/Courses';
import { WhyInfast } from '@/components/WhyInfast';
import { AcademyExperience } from '@/components/AcademyExperience';
import { LearningProcess } from '@/components/LearningProcess';
import { StudentResults } from '@/components/StudentResults';
import { Mentors } from '@/components/Mentors';
import { StudentStories } from '@/components/StudentStories';
import { FAQ } from '@/components/FAQ';
import { FinalCTA } from '@/components/FinalCTA';
import { Footer } from '@/components/Footer';
import { EnrollmentModal } from '@/components/EnrollmentModal';
import { CourseDetailModal } from '@/components/CourseDetailModal';
import { Course } from '@/data/academyData';

export default function Home() {
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedCourseName, setSelectedCourseName] = useState<string | undefined>(undefined);
  const [detailCourse, setDetailCourse] = useState<Course | null>(null);

  const handleOpenEnroll = (courseName?: string) => {
    setSelectedCourseName(courseName);
    setIsEnrollModalOpen(true);
  };

  const handleCloseEnroll = () => {
    setIsEnrollModalOpen(false);
    setSelectedCourseName(undefined);
  };

  const handleSelectCourseDetail = (course: Course) => {
    setDetailCourse(course);
  };

  const handleCloseDetail = () => {
    setDetailCourse(null);
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-[#FF6A00] selection:text-white antialiased">
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

      {/* Registration Pop-up Modal */}
      <EnrollmentModal
        isOpen={isEnrollModalOpen}
        onClose={handleCloseEnroll}
        selectedCourseName={selectedCourseName}
      />

      {/* Course Detail Modal */}
      <CourseDetailModal
        course={detailCourse}
        onClose={handleCloseDetail}
        onEnroll={(name) => handleOpenEnroll(name)}
      />
    </main>
  );
}

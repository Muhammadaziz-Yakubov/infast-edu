import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Branches } from './pages/Branches';
import { BranchDetails } from './pages/BranchDetails';
import { Students } from './pages/Students';
import { StudentProfile } from './pages/StudentProfile';
import { Groups } from './pages/Groups';
import { Courses } from './pages/Courses';
import { LmsBuilder } from './pages/LmsBuilder';
import { Homework } from './pages/Homework';
import { Payments } from './pages/Payments';
import { Attendance } from './pages/Attendance';
import { Market } from './pages/Market';
import { Analytics } from './pages/Analytics';
import { Notifications } from './pages/Notifications';
import { Stories } from './pages/Stories';
import { Events } from './pages/Events';
import { Referrals } from './pages/Referrals';
import { Settings } from './pages/Settings';
import { LmsCheck } from './pages/LmsCheck';
import { Chat } from './pages/Chat';
import { AiAdvisor } from './pages/AiAdvisor';
import { TelegramAi } from './pages/TelegramAi';

// Marketing CRM Pages
import { MarketingDashboard } from './pages/marketing/MarketingDashboard';
import { LeadsList } from './pages/marketing/LeadsList';
import { PipelineView } from './pages/marketing/PipelineView';
import { Campaigns } from './pages/marketing/Campaigns';
import { LeadSources } from './pages/marketing/LeadSources';
import { ManagersPerformance } from './pages/marketing/ManagersPerformance';
import { MarketingAnalytics } from './pages/marketing/MarketingAnalytics';
import { LeadDetails } from './pages/marketing/LeadDetails';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export const App: React.FC = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/branches" element={<Branches />} />
            <Route path="/branches/:id" element={<BranchDetails />} />
            
            {/* Student management */}
            <Route path="/students" element={<Students />} />
            <Route path="/students/:id" element={<StudentProfile />} />
            
            {/* Class Management */}
            <Route path="/groups" element={<Groups />} />
            
            {/* LMS Syllabus */}
            <Route path="/courses" element={<Courses />} />
            <Route path="/lms" element={<LmsBuilder />} />
            <Route path="/lms-check" element={<LmsCheck />} />
            <Route path="/homework" element={<Homework />} />
            
            {/* Operations */}
            <Route path="/payments" element={<Payments />} />
            <Route path="/attendance" element={<Attendance />} />
            
            {/* Gamification Market */}
            <Route path="/market" element={<Market />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/events" element={<Events />} />
            <Route path="/referrals" element={<Referrals />} />
            
            {/* Marketing CRM */}
            <Route path="/marketing" element={<MarketingDashboard />} />
            <Route path="/marketing/leads" element={<LeadsList />} />
            <Route path="/marketing/leads/:id" element={<LeadDetails />} />
            <Route path="/marketing/pipeline" element={<PipelineView />} />
            <Route path="/marketing/campaigns" element={<Campaigns />} />
            <Route path="/marketing/sources" element={<LeadSources />} />
            <Route path="/marketing/managers" element={<ManagersPerformance />} />
            <Route path="/marketing/analytics" element={<MarketingAnalytics />} />

            {/* Reporting & Logs */}
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/ai-advisor" element={<AiAdvisor />} />
            <Route path="/telegram-ai" element={<TelegramAi />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/chat" element={<Chat />} />
            
            {/* Configurations */}
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Redirect unknown routes to Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;

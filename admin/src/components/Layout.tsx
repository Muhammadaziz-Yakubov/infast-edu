import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  BookOpen,
  GraduationCap,
  FileCode,
  CreditCard,
  CheckSquare,
  ShoppingBag,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Tv,
  Calendar,
  Gift,
  ClipboardCheck,
  MessageSquare,
  Megaphone,
  ChevronDown,
  ChevronRight,
  Brain,
  Sparkles,
  Send,
  Building,
} from 'lucide-react';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
}

interface SidebarSection {
  name: string;
  key: string;
  icon: React.ComponentType<any>;
  items?: SidebarItem[];
  path?: string; // For direct links
}

const getSidebarSections = (userRole?: string): SidebarSection[] => [
  {
    name: 'Dashboard',
    key: 'dashboard',
    icon: LayoutDashboard,
    path: '/',
  },
  {
    name: 'Academy',
    key: 'academy',
    icon: GraduationCap,
    items: [
      ...(userRole === 'SUPER_ADMIN' ? [{ name: 'Branches', path: '/branches', icon: Building }] : []),
      { name: 'Students', path: '/students', icon: Users },
      { name: 'Groups', path: '/groups', icon: FolderKanban },
      { name: 'Attendance', path: '/attendance', icon: CheckSquare },
    ],
  },
  {
    name: 'Learning',
    key: 'learning',
    icon: BookOpen,
    items: [
      { name: 'Courses', path: '/courses', icon: BookOpen },
      { name: 'LMS Builder', path: '/lms', icon: GraduationCap },
      { name: 'Homework', path: '/homework', icon: FileCode },
      { name: 'Review Center', path: '/lms-check', icon: ClipboardCheck },
    ],
  },
  {
    name: 'CRM',
    key: 'crm',
    icon: Megaphone,
    items: [
      { name: 'Leads', path: '/marketing/leads', icon: Users },
      { name: 'Pipeline', path: '/marketing/pipeline', icon: FolderKanban },
      { name: 'Campaigns', path: '/marketing/campaigns', icon: Megaphone },
    ],
  },
  {
    name: 'Finance',
    key: 'finance',
    icon: CreditCard,
    items: [
      { name: 'Payments', path: '/payments', icon: CreditCard },
    ],
  },
  {
    name: 'AI Center',
    key: 'ai-center',
    icon: Sparkles,
    items: [
      { name: 'AI Chat', path: '/chat', icon: MessageSquare },
      { name: 'AI Lesson Creator', path: '/ai-lesson-creator', icon: Sparkles },
      { name: 'AI Advisor', path: '/ai-advisor', icon: Brain },
      { name: 'Telegram AI', path: '/telegram-ai', icon: Send },
    ],
  },
  {
    name: 'Engagement',
    key: 'engagement',
    icon: Gift,
    items: [
      { name: 'Market', path: '/market', icon: ShoppingBag },
      { name: 'Events', path: '/events', icon: Calendar },
      { name: 'Stories', path: '/stories', icon: Tv },
      { name: 'Referrals', path: '/referrals', icon: Gift },
    ],
  },
  {
    name: 'Analytics',
    key: 'analytics',
    icon: BarChart3,
    path: '/analytics',
  },
  {
    name: 'Settings',
    key: 'settings',
    icon: Settings,
    path: '/settings',
  },
];

const getBreadcrumbs = (pathname: string): string[] => {
  if (pathname === '/') return ['Dashboard'];
  
  // Settings & direct pages
  if (pathname.startsWith('/settings')) return ['Settings'];
  if (pathname.startsWith('/analytics')) return ['Analytics'];
  if (pathname.startsWith('/notifications')) return ['Notifications'];
  
  // Details rules
  // Branches
  if (pathname.startsWith('/branches/')) return ['Academy', 'Branches', 'Branch Details'];
  if (pathname.startsWith('/branches')) return ['Academy', 'Branches'];
  
  // Students
  if (pathname.startsWith('/students/')) return ['Academy', 'Students', 'Student Profile'];
  if (pathname.startsWith('/students')) return ['Academy', 'Students'];
  
  // Groups
  if (pathname.startsWith('/groups')) return ['Academy', 'Groups'];
  
  // Attendance
  if (pathname.startsWith('/attendance')) return ['Academy', 'Attendance'];
  
  // Courses
  if (pathname.startsWith('/courses/')) return ['Learning', 'Courses', 'Course Details'];
  if (pathname.startsWith('/courses')) return ['Learning', 'Courses'];
  
  // LMS Builder
  if (pathname.startsWith('/lms-check')) return ['Learning', 'Review Center'];
  if (pathname.startsWith('/lms')) return ['Learning', 'LMS Builder'];
  
  // Homework
  if (pathname.startsWith('/homework')) return ['Learning', 'Homework'];
  
  // Payments
  if (pathname.startsWith('/payments')) return ['Finance', 'Payments'];
  
  // CRM / Marketing
  if (pathname.startsWith('/marketing/leads/')) return ['CRM', 'Leads', 'Lead Details'];
  if (pathname.startsWith('/marketing/leads')) return ['CRM', 'Leads'];
  if (pathname.startsWith('/marketing/pipeline')) return ['CRM', 'Pipeline'];
  if (pathname.startsWith('/marketing/campaigns')) return ['CRM', 'Campaigns'];
  if (pathname.startsWith('/marketing/sources')) return ['CRM', 'Sources'];
  if (pathname.startsWith('/marketing/managers')) return ['CRM', 'Managers'];
  if (pathname.startsWith('/marketing/analytics')) return ['CRM', 'CRM Analytics'];
  if (pathname.startsWith('/marketing')) return ['CRM', 'CRM Dashboard'];
  
  // AI Center
  if (pathname.startsWith('/chat')) return ['AI Center', 'AI Chat'];
  if (pathname.startsWith('/ai-lesson-creator')) return ['AI Center', 'AI Lesson Creator'];
  if (pathname.startsWith('/ai-advisor')) return ['AI Center', 'AI Advisor'];
  if (pathname.startsWith('/telegram-ai')) return ['AI Center', 'Telegram AI'];
  
  // Engagement
  if (pathname.startsWith('/market')) return ['Engagement', 'Market'];
  if (pathname.startsWith('/events')) return ['Engagement', 'Events'];
  if (pathname.startsWith('/stories')) return ['Engagement', 'Stories'];
  if (pathname.startsWith('/referrals')) return ['Engagement', 'Referrals'];
  
  return ['Academy'];
};

export const Layout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const isDark = document.documentElement.classList.contains('dark');
    return isDark ? 'dark' : 'light';
  });

  const [expandedSection, setExpandedSection] = useState<string | null>(() => {
    const currentPath = location.pathname;
    const sections = getSidebarSections(user?.role);
    
    // Auto-expand section containing current URL path
    const activeSection = sections.find(section => 
      section.items?.some(item => 
        currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path))
      )
    );
    
    if (activeSection) {
      return activeSection.key;
    }
    
    return localStorage.getItem('admin_sidebar_expanded_section');
  });

  // Keep expanded section in sync with external path changes (e.g. user clicks logo/dashboard)
  useEffect(() => {
    const currentPath = location.pathname;
    const sections = getSidebarSections(user?.role);
    const activeSection = sections.find(section => 
      section.items?.some(item => 
        currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path))
      )
    );
    
    if (activeSection) {
      setExpandedSection(activeSection.key);
      localStorage.setItem('admin_sidebar_expanded_section', activeSection.key);
    }
  }, [location.pathname, user?.role]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleToggleSection = (sectionKey: string) => {
    setExpandedSection(prev => {
      const next = prev === sectionKey ? null : sectionKey;
      if (next) {
        localStorage.setItem('admin_sidebar_expanded_section', next);
      } else {
        localStorage.removeItem('admin_sidebar_expanded_section');
      }
      return next;
    });
  };

  const handleDirectLinkClick = () => {
    setExpandedSection(null);
    localStorage.removeItem('admin_sidebar_expanded_section');
  };

  const renderNavItems = (onItemClick?: () => void) => {
    const sections = getSidebarSections(user?.role);

    return (
      <div className="space-y-1.5 select-none">
        {sections.map((section) => {
          const isDirect = !section.items;
          const isExpanded = expandedSection === section.key;
          const isActiveDirect = isDirect && (
            location.pathname === section.path || 
            (section.path !== '/' && location.pathname.startsWith(section.path ?? ''))
          );

          if (isDirect) {
            return (
              <Link
                key={section.key}
                to={section.path ?? '/'}
                onClick={() => {
                  handleDirectLinkClick();
                  if (onItemClick) onItemClick();
                }}
                className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActiveDirect
                    ? 'bg-secondary text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-secondary hover:text-primary'
                }`}
              >
                <section.icon className={`w-4 h-4 shrink-0 ${isActiveDirect ? 'text-primary' : 'text-muted-foreground'}`} />
                <span>{section.name}</span>
              </Link>
            );
          }

          const isSubItemActive = section.items?.some((item) => 
            location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
          );

          return (
            <div key={section.key} className="space-y-1">
              <button
                onClick={() => handleToggleSection(section.key)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isSubItemActive
                    ? 'bg-secondary/40 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-secondary hover:text-primary'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <section.icon className={`w-4 h-4 shrink-0 ${isSubItemActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span>{section.name}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </button>

              {isExpanded && (
                <div className="mt-0.5 ml-4 pl-3 border-l border-border space-y-1 animate-in slide-in-from-top-1 duration-100">
                  {section.items?.map((item) => {
                    const isItemActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={onItemClick}
                        className={`flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                          isItemActive
                            ? 'bg-secondary text-primary font-semibold'
                            : 'text-muted-foreground hover:bg-secondary hover:text-primary'
                        }`}
                      >
                        {item.icon && <item.icon className={`w-3.5 h-3.5 shrink-0 ${isItemActive ? 'text-primary' : 'text-muted-foreground'}`} />}
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card shrink-0">
        {/* Sidebar Brand Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b select-none">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-black text-lg">
            IF
          </div>
          <span className="font-bold text-lg tracking-tight">InFast Academy</span>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          {renderNavItems()}
        </nav>

        {/* Sidebar Footer User Card */}
        <div className="p-4 border-t bg-card/50 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={user?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Admin'}
              alt="Avatar"
              className="w-9 h-9 rounded-full bg-secondary shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate leading-none mb-1">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground truncate leading-none capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-secondary transition-colors"
            title="Tizimdan chiqish"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (Overlay and Menu) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative flex flex-col w-64 max-w-xs bg-card border-r shadow-lg animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <span className="font-bold text-lg">InFast Academy</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:bg-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 overflow-y-auto">
              {renderNavItems(() => setMobileMenuOpen(false))}
            </nav>
            <div className="p-4 border-t flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Admin'}
                  alt="Avatar"
                  className="w-9 h-9 rounded-full bg-secondary"
                />
                <div>
                  <p className="text-sm font-semibold leading-none mb-1">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role?.replace('_', ' ')}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-muted-foreground hover:text-destructive rounded-md hover:bg-secondary"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Global Dashboard Header */}
        <header className="flex items-center justify-between h-16 px-6 border-b bg-card select-none">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1 rounded-md text-muted-foreground hover:bg-secondary md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground font-medium select-none truncate">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/45 shrink-0" />}
                  <span className={idx === breadcrumbs.length - 1 ? "text-foreground font-semibold" : "hover:text-foreground/80 transition-colors"}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-primary rounded-md hover:bg-secondary transition-colors"
              title={theme === 'dark' ? 'Yorug\' rejim' : 'Qorong\'u rejim'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification Bell Badge */}
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 text-muted-foreground hover:text-primary rounded-md hover:bg-secondary transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive animate-pulse" />
            </button>

            {/* User Profile Quick Menu */}
            <div className="h-6 w-[1px] bg-border mx-1" />
            <Link to="/settings" className="flex items-center gap-2 p-1.5 rounded-md hover:bg-secondary transition-colors">
              <img
                src={user?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Admin'}
                alt="Profile"
                className="w-7 h-7 rounded-full bg-secondary shrink-0"
              />
              <span className="hidden sm:inline text-sm font-semibold truncate max-w-[120px]">
                {user?.fullName.split(' ')[0]}
              </span>
            </Link>
          </div>
        </header>

        {/* Scrollable Viewport Content */}
        <main className="flex-1 overflow-y-auto bg-background/50 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

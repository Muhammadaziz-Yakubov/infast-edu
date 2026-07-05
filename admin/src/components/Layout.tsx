import React, { useState } from 'react';
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
  Search,
  Tv,
  Calendar,
  Gift,
  ClipboardCheck,
  MessageSquare,
  Megaphone,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [marketingExpanded, setMarketingExpanded] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const isDark = document.documentElement.classList.contains('dark');
    return isDark ? 'dark' : 'light';
  });

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

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'Groups', path: '/groups', icon: FolderKanban },
    { name: 'Courses', path: '/courses', icon: BookOpen },
    { name: 'LMS Builder', path: '/lms', icon: GraduationCap },
    { name: 'LMS Check', path: '/lms-check', icon: ClipboardCheck },
    { name: 'Homework', path: '/homework', icon: FileCode },

    { name: 'Payments', path: '/payments', icon: CreditCard },
    { name: 'Attendance', path: '/attendance', icon: CheckSquare },
    { name: 'Market', path: '/market', icon: ShoppingBag },
    { name: 'Stories', path: '/stories', icon: Tv },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Referrals', path: '/referrals', icon: Gift },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Chat', path: '/chat', icon: MessageSquare },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const marketingSubItems = [
    { name: 'CRM Dashboard', path: '/marketing' },
    { name: 'Leads', path: '/marketing/leads' },
    { name: 'Pipeline', path: '/marketing/pipeline' },
    { name: 'Campaigns', path: '/marketing/campaigns' },
    { name: 'Sources', path: '/marketing/sources' },
    { name: 'Managers', path: '/marketing/managers' },
    { name: 'CRM Analytics', path: '/marketing/analytics' },
  ];

  const renderNavItems = (onItemClick?: () => void) => {
    const isMarketingActive = location.pathname.startsWith('/marketing');

    return (
      <div className="space-y-1">
        {/* Top items */}
        {menuItems.slice(0, 1).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onItemClick}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-secondary text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-secondary hover:text-primary'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              {item.name}
            </Link>
          );
        })}

        {/* Collapsible Marketing CRM Menu */}
        <div>
          <button
            onClick={() => setMarketingExpanded(!marketingExpanded)}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isMarketingActive
                ? 'bg-secondary/40 text-primary font-semibold'
                : 'text-muted-foreground hover:bg-secondary hover:text-primary'
            }`}
          >
            <div className="flex items-center gap-3">
              <Megaphone className={`w-4 h-4 ${isMarketingActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <span>Marketing</span>
            </div>
            {marketingExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {marketingExpanded && (
            <div className="mt-1 ml-4 pl-3 border-l space-y-1 animate-in slide-in-from-top-1 duration-100">
              {marketingSubItems.map((subItem) => {
                const isSubActive = location.pathname === subItem.path;
                return (
                  <Link
                    key={subItem.name}
                    to={subItem.path}
                    onClick={onItemClick}
                    className={`block px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      isSubActive
                        ? 'bg-secondary text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-secondary hover:text-primary'
                    }`}
                  >
                    {subItem.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Remaining Main Menu Items */}
        {menuItems.slice(1).map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onItemClick}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-secondary text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-secondary hover:text-primary'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              {item.name}
            </Link>
          );
        })}
      </div>
    );
  };

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
            {/* Header Global Search */}
            <div className="relative w-64 hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Qidiruv..."
                className="w-full pl-9 pr-4 py-1.5 text-sm rounded-md bg-secondary border border-transparent focus:border-border focus:bg-background outline-none transition-all"
              />
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

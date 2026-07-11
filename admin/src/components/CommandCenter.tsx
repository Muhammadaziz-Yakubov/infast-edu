import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudents } from '../api/students';
import { getGroups } from '../api/groups';
import { getPayments } from '../api/payments';
import { getLeads } from '../api/leads';
import {
  Search,
  Users,
  FolderKanban,
  CreditCard,
  Sparkles,
  Command,
  ArrowRight,
  Sun,
  Moon,
  Home,
  BookOpen,
  FileCode,
  CheckSquare,
  MessageSquare,
  Brain,
  Send,
  Gift,
  Settings,
  Activity,
  Layers,
} from 'lucide-react';

interface CommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Quick Actions' | 'Students' | 'Groups' | 'Payments' | 'Leads' | 'AI Commands';
  title: string;
  subtitle?: string;
  icon: React.ComponentType<any>;
  action: () => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Search query
  const [query, setQuery] = useState('');

  // Loaded DB data
  const [students, setStudents] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Navigation selected index
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Load data when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setLoading(true);
      
      // Load all relevant data in parallel
      Promise.all([
        getStudents().catch(() => []),
        getGroups().catch(() => []),
        getPayments().catch(() => []),
        getLeads({ limit: 100 }).catch(() => [])
      ])
        .then(([studentsRes, groupsRes, paymentsRes, leadsRes]) => {
          setStudents(studentsRes || []);
          setGroups(groupsRes || []);
          setPayments(paymentsRes || []);
          // Handle lead response (could be wrapped in an object or array)
          setLeads(Array.isArray(leadsRes) ? leadsRes : leadsRes?.leads || leadsRes?.data || []);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });

      // Focus input field
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  // Helper to toggle theme
  const toggleThemeAction = () => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    onClose();
  };

  // Build the complete list of options
  const getCommandItems = (): CommandItem[] => {
    const items: CommandItem[] = [];

    // 1. Navigation items (Show always, or matching query)
    const navs = [
      { title: 'Dashboard bosh sahifasi', path: '/', icon: Home },
      { title: 'Talabalar ro\'yxati', path: '/students', icon: Users },
      { title: 'Guruhlar boshqaruvi', path: '/groups', icon: FolderKanban },
      { title: 'Kurslar ro\'yxati', path: '/courses', icon: BookOpen },
      { title: 'LMS Builder', path: '/lms', icon: Layers },
      { title: 'Lids (Marketing CRM)', path: '/marketing/leads', icon: Users },
      { title: 'Pipeline ko\'rinishi', path: '/marketing/pipeline', icon: FolderKanban },
      { title: 'To\'lovlar boshqaruvi', path: '/payments', icon: CreditCard },
      { title: 'AI Chat', path: '/chat', icon: MessageSquare },
      { title: 'AI Lesson Creator', path: '/ai-lesson-creator', icon: Sparkles },
      { title: 'AI Advisor', path: '/ai-advisor', icon: Brain },
      { title: 'Sozlamalar', path: '/settings', icon: Settings },
    ];

    navs.forEach(n => {
      if (!query || n.title.toLowerCase().includes(query.toLowerCase())) {
        items.push({
          id: `nav-${n.path}`,
          category: 'Navigation',
          title: n.title,
          subtitle: `O'tish: ${n.path}`,
          icon: n.icon,
          action: () => {
            navigate(n.path);
            onClose();
          }
        });
      }
    });

    // 2. Quick Actions
    const quickActions = [
      { title: 'Yangi talaba qo\'shish', action: () => { navigate('/students'); onClose(); }, icon: Users },
      { title: 'Yangi guruh yaratish', action: () => { navigate('/groups'); onClose(); }, icon: FolderKanban },
      { title: 'Yangi lid qo\'shish', action: () => { navigate('/marketing/leads'); onClose(); }, icon: Users },
      { title: 'Mavzuni almashtirish (Dark/Light)', action: toggleThemeAction, icon: Sun },
    ];

    quickActions.forEach((qa, idx) => {
      if (!query || qa.title.toLowerCase().includes(query.toLowerCase())) {
        items.push({
          id: `qa-${idx}`,
          category: 'Quick Actions',
          title: qa.title,
          icon: qa.icon,
          action: qa.action
        });
      }
    });

    // 3. AI Commands
    const aiCommands = [
      { title: 'AI Lesson Creator-da yangi dars rejasi yaratish', path: '/ai-lesson-creator', subtitle: 'AI yordamida dars mazmuni yaratish' },
      { title: 'AI Biznes Maslahatchi tahlillarini ochish', path: '/ai-advisor', subtitle: 'Markaz ko\'rsatkichlarini AI bilan tahlil qilish' },
      { title: 'AI Chat-ni ishga tushirish', path: '/chat', subtitle: 'Sun\'iy intellekt bilan muloqot' },
    ];

    aiCommands.forEach((ai, idx) => {
      if (!query || ai.title.toLowerCase().includes(query.toLowerCase())) {
        items.push({
          id: `ai-${idx}`,
          category: 'AI Commands',
          title: ai.title,
          subtitle: ai.subtitle,
          icon: Sparkles,
          action: () => {
            navigate(ai.path);
            onClose();
          }
        });
      }
    });

    // 4. Students
    students.forEach(s => {
      const nameMatch = s.fullName.toLowerCase().includes(query.toLowerCase());
      const phoneMatch = s.phone && s.phone.includes(query);
      if (query && (nameMatch || phoneMatch)) {
        items.push({
          id: `student-${s._id}`,
          category: 'Students',
          title: s.fullName,
          subtitle: `Tel: ${s.phone || 'Noma\'lum'} | Balans: ${s.balance?.toLocaleString() || 0} UZS`,
          icon: Users,
          action: () => {
            navigate(`/students/${s._id}`);
            onClose();
          }
        });
      }
    });

    // 5. Groups
    groups.forEach(g => {
      if (query && g.name.toLowerCase().includes(query.toLowerCase())) {
        items.push({
          id: `group-${g._id}`,
          category: 'Groups',
          title: g.name,
          subtitle: `Vaqti: ${g.schedule?.time || 'Noma\'lum'} | Kurs: ${g.courseId?.title || ''}`,
          icon: FolderKanban,
          action: () => {
            navigate('/groups');
            onClose();
          }
        });
      }
    });

    // 6. Payments
    payments.forEach(p => {
      const studentName = p.studentId?.fullName || 'Noma\'lum talaba';
      if (query && (studentName.toLowerCase().includes(query.toLowerCase()) || p.amount?.toString().includes(query))) {
        items.push({
          id: `payment-${p._id}`,
          category: 'Payments',
          title: `${studentName} - To'lov`,
          subtitle: `Summa: ${p.amount?.toLocaleString()} UZS | Status: ${p.status}`,
          icon: CreditCard,
          action: () => {
            navigate('/payments');
            onClose();
          }
        });
      }
    });

    // 7. Leads
    leads.forEach(l => {
      const nameMatch = l.fullName && l.fullName.toLowerCase().includes(query.toLowerCase());
      const phoneMatch = l.phone && l.phone.includes(query);
      if (query && (nameMatch || phoneMatch)) {
        items.push({
          id: `lead-${l._id}`,
          category: 'Leads',
          title: l.fullName || 'Ismsiz Lid',
          subtitle: `Status: ${l.status || 'NEW'} | Manba: ${l.source || 'Noma\'lum'}`,
          icon: Users,
          action: () => {
            navigate(`/marketing/leads/${l._id}`);
            onClose();
          }
        });
      }
    });

    return items;
  };

  const filteredItems = getCommandItems();

  // Keyboard navigation inside command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  // Adjust scroll when selectedIndex changes
  useEffect(() => {
    const selectedEl = document.getElementById(`cmd-item-${selectedIndex}`);
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  // Group items by category to render them with nice headers
  const grouped: Record<string, CommandItem[]> = {};
  filteredItems.forEach(item => {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category].push(item);
  });

  // Calculate local absolute index for hovering and selecting
  let itemCounter = 0;

  return (
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      <div 
        ref={containerRef}
        className="w-full max-w-2xl bg-card border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Search Input Header */}
        <div className="p-4 border-b flex items-center gap-3 relative shrink-0">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Tizim bo'ylab qidirish, tezkor amallar yoki AI buyruqlar..."
            className="flex-1 text-sm bg-transparent outline-none border-none placeholder:text-muted-foreground text-foreground"
          />
          <div className="flex items-center gap-1">
            <kbd className="text-[10px] font-bold bg-secondary px-1.5 py-0.5 rounded border border-border text-muted-foreground">ESC</kbd>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {loading && filteredItems.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-muted-foreground">Ma'lumotlar yuklanmoqda...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              Hech narsa topilmadi. Qidiruv so'zini o'zgartirib ko'ring.
            </div>
          ) : (
            Object.keys(grouped).map(category => (
              <div key={category} className="space-y-1 mb-3">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-1.5">{category}</h4>
                <div className="space-y-0.5">
                  {grouped[category].map(item => {
                    const currentIdx = itemCounter;
                    itemCounter++;
                    const active = currentIdx === selectedIndex;

                    return (
                      <div
                        id={`cmd-item-${currentIdx}`}
                        key={item.id}
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(currentIdx)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-xs select-none ${
                          active 
                            ? 'bg-primary text-primary-foreground font-semibold' 
                            : 'hover:bg-secondary text-foreground'
                        }`}
                      >
                        <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{item.title}</p>
                          {item.subtitle && (
                            <p className={`text-[10px] truncate ${active ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                        {active && <ArrowRight className="w-3.5 h-3.5 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Command Center Footer Hint */}
        <div className="px-4 py-2.5 bg-secondary/30 border-t flex items-center justify-between text-[10px] text-muted-foreground select-none shrink-0 font-medium">
          <div className="flex items-center gap-4">
            <span>↑↓ Harakatlanish</span>
            <span>↵ Tanlash</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Command className="w-3.5 h-3.5" />
            <span>Center</span>
          </div>
        </div>
      </div>
    </div>
  );
};

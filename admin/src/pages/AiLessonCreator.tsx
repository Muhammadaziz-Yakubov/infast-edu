import React, { useState, useEffect, useRef } from 'react';
import { getCourses } from '../api/courses';
import { getGroups } from '../api/groups';
import { apiClient } from '../api/client';
import {
  Sparkles,
  Plus,
  Trash2,
  Send,
  Save,
  BookOpen,
  Layers,
  FolderKanban,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Activity,
  Code,
  GraduationCap,
  ListTodo,
  FileText,
  RotateCw,
} from 'lucide-react';

interface ChatHistoryItem {
  _id: string;
  groupId?: { _id: string; name: string };
  courseId?: { _id: string; title: string };
  moduleId?: { _id: string; title: string };
  lessonId?: { _id: string; title: string };
  difficulty?: string;
  language?: string;
  quickActions?: string[];
  messages: { role: string; content: string; timestamp?: Date }[];
  updatedAt: string;
}

export const AiLessonCreator: React.FC = () => {
  // Config & Metadata states
  const [courses, setCourses] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);

  // Selection states
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('Medium');
  const [language, setLanguage] = useState<string>('Uzbek');

  // Input & Quick Actions
  const [topicDescription, setTopicDescription] = useState<string>('');
  const [quickActions, setQuickActions] = useState<string[]>([
    'Practice',
    'Homework',
    'Quiz',
    'Lesson Summary',
    'Learning Objectives',
  ]);

  // Chat & History states
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [streamedContent, setStreamedContent] = useState<string>('');

  // Parsed AI JSON Data
  const [previewData, setPreviewData] = useState<any>(null);
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    practice: true,
    homework: true,
    summary: true,
    objectives: true,
  });

  // UI state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'preview'>('chat');
  
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMetadata();
    loadChatHistory();
  }, []);

  // Sync course selection with selected group
  useEffect(() => {
    if (selectedGroupId && groups.length > 0) {
      const group = groups.find((g) => g._id === selectedGroupId);
      if (group && group.courseId) {
        const courseId = typeof group.courseId === 'object' ? group.courseId._id : group.courseId;
        setSelectedCourseId(courseId);
      }
    }
  }, [selectedGroupId, groups]);

  // Load modules based on selected group or course
  useEffect(() => {
    const loadModulesForSelection = async () => {
      if (selectedGroupId) {
        try {
          const res = await apiClient.get(`/lms/groups/${selectedGroupId}/modules`);
          const mods = res.data.data || res.data || [];
          setModules(mods);
          setLessons([]);
          setSelectedModuleId('');
          setSelectedLessonId('');
        } catch (err) {
          console.error("Failed to load group modules", err);
          setModules([]);
          setLessons([]);
        }
      } else if (selectedCourseId) {
        const course = courses.find((c) => c._id === selectedCourseId);
        if (course && course.modules) {
          setModules(course.modules);
          setLessons([]);
          setSelectedModuleId('');
          setSelectedLessonId('');
        } else {
          setModules([]);
          setLessons([]);
        }
      } else {
        setModules([]);
        setLessons([]);
        setSelectedModuleId('');
        setSelectedLessonId('');
      }
    };

    loadModulesForSelection();
  }, [selectedGroupId, selectedCourseId, courses]);

  // Load lessons based on selected module
  useEffect(() => {
    if (selectedModuleId && modules.length > 0) {
      const mod = modules.find((m) => m._id === selectedModuleId);
      if (mod && mod.lessons) {
        setLessons(mod.lessons);
        setSelectedLessonId('');
      } else {
        setLessons([]);
      }
    } else {
      setLessons([]);
      setSelectedLessonId('');
    }
  }, [selectedModuleId, modules]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamedContent]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadMetadata = async () => {
    try {
      const [coursesData, groupsData] = await Promise.all([getCourses(), getGroups()]);
      setCourses(coursesData || []);
      setGroups(groupsData || []);
    } catch (err: any) {
      showToast("Metadata yuklashda xatolik yuz berdi", "error");
    }
  };

  const loadChatHistory = async () => {
    try {
      const res = await apiClient.get('/ai/history');
      setHistory(res.data.data || res.data || []);
    } catch (err: any) {
      console.error("Failed to load AI history", err);
    }
  };

  const startNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setStreamedContent('');
    setPreviewData(null);
    setTopicDescription('');
    setActiveTab('chat');
  };

  const selectChat = async (chatId: string) => {
    try {
      setActiveChatId(chatId);
      const res = await apiClient.get(`/ai/history/${chatId}`);
      const chat: ChatHistoryItem = res.data.data || res.data;
      
      // Restore states
      setMessages(chat.messages || []);
      setSelectedGroupId(chat.groupId?._id || '');
      setSelectedCourseId(chat.courseId?._id || '');
      setSelectedModuleId(chat.moduleId?._id || '');
      setSelectedLessonId(chat.lessonId?._id || '');
      setDifficulty(chat.difficulty || 'Medium');
      setLanguage(chat.language || 'Uzbek');
      setQuickActions(chat.quickActions || []);
      setStreamedContent('');
      
      // Try to find the last assistant message and parse it for preview
      const assistantMsgs = chat.messages.filter(m => m.role === 'assistant');
      if (assistantMsgs.length > 0) {
        const lastMsg = assistantMsgs[assistantMsgs.length - 1].content;
        parseAndSetPreview(lastMsg);
      } else {
        setPreviewData(null);
      }
      
      setActiveTab('chat');
    } catch (err) {
      showToast("Chat yuklashda xatolik yuz berdi", "error");
    }
  };

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Bu suhbatni o'chirmoqchimisiz?")) return;
    try {
      await apiClient.delete(`/ai/history/${chatId}`);
      showToast("Suhbat o'chirildi");
      if (activeChatId === chatId) {
        startNewChat();
      }
      loadChatHistory();
    } catch (err) {
      showToast("Suhbatni o'chirishda xatolik", "error");
    }
  };

  const toggleQuickAction = (action: string) => {
    if (quickActions.includes(action)) {
      setQuickActions(quickActions.filter((a) => a !== action));
    } else {
      setQuickActions([...quickActions, action]);
    }
  };

  const parseAndSetPreview = (jsonStr: string) => {
    try {
      let parsed = JSON.parse(jsonStr);
      setPreviewData(parsed);
      
      // pre-populate open accordions
      const accs: Record<string, boolean> = {};
      if (parsed.practice) accs.practice = true;
      if (parsed.homework) accs.homework = true;
      if (parsed.lessonSummary) accs.summary = true;
      if (parsed.learningObjectives) accs.objectives = true;
      if (parsed.quizRounds) {
        parsed.quizRounds.forEach((r: any) => {
          accs[`round_${r.round}`] = true;
        });
      }
      setOpenAccordions(accs);
    } catch (err) {
      // try to extract JSON if wrapped in markdown code blocks
      const clean = jsonStr.replace(/```json/gi, '').replace(/```/gi, '').trim();
      try {
        const parsed = JSON.parse(clean);
        setPreviewData(parsed);
      } catch (e2) {
        console.error("AI response is not valid JSON", jsonStr);
        setPreviewData(null);
      }
    }
  };

  const handleSend = async () => {
    if (!topicDescription.trim()) return;

    const userMessage = topicDescription;
    setTopicDescription('');
    setIsGenerating(true);
    setStreamedContent('');

    // Optimistically update messages in UI
    const updatedMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(updatedMessages);

    try {
      const token = localStorage.getItem('admin_access_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      // Determine endpoint: generate-lesson for new or chat for continuation
      const isNewChat = !activeChatId;
      const endpoint = isNewChat ? '/ai/generate-lesson' : '/ai/chat';
      
      const payload: any = isNewChat ? {
        groupId: selectedGroupId || undefined,
        courseId: selectedCourseId || undefined,
        moduleId: selectedModuleId || undefined,
        lessonId: selectedLessonId || undefined,
        difficulty,
        language,
        topicDescription: userMessage,
        quickActions,
      } : {
        message: userMessage,
        chatId: activeChatId,
      };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Tizim bilan bog'lanishda xatolik");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      if (!reader) throw new Error("Stream read error");

      let accumulated = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.content) {
                accumulated += parsed.content;
                setStreamedContent(accumulated);
              } else if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (err) {
              // Ignore partial chunk parse error
            }
          }
        }
      }

      // Finish streaming
      setMessages([...updatedMessages, { role: 'assistant', content: accumulated }]);
      setStreamedContent('');
      
      // Parse the JSON data for preview
      parseAndSetPreview(accumulated);
      
      // Switch tab to preview automatically if we generated materials
      if (isNewChat) {
        setActiveTab('preview');
        showToast("Materiallar generatsiya qilindi! Preview sahifasida ko'rishingiz mumkin.");
      } else {
        showToast("Suhbat yangilandi");
      }

      // Reload chat list
      await loadChatHistory();
      
      // If it was a new chat, find the newly created chatId
      if (isNewChat) {
        const historyRes = await apiClient.get('/ai/history');
        const latestChats = historyRes.data.data || historyRes.data || [];
        setHistory(latestChats);
        if (latestChats.length > 0) {
          setActiveChatId(latestChats[0]._id);
        }
      }

    } catch (err: any) {
      showToast(err.message || "Xatolik yuz berdi", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToLesson = async () => {
    if (!selectedLessonId) {
      showToast("Iltimos, materiallarni bog'lash uchun darsni tanlang!", "error");
      return;
    }
    if (!previewData) {
      showToast("Saqlash uchun materiallar mavjud emas!", "error");
      return;
    }

    try {
      const payload: any = {
        lessonId: selectedLessonId,
        lessonSummary: previewData.lessonSummary || undefined,
        learningObjectives: previewData.learningObjectives || undefined,
      };

      if (previewData.practice) {
        payload.practice = {
          title: previewData.practice.title,
          description: previewData.practice.description,
          starterCode: previewData.practice.starterCode || '',
          validationRules: previewData.practice.validationRules || [],
          xpReward: 50,
          coinReward: 10,
        };
      }

      if (previewData.homework) {
        payload.homework = {
          title: previewData.homework.title,
          description: previewData.homework.description,
          xpReward: 100,
          coinReward: 20,
        };
      }

      if (previewData.quizRounds && previewData.quizRounds.length > 0) {
        const mappedQuiz: any[] = [];
        previewData.quizRounds.forEach((roundObj: any) => {
          if (roundObj.questions) {
            roundObj.questions.forEach((q: any) => {
              mappedQuiz.push({
                question: q.question,
                options: q.options,
                correctAnswerIndex: Number(q.correctAnswer),
                round: Number(roundObj.round),
              });
            });
          }
        });
        payload.quiz = mappedQuiz;
      }

      await apiClient.post('/ai/save', payload);
      showToast("Materiallar darsga muvaffaqiyatli bog'lab saqlandi!");
    } catch (err: any) {
      showToast("Saqlashda xatolik yuz berdi: " + (err.response?.data?.message || err.message), "error");
    }
  };

  const renderMarkdown = (text: string) => {
    if (!text) return '';
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/`(.*?)`/g, '<code class="bg-secondary/80 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>');
    html = html.replace(/^\s*-\s+(.*)$/gm, '<li class="ml-4 list-disc text-muted-foreground">$1</li>');
    
    return <div dangerouslySetInnerHTML={{ __html: html }} className="space-y-1.5 leading-relaxed break-words text-sm" />;
  };

  const toggleAccordion = (section: string) => {
    setOpenAccordions(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row gap-6 relative select-none animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border transition-all ${
          toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* LEFT SIDEBAR: History */}
      <aside className="w-full md:w-64 bg-card border rounded-2xl flex flex-col shrink-0 overflow-hidden shadow-sm h-1/4 md:h-full">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-bold text-sm">Suhbatlar tarixi</span>
          </div>
          <button
            onClick={startNewChat}
            className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-primary transition-all"
            title="Yangi chat boshlash"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">Tarix topilmadi.</p>
          ) : (
            history.map((item) => {
              const active = activeChatId === item._id;
              const date = new Date(item.updatedAt).toLocaleDateString();
              const lessonTitle = item.lessonId?.title || "Dars belgilanmagan";
              return (
                <div
                  key={item._id}
                  onClick={() => selectChat(item._id)}
                  className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-all ${
                    active ? 'bg-secondary text-primary font-bold border border-border' : 'hover:bg-secondary/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{lessonTitle}</p>
                    <p className="text-[10px] text-muted-foreground/80 mt-0.5">{date}</p>
                  </div>
                  <button
                    onClick={(e) => deleteChat(item._id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive rounded transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* CENTER & RIGHT CONTENT WORKSPACE */}
      <div className="flex-1 bg-card border rounded-2xl overflow-hidden flex flex-col shadow-sm h-3/4 md:h-full">
        {/* Workspace Tab Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-card/50 select-none">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'chat' ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
              }`}
            >
              💬 AI Chat
            </button>
            <button
              onClick={() => {
                if (!previewData) {
                  showToast("Avval AI yordamida material generatsiya qiling", "error");
                  return;
                }
                setActiveTab('preview');
              }}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'preview' ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
              }`}
            >
              👁️ Preview & Tahrirlash
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
            AI Lesson Creator
          </div>
        </div>

        {/* Tab 1: AI Chat Interface */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Top Selector Panel */}
            <div className="p-4 border-b bg-secondary/10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground flex items-center gap-1"><FolderKanban className="w-3 h-3"/> Guruh</label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full text-xs rounded-lg border bg-background px-2 py-1.5 outline-none"
                >
                  <option value="">Tanlang...</option>
                  {groups.map((g) => (
                    <option key={g._id} value={g._id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground flex items-center gap-1"><BookOpen className="w-3 h-3"/> Kurs</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full text-xs rounded-lg border bg-background px-2 py-1.5 outline-none"
                >
                  <option value="">Tanlang...</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground flex items-center gap-1"><Layers className="w-3 h-3"/> Modul</label>
                <select
                  value={selectedModuleId}
                  disabled={!selectedCourseId}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                  className="w-full text-xs rounded-lg border bg-background px-2 py-1.5 outline-none disabled:opacity-50"
                >
                  <option value="">Tanlang...</option>
                  {modules.map((m) => (
                    <option key={m._id} value={m._id}>{m.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground flex items-center gap-1"><GraduationCap className="w-3 h-3"/> Dars</label>
                <select
                  value={selectedLessonId}
                  disabled={!selectedModuleId}
                  onChange={(e) => setSelectedLessonId(e.target.value)}
                  className="w-full text-xs rounded-lg border bg-background px-2 py-1.5 outline-none disabled:opacity-50"
                >
                  <option value="">Tanlang...</option>
                  {lessons.map((l) => (
                    <option key={l._id} value={l._id}>{l.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground flex items-center gap-1"><Activity className="w-3 h-3"/> Qiyinchilik</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full text-xs rounded-lg border bg-background px-2 py-1.5 outline-none"
                >
                  <option value="Easy">Oson (Easy)</option>
                  <option value="Medium">O'rtacha (Medium)</option>
                  <option value="Hard">Qiyin (Hard)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground flex items-center gap-1"><HelpCircle className="w-3 h-3"/> Til</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full text-xs rounded-lg border bg-background px-2 py-1.5 outline-none"
                >
                  <option value="Uzbek">Uzbek</option>
                  <option value="English">English</option>
                </select>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && !streamedContent && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 max-w-md mx-auto py-12">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">AI Lesson Creator yordamchisi</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Dars mavzusini kiriting va qaysi metodik materiallar kerakligini belgilang. AI sizga tayyor Practice, Homework, Quiz va dars rejasini generatsiya qilib beradi!
                    </p>
                  </div>
                </div>
              )}

              {messages.map((m, idx) => {
                const isUser = m.role === 'user';
                return (
                  <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in-50 duration-200`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      isUser ? 'bg-primary text-primary-foreground font-semibold rounded-br-none' : 'bg-secondary/40 border border-border rounded-bl-none text-foreground'
                    }`}>
                      {isUser ? <p className="whitespace-pre-wrap break-words">{m.content}</p> : renderMarkdown(m.content)}
                    </div>
                  </div>
                );
              })}

              {/* Streaming Content */}
              {streamedContent && (
                <div className="flex justify-start animate-in fade-in-50 duration-200">
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-secondary/40 border border-border rounded-bl-none text-foreground text-xs leading-relaxed">
                    {renderMarkdown(streamedContent)}
                    <span className="inline-block w-2.5 h-3.5 bg-primary rounded-sm animate-pulse ml-1 align-middle" />
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Input & Quick Actions Panel */}
            <div className="p-4 border-t bg-card space-y-3">
              {/* Quick Actions Checklist */}
              <div className="flex flex-wrap items-center gap-4 text-xs select-none">
                <span className="font-bold text-muted-foreground">Quick Actions:</span>
                {['Practice', 'Homework', 'Quiz', 'Lesson Summary', 'Learning Objectives'].map((action) => {
                  const active = quickActions.includes(action);
                  return (
                    <label key={action} className="flex items-center gap-1.5 cursor-pointer font-medium hover:text-foreground transition-colors">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleQuickAction(action)}
                        className="rounded border-border text-primary focus:ring-1 focus:ring-primary w-3.5 h-3.5"
                      />
                      {action}
                    </label>
                  );
                })}
              </div>

              {/* Message Prompt Input */}
              <div className="flex gap-2">
                <textarea
                  rows={2}
                  value={topicDescription}
                  disabled={isGenerating}
                  onChange={(e) => setTopicDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Dars shartlarini va mavzusini yozing..."
                  className="flex-1 border rounded-xl p-3 text-xs bg-background outline-none resize-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={isGenerating || !topicDescription.trim()}
                  className="px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {isGenerating ? <RotateCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Interactive Preview & Editor */}
        {activeTab === 'preview' && previewData && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Live Accordion Preview Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* 1. Practice Accordion */}
              {previewData.practice && (
                <div className="border rounded-xl overflow-hidden bg-card">
                  <button
                    onClick={() => toggleAccordion('practice')}
                    className="w-full flex items-center justify-between p-4 bg-secondary/20 hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-primary" />
                      <span className="font-bold text-xs uppercase tracking-wider text-primary">Practice Task</span>
                    </div>
                    {openAccordions.practice ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {openAccordions.practice && (
                    <div className="p-4 border-t space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground">Sarlavha (Title)</label>
                        <input
                          type="text"
                          value={previewData.practice.title || ''}
                          onChange={(e) => setPreviewData({
                            ...previewData,
                            practice: { ...previewData.practice, title: e.target.value }
                          })}
                          className="w-full border rounded-lg p-2 text-xs bg-background outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground">Tavsif (Description)</label>
                        <textarea
                          rows={3}
                          value={previewData.practice.description || ''}
                          onChange={(e) => setPreviewData({
                            ...previewData,
                            practice: { ...previewData.practice, description: e.target.value }
                          })}
                          className="w-full border rounded-lg p-2 text-xs bg-background outline-none resize-none font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground">Boshlang'ich kod (Starter Code)</label>
                        <textarea
                          rows={3}
                          value={previewData.practice.starterCode || ''}
                          onChange={(e) => setPreviewData({
                            ...previewData,
                            practice: { ...previewData.practice, starterCode: e.target.value }
                          })}
                          className="w-full border rounded-lg p-2 text-xs bg-background outline-none font-mono resize-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground">Validation Qoidalari (Har bir qatorga alohida yozing)</label>
                        <textarea
                          rows={2}
                          value={(previewData.practice.validationRules || []).join('\n')}
                          onChange={(e) => setPreviewData({
                            ...previewData,
                            practice: { ...previewData.practice, validationRules: e.target.value.split('\n') }
                          })}
                          className="w-full border rounded-lg p-2 text-xs bg-background outline-none font-mono resize-none"
                          placeholder="contains&#10;const&#10;Object.keys"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. Homework Accordion */}
              {previewData.homework && (
                <div className="border rounded-xl overflow-hidden bg-card">
                  <button
                    onClick={() => toggleAccordion('homework')}
                    className="w-full flex items-center justify-between p-4 bg-secondary/20 hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="font-bold text-xs uppercase tracking-wider text-primary">Homework</span>
                    </div>
                    {openAccordions.homework ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {openAccordions.homework && (
                    <div className="p-4 border-t space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground">Sarlavha (Title)</label>
                        <input
                          type="text"
                          value={previewData.homework.title || ''}
                          onChange={(e) => setPreviewData({
                            ...previewData,
                            homework: { ...previewData.homework, title: e.target.value }
                          })}
                          className="w-full border rounded-lg p-2 text-xs bg-background outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground">Tavsif (Description)</label>
                        <textarea
                          rows={3}
                          value={previewData.homework.description || ''}
                          onChange={(e) => setPreviewData({
                            ...previewData,
                            homework: { ...previewData.homework, description: e.target.value }
                          })}
                          className="w-full border rounded-lg p-2 text-xs bg-background outline-none resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Lesson Summary Accordion */}
              {previewData.lessonSummary !== undefined && (
                <div className="border rounded-xl overflow-hidden bg-card">
                  <button
                    onClick={() => toggleAccordion('summary')}
                    className="w-full flex items-center justify-between p-4 bg-secondary/20 hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="font-bold text-xs uppercase tracking-wider text-primary">Lesson Summary</span>
                    </div>
                    {openAccordions.summary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {openAccordions.summary && (
                    <div className="p-4 border-t space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground">Xulosa mazmuni</label>
                      <textarea
                        rows={4}
                        value={previewData.lessonSummary || ''}
                        onChange={(e) => setPreviewData({
                          ...previewData,
                          lessonSummary: e.target.value
                        })}
                        className="w-full border rounded-lg p-2 text-xs bg-background outline-none resize-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* 4. Learning Objectives Accordion */}
              {previewData.learningObjectives !== undefined && (
                <div className="border rounded-xl overflow-hidden bg-card">
                  <button
                    onClick={() => toggleAccordion('objectives')}
                    className="w-full flex items-center justify-between p-4 bg-secondary/20 hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ListTodo className="w-4 h-4 text-primary" />
                      <span className="font-bold text-xs uppercase tracking-wider text-primary">Learning Objectives</span>
                    </div>
                    {openAccordions.objectives ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {openAccordions.objectives && (
                    <div className="p-4 border-t space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground">Maqsadlar (Har bir qatorga bittadan yozing)</label>
                      <textarea
                        rows={4}
                        value={(previewData.learningObjectives || []).join('\n')}
                        onChange={(e) => setPreviewData({
                          ...previewData,
                          learningObjectives: e.target.value.split('\n')
                        })}
                        className="w-full border rounded-lg p-2 text-xs bg-background outline-none font-mono resize-none"
                        placeholder="Maqsad 1&#10;Maqsad 2"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* 5. Quiz Rounds Accordion */}
              {previewData.quizRounds && previewData.quizRounds.map((roundObj: any) => (
                <div key={roundObj.round} className="border rounded-xl overflow-hidden bg-card">
                  <button
                    onClick={() => toggleAccordion(`round_${roundObj.round}`)}
                    className="w-full flex items-center justify-between p-4 bg-secondary/20 hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-primary" />
                      <span className="font-bold text-xs uppercase tracking-wider text-primary">Round {roundObj.round} ({roundObj.questions?.length || 0} savollar)</span>
                    </div>
                    {openAccordions[`round_${roundObj.round}`] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {openAccordions[`round_${roundObj.round}`] && (
                    <div className="p-4 border-t space-y-4 divide-y">
                      {roundObj.questions && roundObj.questions.map((q: any, qIdx: number) => (
                        <div key={qIdx} className={`space-y-3 ${qIdx > 0 ? 'pt-4' : ''}`}>
                          <div className="flex gap-2">
                            <span className="font-bold text-xs text-primary">{qIdx + 1}.</span>
                            <div className="flex-1 space-y-1">
                              <label className="text-[10px] font-bold text-muted-foreground">Savol</label>
                              <input
                                type="text"
                                value={q.question || ''}
                                onChange={(e) => {
                                  const updated = { ...previewData };
                                  updated.quizRounds.find((r: any) => r.round === roundObj.round).questions[qIdx].question = e.target.value;
                                  setPreviewData(updated);
                                }}
                                className="w-full border rounded-lg p-2 text-xs bg-background outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-4">
                            {q.options && q.options.map((opt: string, oIdx: number) => (
                              <div key={oIdx} className="space-y-1">
                                <label className="text-[9px] font-bold text-muted-foreground">Variant {String.fromCharCode(65 + oIdx)}</label>
                                <input
                                  type="text"
                                  value={opt || ''}
                                  onChange={(e) => {
                                    const updated = { ...previewData };
                                    updated.quizRounds.find((r: any) => r.round === roundObj.round).questions[qIdx].options[oIdx] = e.target.value;
                                    setPreviewData(updated);
                                  }}
                                  className="w-full border rounded-lg p-2 text-xs bg-background outline-none"
                                />
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted-foreground">To'g'ri javob indeksi (0-A, 1-B, 2-C, 3-D)</label>
                              <select
                                value={q.correctAnswer}
                                onChange={(e) => {
                                  const updated = { ...previewData };
                                  updated.quizRounds.find((r: any) => r.round === roundObj.round).questions[qIdx].correctAnswer = Number(e.target.value);
                                  setPreviewData(updated);
                                }}
                                className="w-full border rounded-lg p-2 text-xs bg-background outline-none"
                              >
                                <option value={0}>Variant A (0)</option>
                                <option value={1}>Variant B (1)</option>
                                <option value={2}>Variant C (2)</option>
                                <option value={3}>Variant D (3)</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted-foreground">To'g'ri javob izohi (Explanation)</label>
                              <input
                                type="text"
                                value={q.explanation || ''}
                                onChange={(e) => {
                                  const updated = { ...previewData };
                                  updated.quizRounds.find((r: any) => r.round === roundObj.round).questions[qIdx].explanation = e.target.value;
                                  setPreviewData(updated);
                                }}
                                className="w-full border rounded-lg p-2 text-xs bg-background outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

            </div>

            {/* Save Materials Action Footer */}
            <div className="p-4 border-t bg-card/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold">Mavjud dars:</span>
                <span className="font-bold text-foreground">
                  {selectedLessonId ? lessons.find(l => l._id === selectedLessonId)?.title || "Tanlangan dars" : "Dars tanlanmagan"}
                </span>
              </div>
              <button
                onClick={handleSaveToLesson}
                disabled={!selectedLessonId}
                className="w-full sm:w-auto px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Darsga bog'lab saqlash
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiLessonCreator;

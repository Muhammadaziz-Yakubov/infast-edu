import React, { useEffect, useState } from 'react';
import { getLibraryItems, createLibraryItem, updateLibraryItem, deleteLibraryItem, type LibraryItem } from '../api/library';
import {
  BookOpen,
  Video,
  Plus,
  Search,
  Trash2,
  Edit2,
  X,
  ExternalLink,
  PlusCircle,
  FileText,
  User,
  Tag,
} from 'lucide-react';

export const Library: React.FC = () => {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'VIDEO' | 'BOOK'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'VIDEO' | 'BOOK'>('VIDEO');
  const [url, setUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [author, setAuthor] = useState('InFast IT Academy');
  const [category, setCategory] = useState('Dasturlash');

  useEffect(() => {
    loadItems();
  }, [activeTab]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const typeParam = activeTab === 'ALL' ? undefined : activeTab;
      const data = await getLibraryItems(typeParam);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setType('VIDEO');
    setUrl('');
    setThumbnailUrl('');
    setAuthor('InFast IT Academy');
    setCategory('Dasturlash');
    setModalOpen(true);
  };

  const handleOpenEdit = (item: LibraryItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description);
    setType(item.type);
    setUrl(item.url);
    setThumbnailUrl(item.thumbnailUrl || '');
    setAuthor(item.author || 'InFast IT Academy');
    setCategory(item.category || 'Dasturlash');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        description,
        type,
        url,
        thumbnailUrl: thumbnailUrl || undefined,
        author: author || 'InFast IT Academy',
        category: category || 'Dasturlash',
      };

      if (editingItem) {
        await updateLibraryItem(editingItem._id, payload);
      } else {
        await createLibraryItem(payload);
      }
      setModalOpen(false);
      loadItems();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Ushbu resursni kutubxonadan o\'chirishni tasdiqlaysizmi?')) {
      await deleteLibraryItem(id);
      loadItems();
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.author && item.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Kutubxona Boshqaruvi</h1>
          <p className="text-muted-foreground">O'quvchilar uchun video darslar, vebinarlar va IT kitoblar bazasi.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Yangi Resurs Qo'shish
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border">
        {/* Tabs */}
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'ALL'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
            }`}
          >
            Barchasi
          </button>
          <button
            onClick={() => setActiveTab('VIDEO')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'VIDEO'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            Videolar
          </button>
          <button
            onClick={() => setActiveTab('BOOK')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'BOOK'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Kitoblar
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Nomi, muallif yoki kategoriya..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border rounded-lg bg-background outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-card border rounded-2xl p-12 text-center text-muted-foreground space-y-2">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <p className="font-semibold text-sm">Resurslar topilmadi</p>
          <p className="text-xs">Kutubxonaga yangi video yoki kitob qo'shing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="bg-card border rounded-2xl shadow-sm overflow-hidden flex flex-col hover:border-primary/50 transition-all group"
            >
              {/* Media Thumbnail */}
              <div className="relative aspect-[16/9] w-full bg-secondary overflow-hidden">
                <img
                  src={
                    item.thumbnailUrl ||
                    (item.type === 'VIDEO'
                      ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'
                      : 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80')
                  }
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span
                  className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 backdrop-blur-md shadow-sm ${
                    item.type === 'VIDEO'
                      ? 'bg-red-500/90 text-white'
                      : 'bg-emerald-500/90 text-white'
                  }`}
                >
                  {item.type === 'VIDEO' ? <Video className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
                  {item.type === 'VIDEO' ? 'Video' : 'Kitob'}
                </span>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                    <span className="flex items-center gap-1 font-medium">
                      <User className="w-3 h-3 text-primary" /> {item.author || 'InFast IT Academy'}
                    </span>
                    <span className="flex items-center gap-1 bg-secondary px-2 py-0.5 rounded text-[10px] font-semibold">
                      <Tag className="w-2.5 h-2.5" /> {item.category || 'General'}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    Ochish <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-muted-foreground hover:text-primary rounded-md hover:bg-secondary transition-colors"
                      title="Tahrirlash"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-secondary transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-card border rounded-2xl p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold">
                {editingItem ? 'Resursni Tahrirlash' : 'Yangi Video yoki Kitob Qo\'shish'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:bg-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Select */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Resurs turi</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType('VIDEO')}
                    className={`flex items-center justify-center gap-2 p-2.5 border rounded-xl font-bold text-xs transition-all ${
                      type === 'VIDEO'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    Video Dars
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('BOOK')}
                    className={`flex items-center justify-center gap-2 p-2.5 border rounded-xl font-bold text-xs transition-all ${
                      type === 'BOOK'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    Kitob / PDF
                  </button>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Sarlavha</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Clean Code va Algoritmlar"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Tavsif</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Qisqacha mazmuni..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              {/* URL */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  {type === 'VIDEO' ? 'Video Havolasi (YouTube / MP4 URL)' : 'Kitob / PDF Havolasi'}
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Thumbnail URL */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Muqova rasmi (Thumbnail URL)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Author & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Muallif / Spiker</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Kategoriya</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-secondary transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;

import React, { useState, useEffect } from 'react';
import { Tv, Plus, Trash2, Heart, Eye, Image, Video, Loader2 } from 'lucide-react';
import { getStories, createStory, deleteStory } from '../api/stories';

interface StoryItem {
  _id: string;
  title: string;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  thumbnail?: string;
  likesCount: number;
  viewers: string[];
  duration: number;
  createdAt: string;
}

export const Stories: React.FC = () => {
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [duration, setDuration] = useState(8);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const data = await getStories();
      setStories(data);
    } catch (err) {
      console.error('Stories fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !mediaUrl.trim()) return;
    try {
      setCreating(true);
      await createStory({ title: title.trim(), mediaUrl: mediaUrl.trim(), mediaType, duration });
      setTitle('');
      setMediaUrl('');
      setMediaType('IMAGE');
      setDuration(8);
      await fetchStories();
    } catch (err) {
      console.error('Story create error:', err);
      alert('Xatolik yuz berdi. Qayta urinib ko\'ring.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu istoriyani o\'chirmoqchimisiz?')) return;
    try {
      await deleteStory(id);
      setStories((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error('Story delete error:', err);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ', ' + d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Istoriyalar</h1>
        <p className="text-muted-foreground">
          Talabalar ilovasida ko'rinadigan Instagram-uslubidagi istoriyalarni boshqaring.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── CREATE STORY FORM ── */}
        <div className="lg:col-span-1 bg-card border rounded-xl p-6 shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-sm border-b pb-2 flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
            <Plus className="w-4 h-4 text-primary" />
            Yangi Istoriya Qo'shish
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Sarlavha</label>
              <input
                type="text"
                required
                placeholder="Masalan: INTRODUCTORY VIDEO"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Media URL */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Media URL (rasm yoki video)</label>
              <input
                type="url"
                required
                placeholder="https://example.com/image.jpg"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Media Type */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Media turi</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMediaType('IMAGE')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg border transition-all ${
                    mediaType === 'IMAGE'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:bg-secondary'
                  }`}
                >
                  <Image className="w-3.5 h-3.5" />
                  Rasm
                </button>
                <button
                  type="button"
                  onClick={() => setMediaType('VIDEO')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg border transition-all ${
                    mediaType === 'VIDEO'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:bg-secondary'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  Video
                </button>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Davomiyligi (soniya): <span className="text-primary font-bold">{duration}s</span>
              </label>
              <input
                type="range"
                min={3}
                max={30}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>3s</span>
                <span>30s</span>
              </div>
            </div>

            {/* Preview */}
            {mediaUrl && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Ko'rinish</label>
                <div className="relative w-full h-40 rounded-lg overflow-hidden border bg-secondary">
                  {mediaType === 'VIDEO' ? (
                    <video src={mediaUrl} className="w-full h-full object-cover" muted autoPlay loop />
                  ) : (
                    <img
                      src={mediaUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/1E1E2E/666?text=Rasm+yuklanmadi';
                      }}
                    />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="text-white text-xs font-bold uppercase">{title || 'Sarlavha'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={creating}
              className="w-full py-2.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {creating ? 'Saqlanmoqda...' : 'Istoriya Yaratish'}
            </button>
          </form>
        </div>

        {/* ── STORIES LIST ── */}
        <div className="lg:col-span-2 bg-card border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-sm flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
              <Tv className="w-4 h-4 text-primary" />
              Barcha Istoriyalar
            </h3>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full font-semibold">
              {stories.length} ta
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Yuklanmoqda...</span>
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Tv className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Hozircha istoriyalar yo'q</p>
              <p className="text-xs mt-1">Chap tarafdagi formadan yangi istoriya qo'shing.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stories.map((story) => (
                <div
                  key={story._id}
                  className="group relative border rounded-xl overflow-hidden bg-secondary/15 hover:shadow-md transition-shadow"
                >
                  {/* Thumbnail */}
                  <div className="relative h-44 bg-secondary">
                    {story.mediaType === 'VIDEO' ? (
                      <video
                        src={story.mediaUrl}
                        className="w-full h-full object-cover"
                        muted
                        controls
                      />
                    ) : (
                      <img
                        src={story.mediaUrl}
                        alt={story.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/1E1E2E/666?text=No+Image';
                        }}
                      />
                    )}
                    {/* Type Badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {story.mediaType === 'VIDEO' ? (
                        <Video className="w-3 h-3" />
                      ) : (
                        <Image className="w-3 h-3" />
                      )}
                      {story.mediaType}
                    </div>
                    {/* Duration Badge */}
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {story.duration}s
                    </div>
                    {/* Bottom overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <p className="text-white text-sm font-bold uppercase tracking-wide">{story.title}</p>
                    </div>
                  </div>

                  {/* Info Footer */}
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-red-500" />
                        {story.likesCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {story.viewers?.length || 0}
                      </span>
                      <span className="text-[10px]">{formatDate(story.createdAt)}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(story._id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

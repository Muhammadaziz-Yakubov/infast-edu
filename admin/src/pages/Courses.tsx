import React, { useEffect, useState } from 'react';
import { getCourses, createCourse } from '../api/courses';
import type { Course } from '../utils/mockDb';
import { Plus, Layers, MonitorPlay, Coins, Clock, X } from 'lucide-react';

export const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected course details
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Modal creation states
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [level, setLevel] = useState('Beginner');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getCourses();
      setCourses(data);
      if (data.length > 0 && !selectedCourse) {
        setSelectedCourse(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCourse = await createCourse({
        title,
        description,
        thumbnail: thumbnail || undefined,
        price: Number(price),
        duration,
        level,
        status: 'ACTIVE',
      });
      setCreateOpen(false);
      setTitle('');
      setDescription('');
      setThumbnail('');
      setPrice('');
      setDuration('');
      await loadData();
      setSelectedCourse(newCourse);
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Kurslar Shablonlari</h1>
          <p className="text-muted-foreground">O'quv rejalari andozalari, modullar va video darsliklar ro'yxati.</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Yangi Kurs Yaratish
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Courses list */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Mavjud Kurslar</h3>
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : courses.length === 0 ? (
            <p className="text-sm text-muted-foreground">Hech qanday kurs yaratilmagan.</p>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => {
                const isSelected = selectedCourse?._id === course._id;
                return (
                  <div
                    key={course._id}
                    onClick={() => setSelectedCourse(course)}
                    className={`p-4 bg-card border rounded-xl shadow-sm cursor-pointer hover:border-primary/50 transition-all ${
                      isSelected ? 'border-primary ring-1 ring-primary/20 bg-primary/[0.01]' : ''
                    }`}
                  >
                    <div className="aspect-[16/9] w-full rounded-lg overflow-hidden bg-secondary mb-3">
                      <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm line-clamp-1">{course.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>
                      
                      <div className="flex items-center justify-between pt-2 border-t mt-2 text-xs font-semibold text-muted-foreground">
                        <span className="flex items-center gap-1 text-primary">
                          <Coins className="w-3.5 h-3.5" />
                          {course.price.toLocaleString()} so'm
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {course.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Course Outline Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCourse ? (
            <div className="space-y-6 bg-card border rounded-xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-6 border-b pb-6">
                <div className="w-full sm:w-48 aspect-[16/10] rounded-lg overflow-hidden bg-secondary shrink-0">
                  <img src={selectedCourse.thumbnail} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-2">
                  <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary/10 text-primary uppercase`}>
                    {selectedCourse.level}
                  </span>
                  <h2 className="text-2xl font-bold">{selectedCourse.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedCourse.description}</p>
                </div>
              </div>

              {/* Course Outline (Modules & Lessons list) */}
              <div className="space-y-4">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  Kurs tuzilishi (Modullar)
                </h3>
                
                {(selectedCourse.modules || []).length === 0 ? (
                  <div className="p-6 text-center border border-dashed rounded-lg text-muted-foreground text-sm">
                    Bu kursga hali hech qanday modullar qo'shilmagan. Uni "LMS Builder" yordamida loyihalashingiz mumkin.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(selectedCourse.modules || []).map((mod) => (
                      <div key={mod._id} className="border rounded-lg p-4 space-y-3 bg-secondary/20">
                        <h4 className="font-bold text-sm text-foreground flex items-center justify-between">
                          {mod.title}
                          <span className="text-xs text-muted-foreground font-normal">
                            {(mod.lessons || []).length} dars
                          </span>
                        </h4>
                        
                        <div className="space-y-2">
                          {(mod.lessons || []).map((les: any) => (
                            <div key={les._id} className="flex items-center gap-3 p-2.5 bg-card border rounded-lg text-sm">
                              <MonitorPlay className="w-4.5 h-4.5 text-muted-foreground shrink-0" />
                              <span className="font-medium text-foreground">{les.title}</span>
                              <span className="text-xs text-muted-foreground ml-auto">Tartib: #{les.order}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[300px] border border-dashed rounded-xl bg-card">
              <p className="text-muted-foreground">Tafsilotlarni ko'rish uchun chapdan kursni tanlang.</p>
            </div>
          )}
        </div>

      </div>

      {/* Create Course Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card border rounded-2xl p-6 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold">Yangi Kurs Yaratish</h3>
              <button onClick={() => setCreateOpen(false)} className="p-1 rounded-md text-muted-foreground hover:bg-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Kurs nomi</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Fullstack JS Development"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Tavsif</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Kurs haqida qisqacha ma'lumot..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Rasm (Thumbnail URL)</label>
                <input
                  type="text"
                  placeholder="E.g. https://domain.com/photo.jpg"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Narxi (UZS)</label>
                  <input
                    type="number"
                    required
                    placeholder="E.g. 500000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Davomiyligi</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. 6 months"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Qiyinchilik darajasi</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Beginner">Beginner (Boshlang'ich)</option>
                  <option value="Intermediate">Intermediate (O'rta)</option>
                  <option value="Advanced">Advanced (Mukammal)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-secondary transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all"
                >
                  Yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

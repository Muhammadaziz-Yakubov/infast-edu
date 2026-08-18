import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { login, recoverPassword } from '../api/auth';
import { KeyRound, Phone, AlertCircle, Loader2, HelpCircle, CheckCircle2, X, Lock } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [identifier, setIdentifier] = useState('muhammadazizyaqubov2@gmail.com');
  const [password, setPassword] = useState('27272727');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password modal states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState('muhammadazizyaqubov2@gmail.com');
  const [recoverHint, setRecoverHint] = useState('');
  const [recoverLoading, setRecoverLoading] = useState(false);
  const [recoverError, setRecoverError] = useState<string | null>(null);
  const [recoveredPassword, setRecoveredPassword] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Iltimos, barcha maydonlarni to\'ldiring');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await login({ identifier, password });
      if (data.user.role !== 'SUPER_ADMIN' && data.user.role !== 'BRANCH_ADMIN') {
        throw new Error('Ushbu panelga kirish huquqingiz yo\'q');
      }
      setAuth(data.user, data.accessToken, data.refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi. Iltimos login va parolni tekshiring');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoverError(null);
    setRecoveredPassword(null);

    if (!recoverEmail || !recoverHint) {
      setRecoverError('Iltimos, Email va Hint-ni kiriting');
      return;
    }

    if (recoverHint.trim() !== '5566') {
      setRecoverError('Maxfiy hint noto\'g\'ri! (Hint 5566 bo\'lishi kerak)');
      return;
    }

    setRecoverLoading(true);

    try {
      const res = await recoverPassword({ email: recoverEmail.trim(), hint: recoverHint.trim() });
      setRecoveredPassword(res.password || '27272727');
    } catch (err: any) {
      // Fallback if backend is unavailable or offline
      if (recoverHint.trim() === '5566') {
        setRecoveredPassword('27272727');
      } else {
        setRecoverError(err?.response?.data?.message || err.message || 'Xatolik yuz berdi');
      }
    } finally {
      setRecoverLoading(false);
    }
  };

  const applyRecoveredPassword = () => {
    if (recoveredPassword) {
      setIdentifier(recoverEmail);
      setPassword(recoveredPassword);
      setShowForgotModal(false);
      setRecoveredPassword(null);
      setRecoverHint('');
    }
  };

  return (
    <div className="flex min-h-screen bg-background items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border rounded-2xl shadow-xl overflow-hidden p-8 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground font-black text-2xl shadow-lg shadow-primary/20">
            IF
          </div>
          <h2 className="text-2xl font-bold tracking-tight">InFast Academy OS</h2>
          <p className="text-sm text-muted-foreground">Admin panelga kirish</p>
        </div>

        {/* Error Alert box */}
        {error && (
          <div className="flex items-center gap-3 p-3 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Email yoki Telefon
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="muhammadazizyaqubov2@gmail.com yoki +998900580007"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border bg-background focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Parol
              </label>
              <button
                type="button"
                onClick={() => {
                  setRecoverEmail(identifier || 'muhammadazizyaqubov2@gmail.com');
                  setRecoverError(null);
                  setRecoveredPassword(null);
                  setShowForgotModal(true);
                }}
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3 h-3" />
                Parolni unutdingizmi?
              </button>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border bg-background focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Kirilmoqda...
              </>
            ) : (
              'Tizimga kirish'
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-muted-foreground border-t">
          <span className="font-semibold text-primary">InFast Academy OS v1.0.0</span> &copy; 2026
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-accent transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary font-bold text-lg">
                <Lock className="w-5 h-5" />
                Parolni tiklash
              </div>
              <p className="text-xs text-muted-foreground">
                Akkaunt parolini ko'rish uchun Email va Maxfiy Hint kalitini kiriting.
              </p>
            </div>

            {recoverError && (
              <div className="flex items-center gap-2.5 p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="font-medium">{recoverError}</p>
              </div>
            )}

            {recoveredPassword ? (
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    Parol topildi!
                  </div>
                  <div className="bg-background/80 border p-3 rounded-lg text-center font-mono text-lg font-bold text-foreground tracking-widest select-all">
                    {recoveredPassword}
                  </div>
                  <p className="text-[11px] opacity-80 text-center">
                    Ushbu parol bilan hisobingizga kirishingiz mumkin.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={applyRecoveredPassword}
                  className="w-full py-2.5 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  Formaga kiritish va yopish
                </button>
              </div>
            ) : (
              <form onSubmit={handleRecoverSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Email yoki Telefon
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="muhammadazizyaqubov2@gmail.com"
                      value={recoverEmail}
                      onChange={(e) => setRecoverEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border bg-background focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Maxfiy Hint Kalit
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Masalan: 5566"
                      value={recoverHint}
                      onChange={(e) => setRecoverHint(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border bg-background focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Hint: <span className="font-mono font-semibold text-primary">5566</span>
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 text-sm font-medium rounded-lg border bg-background hover:bg-accent text-foreground transition-all"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={recoverLoading}
                    className="flex-1 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {recoverLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Parolni ko\'rsatish'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

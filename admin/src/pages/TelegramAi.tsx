import React, { useState, useEffect } from 'react';
import { telegramAiApi, TelegramAiStatus } from '../api/telegram-ai';
import { 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Play, 
  Square, 
  LogOut, 
  MessageSquare,
  Sparkles,
  Info
} from 'lucide-react';

export const TelegramAi: React.FC = () => {
  const [status, setStatus] = useState<TelegramAiStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await telegramAiApi.getStatus();
      setStatus(data);
      setErrorMessage(null);
    } catch (error: any) {
      setErrorMessage("Telegram AI statusini yuklashda xatolik yuz berdi.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll status every 4 seconds to catch OTP prompt and successful auth changes automatically
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    try {
      setActionLoading(true);
      setSuccessMessage(null);
      setErrorMessage(null);
      const res = await telegramAiApi.startAgent();
      if (res.success) {
        setSuccessMessage("Telegram client muvaffaqiyatli ishga tushirildi. Kod kelishini kuting.");
        await fetchStatus();
      } else {
        setErrorMessage(res.message || "Ishga tushirishda xatolik yuz berdi.");
      }
    } catch (error: any) {
      setErrorMessage("Kutulmagan xatolik yuz berdi.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      setActionLoading(true);
      setSuccessMessage(null);
      setErrorMessage(null);
      const res = await telegramAiApi.stopAgent();
      if (res.success) {
        setSuccessMessage("Telegram client to'xtatildi.");
        await fetchStatus();
      } else {
        setErrorMessage(res.message || "To'xtatishda xatolik yuz berdi.");
      }
    } catch (error: any) {
      setErrorMessage("Kutulmagan xatolik yuz berdi.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm("Haqiqatan ham Telegram akkauntdan chiqmoqchimisiz? Session o'chiriladi.")) {
      return;
    }
    try {
      setActionLoading(true);
      setSuccessMessage(null);
      setErrorMessage(null);
      const res = await telegramAiApi.logout();
      if (res.success) {
        setSuccessMessage("Akkauntdan muvaffaqiyatli chiqildi va session tozalandi.");
        await fetchStatus();
      } else {
        setErrorMessage("Akkauntdan chiqishda xatolik yuz berdi.");
      }
    } catch (error: any) {
      setErrorMessage("Kutulmagan xatolik yuz berdi.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setErrorMessage("Kodni kiriting.");
      return;
    }
    try {
      setActionLoading(true);
      setSuccessMessage(null);
      setErrorMessage(null);
      const res = await telegramAiApi.submitCode(otpCode);
      if (res.success) {
        setSuccessMessage("Kod yuborildi. Ulanish kutilmoqda...");
        setOtpCode('');
        // wait a moment and refresh status
        setTimeout(fetchStatus, 2000);
      } else {
        setErrorMessage(res.message || "Kodni yuborishda xatolik yuz berdi.");
      }
    } catch (error: any) {
      setErrorMessage("Kodni yuborishda xatolik yuz berdi.");
    } finally {
      setActionLoading(false);
    }
  };

  // Determine current active step in the connection flow
  let currentStep = 1; // 1: Offline/Not Connected, 2: OTP Pending, 3: Active/Connected
  if (status?.connected) {
    currentStep = status.authorized ? 3 : 2;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card p-6 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Send className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Telegram AI Assistant</h1>
            <p className="text-sm text-muted-foreground">Telegram akkauntingizga ulanib, leadslarni avtomatik aniqlaydigan AI Bot boshqaruvi</p>
          </div>
        </div>
        <button
          onClick={fetchStatus}
          disabled={loading || actionLoading}
          className="flex items-center gap-2 self-start sm:self-center px-4 py-2 text-sm font-semibold rounded-lg bg-secondary text-primary hover:bg-secondary/80 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${(loading || actionLoading) ? 'animate-spin' : ''}`} />
          Yangilash
        </button>
      </div>

      {/* Info Messages */}
      {errorMessage && (
        <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 p-4 rounded-xl text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Visual Connection Stepper */}
      <div className="bg-card p-6 rounded-2xl border shadow-sm">
        <h2 className="text-lg font-bold mb-6">Ulanish bosqichlari</h2>
        <div className="relative flex flex-col md:flex-row justify-between items-center gap-6 md:gap-2">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center relative z-10 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
              currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              1
            </div>
            <p className="font-semibold text-sm mt-3">Xizmatni ishga tushirish</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[180px]">Telegram clientini ishga tushiring</p>
          </div>

          <div className={`hidden md:block h-[2px] flex-1 ${currentStep >= 2 ? 'bg-primary' : 'bg-border'}`} />

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center relative z-10 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
              currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              2
            </div>
            <p className="font-semibold text-sm mt-3">Kodni tasdiqlash</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[180px]">Telegram ilovasidan kelgan OTP kodni kiriting</p>
          </div>

          <div className={`hidden md:block h-[2px] flex-1 ${currentStep >= 3 ? 'bg-primary' : 'bg-border'}`} />

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center relative z-10 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
              currentStep >= 3 ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
            }`}>
              3
            </div>
            <p className="font-semibold text-sm mt-3">Faol rejim (AI Agent)</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[180px]">Bot shaxsiy xabarlaringizga avtomatik javob beradi</p>
          </div>
        </div>
      </div>

      {/* Main Status & Configuration Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Connection Status Panel */}
        <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-lg font-bold">Ulanish Holati</h2>
            {status?.connected && status?.authorized ? (
              <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Ishlamoqda
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-destructive/10 text-destructive">
                <XCircle className="w-3.5 h-3.5" />
                To'xtatilgan
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm py-1 border-b border-border/50">
              <span className="text-muted-foreground">Python Userbot:</span>
              <span className="font-semibold">{status?.connected ? "Ishga tushgan" : "To'xtatilgan"}</span>
            </div>

            <div className="flex justify-between items-center text-sm py-1 border-b border-border/50">
              <span className="text-muted-foreground">Avtorizatsiya:</span>
              <span className="font-semibold">
                {status?.authorized ? "Tizimga kirilgan" : (status?.connected ? "Kutilmoqda (OTP)" : "Kilinmagan")}
              </span>
            </div>

            {status?.phone && (
              <div className="flex justify-between items-center text-sm py-1 border-b border-border/50">
                <span className="text-muted-foreground">Telegram Akkaunt:</span>
                <span className="font-mono font-semibold">{status.phone}</span>
              </div>
            )}

            {status?.error && (
              <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs rounded-lg flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{status.error}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            {!status?.connected ? (
              <button
                onClick={handleStart}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                Clientni yoqish
              </button>
            ) : (
              <>
                <button
                  onClick={handleStop}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
                >
                  <Square className="w-4 h-4 fill-current" />
                  Clientni o'chirish
                </button>
                {status.authorized && (
                  <button
                    onClick={handleLogout}
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-secondary text-primary hover:bg-secondary/80 transition-colors disabled:opacity-50"
                    title="Akkauntdan chiqish"
                  >
                    <LogOut className="w-4 h-4" />
                    Chiqish
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Verification / Control Details */}
        <div className="bg-card p-6 rounded-2xl border shadow-sm">
          {status?.connected && !status?.authorized ? (
            <form onSubmit={handleSubmitCode} className="space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-primary">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  Tasdiqlash kodi kutilmoqda
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Telegram ilovangizga kelgan 5 xonali tasdiqlash kodini pastga kiriting.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  SMS / Telegram Code
                </label>
                <input
                  type="text"
                  placeholder="Masalan: 48392"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  className="w-full text-center tracking-[0.5em] font-mono text-2xl px-4 py-3 rounded-xl bg-secondary border border-transparent focus:border-border outline-none transition-all"
                  maxLength={8}
                  disabled={actionLoading}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading || !otpCode.trim()}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Yuborilmoqda...' : 'Kodni tasdiqlash'}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
              <div className="p-4 bg-secondary rounded-full">
                <MessageSquare className="w-10 h-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Faoliyat holati</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-[280px]">
                  {status?.connected && status?.authorized
                    ? "Telegram AI Assistant tizimga muvaffaqiyatli kirgan. Bot hozirda yangi xabarlarni eshitmoqda."
                    : "Botni ishga tushirish uchun chap paneldagi 'Clientni yoqish' tugmasini bosing."}
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Advanced info panel */}
      <div className="bg-card p-6 rounded-2xl border shadow-sm flex items-start gap-4">
        <Info className="w-6 h-6 text-primary shrink-0 mt-1" />
        <div className="space-y-1">
          <h4 className="font-bold text-sm">Muhim eslatma</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Telegram AI foydalanuvchilar bilan shaxsiy yozishmalaringizni monitoring qiladi. 
            Agar yozishmalarda kursga qiziqish so'zlari (masalan: kurs, narxi, o'quv markazi va h.k.) ishlatilsa, AI foydalanuvchining ismi, familiyasi va telefon raqamini aniqlaydi hamda CRM tizimining <strong>Leads</strong> bo'limiga avtomatik ravishda qo'shadi. 
            Bu jarayon mutlaqo avtomatlashtirilgan.
          </p>
        </div>
      </div>
    </div>
  );
};
export default TelegramAi;

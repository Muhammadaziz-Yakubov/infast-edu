// Lightweight in-app toast notification system
// Replaces all native browser alert() calls with elegant UI toasts

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  type?: ToastType;
  duration?: number;
}

const COLORS: Record<ToastType, { bg: string; border: string; text: string; icon: string }> = {
  success: { bg: '#f0fdf4', border: '#16a34a', text: '#15803d', icon: '✓' },
  error:   { bg: '#fef2f2', border: '#dc2626', text: '#b91c1c', icon: '✕' },
  warning: { bg: '#fffbeb', border: '#d97706', text: '#b45309', icon: '⚠' },
  info:    { bg: '#eff6ff', border: '#2563eb', text: '#1d4ed8', icon: 'ℹ' },
};

// Detect dark mode
const isDark = () => document.documentElement.classList.contains('dark');

let container: HTMLElement | null = null;

function getContainer(): HTMLElement {
  if (!container || !document.body.contains(container)) {
    container = document.createElement('div');
    container.setAttribute('id', 'toast-root');
    Object.assign(container.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: '99999',
      display: 'flex',
      flexDirection: 'column-reverse',
      gap: '8px',
      pointerEvents: 'none',
    });
    document.body.appendChild(container);
  }
  return container;
}

export function toast(message: string, options: ToastOptions = {}): void {
  const type: ToastType = options.type ?? 'info';
  const duration = options.duration ?? 3500;
  const dark = isDark();
  const c = COLORS[type];

  const el = document.createElement('div');
  el.setAttribute('role', 'alert');
  Object.assign(el.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderRadius: '12px',
    border: `1px solid ${c.border}40`,
    background: dark ? '#1c1c1e' : c.bg,
    color: dark ? '#f5f5f5' : c.text,
    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
    fontSize: '13px',
    fontWeight: '600',
    maxWidth: '360px',
    pointerEvents: 'all',
    opacity: '0',
    transform: 'translateY(8px)',
    transition: 'opacity 200ms ease, transform 200ms ease',
    fontFamily: 'inherit',
  });

  const iconEl = document.createElement('span');
  iconEl.textContent = c.icon;
  Object.assign(iconEl.style, {
    flexShrink: '0',
    fontWeight: '800',
    fontSize: '14px',
    color: c.border,
  });

  const textEl = document.createElement('span');
  textEl.textContent = message;

  el.appendChild(iconEl);
  el.appendChild(textEl);
  getContainer().appendChild(el);

  // Animate in
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });

  // Auto dismiss
  const dismiss = () => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(4px)';
    setTimeout(() => el.remove(), 200);
  };

  const timer = setTimeout(dismiss, duration);
  el.addEventListener('click', () => { clearTimeout(timer); dismiss(); });
}

export const showSuccess = (msg: string) => toast(msg, { type: 'success' });
export const showError   = (msg: string) => toast(msg, { type: 'error' });
export const showWarning = (msg: string) => toast(msg, { type: 'warning' });
export const showInfo    = (msg: string) => toast(msg, { type: 'info' });

/** Drop-in replacement for window.confirm() — returns a Promise<boolean> */
export function confirmDialog(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', zIndex: '99998',
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    });

    const box = document.createElement('div');
    const dark = isDark();
    Object.assign(box.style, {
      background: dark ? '#1c1c1e' : '#ffffff',
      border: '1px solid ' + (dark ? '#333' : '#e5e7eb'),
      borderRadius: '16px', padding: '24px', maxWidth: '360px', width: '100%',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      fontFamily: 'inherit',
    });

    const msg = document.createElement('p');
    msg.textContent = message;
    Object.assign(msg.style, {
      fontSize: '14px', fontWeight: '600',
      color: dark ? '#f5f5f5' : '#111827', marginBottom: '20px', lineHeight: '1.5',
    });

    const btnRow = document.createElement('div');
    Object.assign(btnRow.style, { display: 'flex', gap: '8px', justifyContent: 'flex-end' });

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    Object.assign(cancelBtn.style, {
      padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
      background: dark ? '#2c2c2e' : '#f3f4f6', border: '1px solid ' + (dark ? '#444' : '#e5e7eb'),
      color: dark ? '#d1d5db' : '#374151',
    });

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Confirm';
    Object.assign(confirmBtn.style, {
      padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
      background: '#dc2626', border: 'none', color: '#ffffff',
    });

    cancelBtn.addEventListener('click', () => { document.body.removeChild(overlay); resolve(false); });
    confirmBtn.addEventListener('click', () => { document.body.removeChild(overlay); resolve(true); });

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(confirmBtn);
    box.appendChild(msg);
    box.appendChild(btnRow);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  });
}

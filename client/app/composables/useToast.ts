export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface AppToast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration: number;
}

interface ShowToastOptions {
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

const DEFAULT_DURATION = 4200;
let toastSeed = 0;

export function useToast() {
  const toasts = useState<AppToast[]>('app-toasts', () => []);

  function dismiss(id: string) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  }

  function show(options: ShowToastOptions | string) {
    const payload = typeof options === 'string' ? { message: options } : options;
    const id = `${Date.now()}-${toastSeed += 1}`;
    const duration = payload.duration ?? DEFAULT_DURATION;

    const toast: AppToast = {
      id,
      type: payload.type ?? 'info',
      title: payload.title,
      message: payload.message,
      duration,
    };

    toasts.value = [...toasts.value, toast].slice(-4);

    if (import.meta.client && duration > 0) {
      window.setTimeout(() => dismiss(id), duration);
    }

    return id;
  }

  return {
    toasts,
    dismiss,
    show,
    success: (message: string, title = 'Thành công') => show({ type: 'success', title, message }),
    error: (message: string, title = 'Có lỗi xảy ra') => show({ type: 'error', title, message }),
    warning: (message: string, title = 'Cần kiểm tra') => show({ type: 'warning', title, message }),
    info: (message: string, title = 'Thông báo') => show({ type: 'info', title, message }),
  };
}

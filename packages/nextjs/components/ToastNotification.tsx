import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastNotificationProps {
  toast: Toast;
  onClose: (id: string) => void;
}

export function ToastNotification({ toast, onClose }: ToastNotificationProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(toast.id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const getToastStyles = () => {
    switch (toast.type) {
      case "success":
        return {
          bg: "from-green-600/90 to-emerald-600/90",
          border: "border-green-500/50",
          icon: "ri-check-line",
          iconBg: "bg-green-500/20",
          iconColor: "text-green-300",
        };
      case "error":
        return {
          bg: "from-red-600/90 to-pink-600/90",
          border: "border-red-500/50",
          icon: "ri-close-line",
          iconBg: "bg-red-500/20",
          iconColor: "text-red-300",
        };
      case "warning":
        return {
          bg: "from-yellow-600/90 to-orange-600/90",
          border: "border-yellow-500/50",
          icon: "ri-alert-line",
          iconBg: "bg-yellow-500/20",
          iconColor: "text-yellow-300",
        };
      case "info":
      default:
        return {
          bg: "from-purple-600/90 to-pink-600/90",
          border: "border-purple-500/50",
          icon: "ri-information-line",
          iconBg: "bg-purple-500/20",
          iconColor: "text-purple-300",
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm shadow-2xl transition-all duration-300 ${
        isExiting ? "opacity-0 translate-x-full" : "opacity-100 translate-x-0"
      } bg-gradient-to-r ${styles.bg} ${styles.border}`}
      style={{ minWidth: "320px", maxWidth: "420px" }}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${styles.iconBg}`}>
        <i className={`${styles.icon} text-xl ${styles.iconColor}`}></i>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-white mb-1">{toast.title}</h4>
        {toast.message && <p className="text-sm text-white/80 leading-relaxed">{toast.message}</p>}
      </div>

      {/* Close Button */}
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onClose(toast.id), 300);
        }}
        className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-all shrink-0"
      >
        <i className="ri-close-line text-white/80"></i>
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastNotification toast={toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}

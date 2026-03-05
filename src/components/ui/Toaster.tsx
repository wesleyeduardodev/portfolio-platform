"use client";

import { useEffect, useState, useCallback } from "react";
import * as Toast from "@radix-ui/react-toast";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { subscribe, type ToastMessage } from "@/lib/toast";

const DURATION = 4000;

const variantStyles: Record<
  ToastMessage["variant"],
  { bg: string; border: string; icon: typeof CheckCircle; iconColor: string }
> = {
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    icon: CheckCircle,
    iconColor: "text-green-600",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: AlertCircle,
    iconColor: "text-red-600",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: Info,
    iconColor: "text-blue-600",
  },
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    return subscribe((t) => {
      setToasts((prev) => [...prev, t]);
    });
  }, []);

  const handleRemove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <Toast.Provider duration={DURATION}>
      {toasts.map((t) => {
        const style = variantStyles[t.variant];
        const Icon = style.icon;

        return (
          <Toast.Root
            key={t.id}
            onOpenChange={(open) => {
              if (!open) handleRemove(t.id);
            }}
            className={`
              ${style.bg} ${style.border}
              border rounded-xl shadow-lg px-4 py-3
              flex items-start gap-3
              data-[state=open]:animate-[slideIn_200ms_ease-out]
              data-[state=closed]:animate-[fadeOut_150ms_ease-in]
              data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]
              data-[swipe=cancel]:translate-x-0
              data-[swipe=cancel]:transition-transform
              data-[swipe=end]:animate-[swipeOut_100ms_ease-out]
              max-w-sm w-full
            `}
          >
            <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${style.iconColor}`} />
            <Toast.Description className="text-sm text-gray-700 flex-1 leading-relaxed">
              {t.message}
            </Toast.Description>
            <Toast.Close className="shrink-0 rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-black/5 transition">
              <X className="h-4 w-4" />
            </Toast.Close>
          </Toast.Root>
        );
      })}

      <Toast.Viewport className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-[min(100vw-2rem,24rem)] outline-none" />
    </Toast.Provider>
  );
}

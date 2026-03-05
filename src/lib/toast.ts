// Simple event-based toast system (no zustand dependency)

export type ToastVariant = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  variant: ToastVariant;
  message: string;
}

type Listener = (t: ToastMessage) => void;

const listeners = new Set<Listener>();

let nextId = 0;

function emit(variant: ToastVariant, message: string) {
  const t: ToastMessage = { id: String(++nextId), variant, message };
  listeners.forEach((fn) => fn(t));
}

export const toast = {
  success: (message: string) => emit("success", message),
  error: (message: string) => emit("error", message),
  info: (message: string) => emit("info", message),
};

export function subscribe(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

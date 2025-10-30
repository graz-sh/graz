// Simple toast hook for demo purposes
// In production, you'd use shadcn/ui's toast component

import { useState, useCallback } from "react";

interface ToastProps {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const [, setToasts] = useState<ToastProps[]>([]);

  const toast = useCallback((props: ToastProps) => {
    setToasts((prev) => [...prev, props]);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3000);
  }, []);

  return { toast };
}

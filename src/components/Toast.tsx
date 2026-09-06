import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MAX_TOASTS = 4;
const TOAST_DURATION = 1400;

interface ToastItem {
  id: number;
  text: string;
}

function SingleToast({
  text,
  index,
  total,
  onDismiss,
}: {
  text: string;
  index: number;
  total: number;
  onDismiss: () => void;
}) {
  const depth = total - 1 - index;
  const scale = 1 - depth * 0.05;
  const yOffset = depth * -6;
  const opacity = 1 - depth * 0.2;
  const zIndex = total - depth;

  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    const timer = setTimeout(() => onDismissRef.current(), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      style={{ zIndex }}
      initial={{ opacity: 0, y: 16, scale: scale * 0.95 }}
      animate={{ opacity, y: yOffset, scale }}
      exit={{ opacity: 0, y: yOffset + 8 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-[14px] py-2 rounded-full bg-white/[0.12] backdrop-blur-[12px] whitespace-nowrap shadow-none border-none select-none"
    >
      <svg
        aria-hidden="true"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <motion.path
          d="M1.60416 8.80469L5.24999 11.8125L12.3958 2.1875"
          stroke="white"
          strokeWidth="1.25"
          strokeLinecap="square"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        />
      </svg>
      <span className="text-sm font-medium text-white/[0.88] leading-5 tracking-[0.14px]">
        {text}
      </span>
    </motion.div>
  );
}

export function Toast({
  message,
  onClose,
  bottomClassName = "bottom-6",
  onActiveChange,
}: {
  message: string | null;
  onClose: () => void;
  bottomClassName?: string;
  onActiveChange?: (active: boolean) => void;
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  // Sync external message prop into toast stack
  useEffect(() => {
    if (!message) return;
    const id = idRef.current++;
    setToasts((prev) => [...prev, { id, text: message }].slice(-MAX_TOASTS));
    onClose();
  }, [message, onClose]);

  // Notify parent when toast stack goes empty <-> non-empty
  const activeRef = useRef(false);
  useEffect(() => {
    const active = toasts.length > 0;
    if (active !== activeRef.current) {
      activeRef.current = active;
      onActiveChange?.(active);
    }
  }, [toasts.length, onActiveChange]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className={`fixed ${bottomClassName} left-1/2 -translate-x-1/2 z-50 pointer-events-none`}>
      <div className="relative h-9">
        <AnimatePresence>
          {toasts.map((toast, index) => (
            <SingleToast
              key={toast.id}
              text={toast.text}
              index={index}
              total={toasts.length}
              onDismiss={() => dismiss(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

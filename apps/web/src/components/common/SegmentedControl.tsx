import { motion, useReducedMotion } from "framer-motion";

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label = "Control Switcher",
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <fieldset aria-label={label} className="flex min-w-0 rounded-full bg-[var(--bg-btn)] p-1 border-none">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={`relative flex-1 cursor-pointer rounded-full px-3.5 py-1.5 text-[13px] font-medium leading-5 ${
              active
                ? "text-[var(--text-primary)] font-semibold"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {active && (
              <motion.span
                layoutId="segmented-active-pill"
                aria-hidden="true"
                className="absolute inset-0 rounded-full shadow-sm"
                style={{
                  backgroundColor: "rgba(155, 138, 251, 0.15)",
                  borderColor: "var(--accent-color, #9B8AFB)",
                  borderWidth: 1,
                  borderStyle: "solid",
                }}
                transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </fieldset>
  );
}

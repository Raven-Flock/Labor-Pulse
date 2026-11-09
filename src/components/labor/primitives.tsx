import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="phone-shell flex justify-center">
      <div className="relative isolate flex h-dvh min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-bg">
        {children}
      </div>
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  labelledBy,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  labelledBy?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center"
    >
      <span
        aria-hidden
        className={cn(
          "relative flex h-8 w-14 items-center rounded-full p-1",
          checked ? "bg-action" : "bg-raised shadow-[0_0_0_1px_var(--color-hairline-strong)]",
        )}
      >
        <span
          className={cn(
            "block size-6 rounded-full transition-transform duration-150",
            checked ? "translate-x-6 bg-action-fg" : "translate-x-0 bg-muted",
          )}
        />
      </span>
    </button>
  );
}

export function Chip({
  children,
  onClick,
  active,
  tone = "default",
}: {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  tone?: "default" | "action" | "ease" | "alert";
}) {
  const tones = {
    default: active ? "bg-raised text-fg" : "bg-surface text-muted",
    action: "bg-action text-action-fg",
    ease: "bg-ease text-ease-fg",
    alert: "bg-alert text-alert-fg",
  };
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center rounded-full px-3.5 text-[15px] font-medium tracking-tight",
        tones[tone],
      )}
    >
      {children}
    </Comp>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
}) {
  return (
    <div className="flex gap-1 rounded-xl bg-surface p-1 shadow-[0_0_0_1px_var(--color-hairline-strong)]">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "min-h-11 flex-1 rounded-lg px-2 text-[15px] font-medium",
            value === o.id ? "bg-raised text-fg" : "text-muted",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Sheet({
  open,
  onClose,
  title,
  children,
  tone = "default",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  tone?: "default" | "alert";
}) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-bg/70"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-tone={tone === "alert" ? "alert" : undefined}
        className={cn(
          "relative z-10 max-h-[88%] overflow-y-auto rounded-t-2xl px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4",
          tone === "alert" ? "bg-alert text-alert-fg" : "bg-surface text-fg",
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-11 items-center justify-center rounded-full bg-raised/80"
            aria-label="Close sheet"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[15px] font-medium text-muted">{label}</span>
      {children}
      {hint ? <span className="text-sm text-muted">{hint}</span> : null}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "min-h-12 rounded-xl bg-raised px-4 text-[17px] text-fg ring-1 ring-hairline placeholder:text-muted",
        props.className,
      )}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-28 rounded-xl bg-raised px-4 py-3 text-[17px] text-fg ring-1 ring-hairline placeholder:text-muted",
        props.className,
      )}
    />
  );
}

export function RowButton({
  label,
  value,
  onClick,
  danger,
}: {
  label: string;
  value?: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-14 w-full items-center justify-between gap-3 rounded-xl bg-raised px-4 text-left"
    >
      <span className={cn("text-[17px]", danger ? "text-alert" : "text-fg")}>{label}</span>
      {value ? <span className="text-[15px] text-muted">{value}</span> : null}
    </button>
  );
}

export function GiantCircle({
  label,
  caption,
  onClick,
  tone,
}: {
  label: string;
  caption: string;
  onClick: () => void;
  tone: "action" | "ease";
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={onClick}
        aria-label={caption}
        className={cn(
          "flex size-44 items-center justify-center rounded-full text-[22px] font-semibold tracking-tight",
          "shadow-[0_0_0_1px_rgba(243,241,236,0.08)]",
          tone === "action" ? "bg-action text-action-fg" : "bg-ease text-ease-fg",
        )}
      >
        {label}
      </button>
      <p className="text-center text-[17px] text-muted">{caption}</p>
    </div>
  );
}

export function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-1 flex-col gap-1 rounded-xl bg-surface px-4 py-3">
      <span className="text-[13px] font-medium uppercase tracking-[0.08em] text-muted">
        {label}
      </span>
      <span className="font-semibold tabular-nums text-[28px] leading-none tracking-tight text-fg">
        {value}
      </span>
    </div>
  );
}

export function ModeSlider({
  practice,
  onChange,
}: {
  practice: boolean;
  onChange: (practice: boolean) => void;
}) {
  return (
    <div className="rounded-2xl bg-surface px-4 py-4">
      <div className="mb-3 flex items-center justify-between text-[17px] font-medium">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(practice ? "text-fg" : "text-muted")}
        >
          Practice
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(!practice ? "text-fg" : "text-muted")}
        >
          Labor
        </button>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={1}
        value={practice ? 0 : 1}
        aria-valuetext={practice ? "Practice" : "Labor"}
        aria-label="Mode"
        onChange={(e) => onChange(e.target.value === "0")}
        className="mode-slider"
      />
      <p className="mt-3 text-[17px]">
        Mode: <span className="font-semibold">{practice ? "Practice" : "Labor"}</span>
      </p>
    </div>
  );
}

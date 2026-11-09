import { cn } from "@/lib/utils";
import type { Wave } from "@/lib/labor/types";

export function Sparkline({
  waves,
  decorative = false,
}: {
  waves: Wave[];
  decorative?: boolean;
}) {
  const last = waves.filter((w) => w.duration != null).slice(-8);
  if (last.length === 0) {
    return (
      <div
        className="h-16 rounded-xl bg-surface"
        {...(decorative ? { "aria-hidden": true as const } : {})}
      />
    );
  }
  const max = Math.max(60_000, ...last.map((w) => w.duration ?? 0));
  return (
    <div
      className="flex h-16 items-end gap-1.5 rounded-xl bg-surface px-3 py-2"
      {...(decorative ? { "aria-hidden": true as const } : {})}
    >
      {last.map((w) => {
        const h = Math.max(8, ((w.duration ?? 0) / max) * 100);
        return (
          <div
            key={w.id}
            className={cn(
              "min-h-2 flex-1 rounded-sm",
              w.isPractice ? "box-border border-2 border-muted bg-transparent" : "bg-action/80",
            )}
            style={{ height: `${h}%` }}
            {...(decorative ? {} : { title: `${Math.round((w.duration ?? 0) / 1000)}s` })}
          />
        );
      })}
    </div>
  );
}

export function HourGraph({
  waves,
  hours,
  decorative = false,
}: {
  waves: Wave[];
  hours: 1 | 6;
  decorative?: boolean;
}) {
  const now = Date.now();
  const span = hours * 60 * 60_000;
  const from = now - span;
  const data = waves.filter((w) => w.start >= from && w.duration != null);
  const width = 360;
  const height = 96;
  const maxDur = 90_000;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-24 w-full rounded-xl bg-surface"
      focusable={decorative ? "false" : undefined}
      {...(decorative
        ? { "aria-hidden": true as const }
        : {
            role: "img" as const,
            "aria-label": `Waves over the last ${hours} hour${hours > 1 ? "s" : ""}`,
          })}
    >
      {[0.25, 0.5, 0.75].map((g) => (
        <line
          key={g}
          x1="12"
          x2={width - 12}
          y1={height * g}
          y2={height * g}
          stroke="#2A3140"
          strokeWidth="1"
        />
      ))}
      {data.map((w) => {
        const x = 12 + ((w.start - from) / span) * (width - 24);
        const h = Math.max(8, ((w.duration ?? 0) / maxDur) * (height - 16));
        if (w.isPractice) {
          return (
            <rect
              key={w.id}
              x={x - 2}
              y={height - 8 - h + 1}
              width={4}
              height={h - 2}
              rx={1}
              fill="none"
              stroke="var(--color-muted)"
              strokeWidth={2}
            />
          );
        }
        return (
          <rect
            key={w.id}
            x={x - 3}
            y={height - 8 - h}
            width={6}
            height={h}
            rx={1.5}
            fill="var(--color-action)"
            fillOpacity={0.8}
          />
        );
      })}
    </svg>
  );
}
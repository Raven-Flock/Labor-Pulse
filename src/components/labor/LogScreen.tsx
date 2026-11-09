import { useState } from "react";
import { FLAG_LABEL } from "@/lib/labor/copy";
import { formatClock, formatDuration, formatInterval } from "@/lib/labor/format";
import { useLaborStore } from "@/lib/labor/store";
import { cn } from "@/lib/utils";
import { HourGraph } from "./WaveGraph";

export function LogScreen() {
  const waves = useLaborStore((s) => s.waves);
  const flags = useLaborStore((s) => s.flags);
  const setEditingWave = useLaborStore((s) => s.setEditingWave);
  const addManualWave = useLaborStore((s) => s.addManualWave);
  const setSheet = useLaborStore((s) => s.setSheet);
  const session = useLaborStore((s) => s.session);
  const setBirthAt = useLaborStore((s) => s.setBirthAt);
  const [hours, setHours] = useState<1 | 6>(1);
  const [adding, setAdding] = useState(false);

  const rows = [...waves].sort((a, b) => b.start - a.start);

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pb-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight">Log</h1>
          <p className="text-[15px] text-muted">{rows.length} waves on this phone</p>
        </div>
        <button
          type="button"
          onClick={() => setSheet("nurse")}
          className="min-h-11 rounded-xl bg-action px-4 text-[15px] font-semibold text-action-fg"
        >
          Nurse card
        </button>
      </header>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setHours(1)}
          className={cn(
            "min-h-11 rounded-xl px-3 text-[15px]",
            hours === 1 ? "bg-raised" : "text-muted",
          )}
        >
          1 hour
        </button>
        <button
          type="button"
          onClick={() => setHours(6)}
          className={cn(
            "min-h-11 rounded-xl px-3 text-[15px]",
            hours === 6 ? "bg-raised" : "text-muted",
          )}
        >
          6 hours
        </button>
      </div>
      <HourGraph waves={waves} hours={hours} decorative />

      {flags.length > 0 ? (
        <ul className="flex flex-col gap-1 text-[15px] text-alert">
          {flags.map((f) => (
            <li key={f.id}>
              {FLAG_LABEL[f.type]} · {formatClock(f.at)}
            </li>
          ))}
        </ul>
      ) : null}

      <ul className="flex flex-col gap-2">
        {rows.map((w) => (
          <li key={w.id}>
            <button
              type="button"
              onClick={() => setEditingWave(w.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                setEditingWave(w.id);
              }}
              className="flex w-full items-baseline justify-between gap-3 rounded-2xl bg-surface px-4 py-3 text-left"
            >
              <span className="text-[16px] text-muted">{formatClock(w.start)}</span>
              <span className="font-semibold tabular-nums text-[18px]">
                {formatDuration(w.duration)}
              </span>
              <span className="text-[16px] text-muted">
                gap {formatInterval(w.interval)}
              </span>
              {w.intensity ? (
                <span className="text-[14px] text-action">{w.intensity}/5</span>
              ) : null}
              {w.isPractice ? (
                <span className="text-[13px] text-muted">practice</span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setAdding((v) => !v)}
        className="min-h-12 rounded-2xl bg-raised text-[16px]"
      >
        Add a missed wave
      </button>
      {adding ? (
        <ManualAdd
          onAdd={(start, dur, practice) => {
            addManualWave(start, dur, practice);
            setAdding(false);
          }}
        />
      ) : null}

      <div className="rounded-2xl bg-surface px-4 py-4">
        <p className="text-[16px] font-medium">Keepsake — after birth</p>
        <p className="mt-1 text-[14px] text-muted">Manual. Not a medical record.</p>
        <button
          type="button"
          onClick={() => setBirthAt(session.birthAt ? null : Date.now())}
          className="mt-3 min-h-11 rounded-xl bg-raised px-4 text-[15px]"
        >
          {session.birthAt ? "Clear birth time" : "Baby is here"}
        </button>
        {session.birthAt ? (
          <p className="mt-2 text-[15px] text-muted">
            {rows.filter((w) => !w.isPractice).length} contractions logged · first wave{" "}
            {rows.at(-1) ? formatClock(rows[rows.length - 1]!.start) : "—"}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ManualAdd({
  onAdd,
}: {
  onAdd: (start: number, duration: number, practice: boolean) => void;
}) {
  const [minsAgo, setMinsAgo] = useState("5");
  const [seconds, setSeconds] = useState("45");
  const [practice, setPractice] = useState(false);
  return (
    <form
      className="flex flex-col gap-3 rounded-2xl bg-surface px-4 py-4"
      onSubmit={(e) => {
        e.preventDefault();
        const ago = Number(minsAgo) * 60_000;
        const dur = Number(seconds) * 1000;
        if (!Number.isFinite(ago) || !Number.isFinite(dur) || dur <= 0) return;
        onAdd(Date.now() - ago, dur, practice);
      }}
    >
      <label className="text-[15px] text-muted">
        Started minutes ago
        <input
          value={minsAgo}
          onChange={(e) => setMinsAgo(e.target.value)}
          inputMode="numeric"
          className="mt-1 min-h-12 w-full rounded-xl bg-raised px-3 text-[17px]"
        />
      </label>
      <label className="text-[15px] text-muted">
        Duration seconds
        <input
          value={seconds}
          onChange={(e) => setSeconds(e.target.value)}
          inputMode="numeric"
          className="mt-1 min-h-12 w-full rounded-xl bg-raised px-3 text-[17px]"
        />
      </label>
      <label className="flex items-center gap-2 text-[16px]">
        <input
          type="checkbox"
          checked={practice}
          onChange={(e) => setPractice(e.target.checked)}
        />
        Practice / Braxton Hicks
      </label>
      <button
        type="submit"
        className="min-h-12 rounded-xl bg-action font-semibold text-action-fg"
      >
        Save wave
      </button>
    </form>
  );
}

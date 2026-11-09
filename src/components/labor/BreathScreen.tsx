import type { CSSProperties } from "react";
import { useEffect, useId, useState } from "react";
import { BREATH_BY_STAGE, BREATH_FOOTER, BREATH_META, STAGE_HEADERS } from "@/lib/labor/copy";
import { practicePhase } from "@/lib/labor/engine";
import { formatDuration, formatElapsed } from "@/lib/labor/format";
import { useLaborStore } from "@/lib/labor/store";
import { usePeakArchitect } from "@/lib/labor/use-peak";
import type { BreathPattern } from "@/lib/labor/types";
import { cn } from "@/lib/utils";
import { ModeSlider, Toggle } from "./primitives";

function useEffectiveReduce(appReduce: boolean) {
  const [osReduce, setOsReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setOsReduce(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return appReduce || osReduce;
}

export function BreathScreen({ now }: { now: number }) {
  const breathArmed = useLaborStore((s) => s.breathArmed);
  const armBreath = useLaborStore((s) => s.armBreath);
  const override = useLaborStore((s) => s.breathOverride);
  const setBreathOverride = useLaborStore((s) => s.setBreathOverride);
  const practiceAt = useLaborStore((s) => s.practiceBreathAt);
  const liveWave = useLaborStore((s) => s.liveWave);
  const startPracticeBreath = useLaborStore((s) => s.startPracticeBreath);
  const stopPracticeBreath = useLaborStore((s) => s.stopPracticeBreath);
  const pushMode = useLaborStore((s) => s.pushMode);
  const setPushMode = useLaborStore((s) => s.setPushMode);
  const session = useLaborStore((s) => s.session);
  const settings = useLaborStore((s) => s.settings);
  const setPractice = useLaborStore((s) => s.setPractice);
  const waves = useLaborStore((s) => s.waves);
  const reduceMotion = useEffectiveReduce(settings.reduceMotion);
  const armId = useId();
  const pushId = useId();
  const { pattern, phase, scale, line } = usePeakArchitect(now);

  const restHold = pattern === "rest-between";
  const practice = practiceAt && !restHold ? practicePhase(now - practiceAt) : null;
  const ringPhase = restHold ? "rest" : (practice?.phase ?? phase);
  const ringScale = restHold ? 0.36 : (practice?.scale ?? scale);
  const shownScale = reduceMotion ? 1 : ringScale;
  const live = Boolean(liveWave);
  const last = waves.filter((w) => w.end != null).at(-1);
  const sinceLast =
    last?.end && !session.practiceOnly ? now - last.end : null;

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pb-6">
      <header>
        <h1 className="text-[28px] font-semibold tracking-tight">Breathe</h1>
        <p className="mt-1 text-[16px] text-muted">
          Read the style, then start. Nothing runs until you tap.
        </p>
      </header>

      <ModeSlider
        practice={session.practiceOnly}
        onChange={setPractice}
      />

      {!session.practiceOnly ? (
        <div className="flex gap-3 rounded-xl bg-surface px-4 py-3">
          <Glance label="Last duration" value={formatDuration(last?.duration ?? null)} />
          <Glance
            label="Since last"
            value={sinceLast != null ? formatElapsed(sinceLast) : "—"}
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-5">
        <button
          type="button"
          onClick={() => setBreathOverride("auto")}
          className={cn(
            "rounded-2xl px-4 py-3 text-left",
            override === "auto" ? "bg-raised" : "bg-surface",
          )}
        >
          <p className="text-[18px] font-semibold">Auto · {BREATH_META[pattern].name}</p>
          <StyleBlurb id={pattern} />
        </button>

        {STAGE_HEADERS.map((stage) => (
          <section key={stage.id} className="flex flex-col gap-2">
            <h2 className="text-[13px] font-medium uppercase tracking-[0.14em] text-action">
              {stage.label}
            </h2>
            {BREATH_BY_STAGE[stage.id].map((id) => {
              const locked = id === "breath-down" && !pushMode;
              const meta = BREATH_META[id];
              return (
                <button
                  key={`${stage.id}-${id}`}
                  type="button"
                  onClick={() => {
                    if (locked) return;
                    setBreathOverride(id);
                  }}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-left",
                    override === id ? "bg-raised" : "bg-surface",
                    locked && "opacity-70",
                  )}
                >
                  <p className="text-[18px] font-semibold">
                    {meta.name}
                    {locked ? " · locked" : ""}
                  </p>
                  <StyleBlurb id={id} />
                </button>
              );
            })}
          </section>
        ))}
      </div>

      <div className="relative mx-auto flex size-52 items-center justify-center">
        <div
          className={cn(
            "motion-ring absolute inset-0 rounded-full border-2 border-ease/50",
            !reduceMotion && ringPhase === "peak" && "is-peak",
          )}
          style={
            {
              "--ring-scale": shownScale,
              transform: `scale(${shownScale})`,
            } as CSSProperties
          }
        />
        <div className="relative text-center">
          <p className="text-[15px] uppercase tracking-[0.14em] text-muted">
            {ringPhase}
          </p>
          {practiceAt ? (
            <p className="mt-1 font-semibold tabular-nums text-[28px]">
              {formatElapsed((now - practiceAt) % 60_000)}
            </p>
          ) : (
            <p className="mt-1 max-w-[14ch] text-[18px] font-medium leading-snug">
              {line || "Ring waits until you start."}
            </p>
          )}
        </div>
      </div>

      {!live ? (
        <button
          type="button"
          onClick={practiceAt ? stopPracticeBreath : startPracticeBreath}
          className="min-h-14 rounded-2xl bg-action text-[18px] font-semibold text-action-fg"
        >
          {practiceAt ? "Stop" : "Start"}
        </button>
      ) : (
        <p className="text-center text-[16px] text-muted">
          Live wave is driving the ring. Timing wins.
        </p>
      )}

      <div
        className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3"
        onClick={() => armBreath(!breathArmed)}
      >
        <span id={armId} className="text-[17px] font-medium">
          Breathe with this wave
        </span>
        <Toggle
          labelledBy={armId}
          label="Breathe with this wave"
          checked={breathArmed}
          onChange={armBreath}
        />
      </div>

      <div className="rounded-2xl bg-surface px-4 py-3">
        <div
          className="flex items-center justify-between gap-3"
          onClick={() => setPushMode(!pushMode)}
        >
          <div>
            <p id={pushId} className="text-[17px] font-medium">
              Push mode
            </p>
            <p className="mt-1 text-[15px] text-muted">
              Unlocks open-glottis. Locked until you’ve been told to push.
            </p>
          </div>
          <Toggle
            labelledBy={pushId}
            label="Push mode"
            checked={pushMode}
            onChange={setPushMode}
          />
        </div>
      </div>

      <p className="text-[13px] text-muted">{BREATH_FOOTER}</p>
    </div>
  );
}

function StyleBlurb({ id }: { id: BreathPattern }) {
  const meta = BREATH_META[id];
  return (
    <div className="mt-2 flex flex-col gap-1.5 text-[15px] leading-snug text-muted">
      <p>
        <span className="font-medium text-fg">What it is. </span>
        {meta.what}
      </p>
      <p>
        <span className="font-medium text-fg">When to use. </span>
        {meta.when}
      </p>
    </div>
  );
}

function Glance({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1">
      <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">{label}</p>
      <p className="mt-0.5 font-semibold tabular-nums text-[18px]">{value}</p>
    </div>
  );
}

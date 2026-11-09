import { useEffect, useRef, useState, type CSSProperties } from "react";
import { CANT_BREATHE_LINE, HANDS_ON, POSITIONS } from "@/lib/labor/copy";
import { formatElapsed } from "@/lib/labor/format";
import { hapticEnd, hapticPhase, hapticStart } from "@/lib/labor/haptics";
import { speakCue } from "@/lib/labor/breath";
import { useLaborStore } from "@/lib/labor/store";
import { usePeakArchitect } from "@/lib/labor/use-peak";
import { cn } from "@/lib/utils";
import { ChevronUp } from "lucide-react";
import { GiantCircle } from "./primitives";

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

export function ActiveWave({ now }: { now: number }) {
  const live = useLaborStore((s) => s.liveWave);
  const closing = useLaborStore((s) => s.closing);
  const endWave = useLaborStore((s) => s.endWave);
  const undoEnd = useLaborStore((s) => s.undoEnd);
  const discardLast = useLaborStore((s) => s.discardLast);
  const skipRest = useLaborStore((s) => s.skipRest);
  const setIntensity = useLaborStore((s) => s.setIntensity);
  const markPeak = useLaborStore((s) => s.markPeak);
  const setTakeCharge = useLaborStore((s) => s.setTakeCharge);
  const setCantBreathe = useLaborStore((s) => s.setCantBreathe);
  const takeCharge = useLaborStore((s) => s.takeCharge);
  const cantBreathe = useLaborStore((s) => s.cantBreathe);
  const settings = useLaborStore((s) => s.settings);
  const breathArmed = useLaborStore((s) => s.breathArmed);
  const intensityPrompt = useLaborStore((s) => s.intensityPrompt);
  const pinnedPosition = useLaborStore((s) => s.pinnedPosition);
  const lastPositionAt = useLaborStore((s) => s.lastPositionAt);
  const touchPref = settings.touchPref;
  const reduceMotion = useEffectiveReduce(settings.reduceMotion);
  const { elapsed, phase, scale, line, sinceEnd } = usePeakArchitect(now);

  const [dim, setDim] = useState(false);
  const [panel, setPanel] = useState(false);
  const [spoken, setSpoken] = useState("");
  const startHaptic = useRef(false);
  const lastPhase = useRef(phase);

  useEffect(() => {
    if (!startHaptic.current && live) {
      startHaptic.current = true;
      hapticStart(settings.hapticPreset, settings.sensitive);
    }
  }, [live, settings.hapticPreset, settings.sensitive]);

  useEffect(() => {
    if (lastPhase.current !== phase) {
      lastPhase.current = phase;
      hapticPhase(phase, settings.hapticPreset, settings.sensitive);
      if (phase === "rest") hapticEnd(settings.hapticPreset, settings.sensitive);
    }
  }, [phase, settings.hapticPreset, settings.sensitive]);

  useEffect(() => {
    const spokenOn = settings.spokenCues || settings.breathVoice === "soft";
    if (spokenOn && line && line !== spoken) {
      setSpoken(line);
      speakCue(line, true);
    }
  }, [line, settings.spokenCues, settings.breathVoice, spoken]);

  useEffect(() => {
    if (!live) {
      setDim(false);
      return;
    }
    setDim(false);
    const t = window.setTimeout(() => setDim(true), 10_000);
    return () => window.clearTimeout(t);
  }, [live, panel]);

  const inEaseOut = Boolean(closing) && sinceEnd < 400;
  const showRest = Boolean(closing) && sinceEnd >= 400;
  const showUndo = Boolean(closing) && now - closing!.endedAt < 8_000;
  const showPositionAsk =
    showRest &&
    pinnedPosition &&
    lastPositionAt &&
    now - lastPositionAt > 20 * 60_000;

  const hands =
    touchPref === "none"
      ? "Voice + timer only."
      : touchPref === "light"
        ? HANDS_ON.heat.how
        : pinnedPosition === "hands-knees"
          ? HANDS_ON.counterpressure.how
          : HANDS_ON.hip.how;

  if (showRest) {
    return (
      <div className="flex flex-1 flex-col px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-8">
        <p className="text-center text-[32px] font-medium leading-tight tracking-tight">
          Clear rest
        </p>
        <p className="mt-3 text-center text-[18px] text-muted">
          {formatElapsed(closing!.duration)} wave
        </p>
        {showPositionAsk ? (
          <p className="mt-6 text-center text-[22px] font-medium">
            When this wave ends: counter or floor?
          </p>
        ) : null}
        {showUndo ? (
          <button
            type="button"
            onClick={undoEnd}
            className="mt-6 text-center text-[17px] text-action"
          >
            Ended too soon?
          </button>
        ) : null}
        {intensityPrompt ? (
          <div className="mt-8">
            <p className="mb-3 text-center text-[15px] text-muted">Intensity — skippable</p>
            <div className="flex justify-center gap-2">
              {([1, 2, 3, 4, 5] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setIntensity(n)}
                  className="flex size-12 items-center justify-center rounded-full bg-raised text-[18px] font-semibold tabular-nums"
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <div className="mt-auto flex flex-col gap-3">
          <button
            type="button"
            onClick={discardLast}
            className="min-h-12 text-[17px] text-muted"
          >
            Not a wave
          </button>
          <button
            type="button"
            onClick={skipRest}
            className="min-h-14 rounded-2xl bg-raised text-[18px] font-medium"
          >
            Back to now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex flex-1 flex-col"
      onPointerDown={() => setDim(false)}
    >
      <div className="flex flex-1 flex-col items-center px-5 pt-[max(2.5rem,env(safe-area-inset-top))]">
        <p
          className={cn(
            "min-h-[4.5rem] max-w-[16ch] text-center text-[30px] font-medium leading-tight tracking-tight",
            dim && "opacity-70",
          )}
        >
          {cantBreathe ? CANT_BREATHE_LINE : line}
        </p>

        <div className="relative mt-8 flex size-[280px] items-center justify-center">
          {breathArmed ? (
            <div
              className={cn(
                "motion-ring absolute inset-0 rounded-full border-2 border-action/45",
                !reduceMotion && phase === "peak" && "is-peak",
              )}
              style={
                {
                  "--ring-scale": reduceMotion ? 1 : scale,
                  transform: `scale(${reduceMotion ? 1 : scale})`,
                } as CSSProperties
              }
            />
          ) : null}
          <p className="timer relative z-10 font-semibold tabular-nums leading-none tracking-tight text-fg"
            style={{ fontSize: "var(--text-num)" }}
          >
            {formatElapsed(elapsed)}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "chrome mt-auto flex flex-col items-center home-pad",
          dim && "opacity-80",
        )}
      >
        {panel ? (
          <div className="mb-4 w-full max-w-[360px] rounded-2xl bg-surface px-4 py-4">
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={endWave}
                className="min-h-12 rounded-xl bg-raised text-[17px] font-medium"
              >
                End
              </button>
              <button
                type="button"
                onClick={() => setTakeCharge(!takeCharge)}
                className={cn(
                  "min-h-12 rounded-xl text-[17px] font-medium",
                  takeCharge ? "bg-action text-action-fg" : "bg-raised",
                )}
              >
                Take-charge
              </button>
              <button
                type="button"
                onClick={() => setCantBreathe(!cantBreathe)}
                className={cn(
                  "min-h-12 rounded-xl text-[17px] font-medium",
                  cantBreathe ? "bg-ease text-ease-fg" : "bg-raised",
                )}
              >
                Can’t breathe
              </button>
              <p className="pt-1 text-[15px] leading-snug text-muted">{hands}</p>
              <button
                type="button"
                onClick={markPeak}
                className="min-h-11 text-[15px] text-action"
              >
                That was the top
              </button>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setPanel((v) => !v)}
          className="mb-3 flex min-h-11 items-center gap-1 text-[15px] text-muted"
        >
          <ChevronUp className={cn("size-4", panel && "rotate-180")} />
          Partner
        </button>

        <GiantCircle
          label="End"
          caption={inEaseOut ? "Going." : "Wave over."}
          tone="ease"
          onClick={endWave}
        />
      </div>
    </div>
  );
}

export { POSITIONS };

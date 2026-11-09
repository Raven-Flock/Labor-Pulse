import { STAGE_BLURB } from "@/lib/labor/copy";
import { formatClock, formatDuration, formatInterval } from "@/lib/labor/format";
import { useLaborStore } from "@/lib/labor/store";
import { usePeakArchitect } from "@/lib/labor/use-peak";
import { BatteryCharging } from "lucide-react";
import { Chip, GiantCircle, Stat } from "./primitives";
import { HourGraph, Sparkline } from "./WaveGraph";

export function NowScreen({ now }: { now: number }) {
  const waves = useLaborStore((s) => s.waves);
  const session = useLaborStore((s) => s.session);
  const startWave = useLaborStore((s) => s.startWave);
  const setSheet = useLaborStore((s) => s.setSheet);
  const startPracticeBreath = useLaborStore((s) => s.startPracticeBreath);
  const ackBattery = useLaborStore((s) => s.ackBattery);
  const setBagsByDoor = useLaborStore((s) => s.setBagsByDoor);
  const setTab = useLaborStore((s) => s.setTab);
  const bags = useLaborStore((s) => s.bags);
  const flags = useLaborStore((s) => s.flags);
  const { stage, avgs } = usePeakArchitect(now);

  const completed = waves.filter((w) => w.end != null);
  const last = completed.at(-1);
  const empty = completed.length === 0;
  const spark = waves.filter((w) => w.duration != null).slice(-8);
  const hourSet = waves.filter((w) => w.start >= now - 60 * 60_000 && w.duration != null);
  const recentById = new Map(spark.map((w) => [w.id, w]));
  for (const w of hourSet) recentById.set(w.id, w);
  const recentWaves = [...recentById.values()].sort((a, b) => a.start - b.start);
  const showBattery =
    Boolean(session.laborStartedAt) && !session.batteryWarnedAt && !session.practiceOnly;
  const maybeReal = stage.stage === "early" || stage.stage === "active" || stage.stage === "transition";
  const unchecked = bags.filter((b) => !b.done);
  const showDoorNudge = maybeReal && !session.bagsByDoor && !session.practiceOnly;
  const showCallBags =
    maybeReal &&
    session.bagsByDoor &&
    !session.bagsInCar &&
    unchecked.length > 0 &&
    !session.practiceOnly;

  return (
    <div className="flex flex-1 flex-col gap-4 px-5 pb-4">
      <button
        type="button"
        onClick={() => setSheet("stage")}
        className="flex flex-col items-start gap-1 rounded-2xl bg-surface px-4 py-3 text-left"
      >
        <Chip tone="action">Suggested · {STAGE_BLURB[stage.stage].name}</Chip>
        {stage.stage === "need-more" ? (
          <p className="mt-1 text-[15px] text-muted">A handful of waves will sketch a pattern.</p>
        ) : (
          <p className="mt-1 text-[15px] text-muted">{stage.windowLabel}</p>
        )}
      </button>

      {showBattery ? (
        <div className="flex items-start gap-3 rounded-2xl bg-raised px-4 py-3">
          <BatteryCharging className="mt-0.5 size-5 text-action" />
          <div className="flex-1">
            <p className="text-[17px] font-medium">Plug in. Allow this app through Focus.</p>
            <button
              type="button"
              onClick={ackBattery}
              className="mt-2 text-[15px] text-action"
            >
              Got it
            </button>
          </div>
        </div>
      ) : null}

      {showDoorNudge ? (
        <button
          type="button"
          onClick={setBagsByDoor}
          className="rounded-2xl bg-surface px-4 py-3 text-left text-[17px]"
        >
          This might be real. Bags by the door when you can.
        </button>
      ) : null}

      {showCallBags ? (
        <button
          type="button"
          onClick={() => setTab("bags")}
          className="rounded-2xl bg-surface px-4 py-3 text-left text-[17px]"
        >
          Unchecked: {unchecked.slice(0, 4).map((b) => b.label).join(", ")}
          {unchecked.length > 4 ? "…" : ""}
        </button>
      ) : null}

      {flags.length > 0 ? (
        <p className="text-[14px] text-alert">
          {flags.length} flag{flags.length === 1 ? "" : "s"} logged
        </p>
      ) : null}

      {empty ? (
        <div className="flex flex-1 flex-col justify-end gap-6">
          <p className="text-[22px] font-medium leading-snug tracking-tight">
            Tap when a wave starts. We’ll time the rest.
          </p>
          <button
            type="button"
            onClick={startPracticeBreath}
            className="inline-flex min-h-11 min-w-11 items-center self-start text-[17px] text-ease"
          >
            Practice a breath
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-3">
            <Stat label="Last interval" value={formatInterval(last?.interval ?? null)} />
            <Stat label="Last duration" value={formatDuration(last?.duration ?? null)} />
          </div>
          <div className="flex gap-3">
            <Stat label="Last 5 interval" value={formatInterval(avgs.last5.interval)} />
            <Stat label="Last 5 duration" value={formatDuration(avgs.last5.duration)} />
          </div>
          <Sparkline waves={waves} decorative />
          <HourGraph waves={waves} hours={1} decorative />
          <ul className="sr-only" aria-label="Recent waves">
            {recentWaves.map((w) => (
              <li key={w.id}>
                {formatClock(w.start)} · {formatDuration(w.duration)}
                {w.isPractice ? " · practice" : ""}
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-auto flex flex-col items-center gap-4 pt-2">
        <GiantCircle
          label="Start"
          caption="Tap when the wave begins."
          tone="action"
          onClick={startWave}
        />
        <div className="flex gap-2 pb-1">
          <Chip onClick={() => setSheet("flags")}>Log a change</Chip>
          <Chip onClick={() => setSheet("nurse")}>Nurse card</Chip>
        </div>
      </div>
    </div>
  );
}

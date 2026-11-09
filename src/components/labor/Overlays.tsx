import { useEffect, useRef, useState } from "react";
import { DISCLAIMER, FLAG_LABEL, STAGE_BLURB } from "@/lib/labor/copy";
import { averages, lastHourStats } from "@/lib/labor/engine";
import {
  formatClock,
  formatDayTime,
  formatDuration,
  formatInterval,
  mapsHref,
  telHref,
} from "@/lib/labor/format";
import { hapticAlert } from "@/lib/labor/haptics";
import { leavingNote, nurseCardText, shareOrCopy, triageScript } from "@/lib/labor/share";
import { useLaborStore } from "@/lib/labor/store";
import type { CallReason, FlagType } from "@/lib/labor/types";
import { usePeakArchitect } from "@/lib/labor/use-peak";
import { Field, Sheet, TextInput } from "./primitives";

const FLAG_ORDER: FlagType[] = [
  "water",
  "mucus",
  "bleeding",
  "reduced_movement",
  "vomiting",
  "epidural",
  "pitocin",
  "wrong",
];

const CALL_COPY: Record<CallReason, string> = {
  rule: "The pattern matches your call rule.",
  water: "Water broke. Call now.",
  bleeding: "Bright red bleeding. Call now.",
  stacking: "Waves are stacking. Call if this is new.",
  movement: "Reduced movement. Call now.",
  wrong: "Something feels wrong. Call now.",
  override: "Your provider said to go at regular waves.",
};

export function StageSheet({ now }: { now: number }) {
  const sheet = useLaborStore((s) => s.sheet);
  const setSheet = useLaborStore((s) => s.setSheet);
  const waves = useLaborStore((s) => s.waves);
  const session = useLaborStore((s) => s.session);
  const falseAlarm = useLaborStore((s) => s.falseAlarm);
  const openCall = useLaborStore((s) => s.openCall);
  const { stage, avgs } = usePeakArchitect(now);
  const blurb = STAGE_BLURB[stage.stage];

  return (
    <Sheet open={sheet === "stage"} onClose={() => setSheet(null)} title={blurb.name}>
      <p className="text-[18px] leading-relaxed">{blurb.feel}</p>
      <dl className="mt-5 space-y-2 text-[16px]">
        <div className="flex justify-between">
          <dt className="text-muted">Last 5 interval</dt>
          <dd className="tabular-nums">{formatInterval(avgs.last5.interval)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Last 5 duration</dt>
          <dd className="tabular-nums">{formatDuration(avgs.last5.duration)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Last 60 min interval</dt>
          <dd className="tabular-nums">{formatInterval(avgs.last60.interval)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Last 60 min duration</dt>
          <dd className="tabular-nums">{formatDuration(avgs.last60.duration)}</dd>
        </div>
      </dl>
      <p className="mt-4 text-[15px] text-muted">{stage.windowLabel}</p>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">{DISCLAIMER}</p>
      <p className="mt-4 text-[15px] text-muted">This is a suggested pattern. Never centimeters.</p>
      <div className="mt-6 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => openCall("wrong")}
          className="min-h-12 rounded-xl bg-alert text-[16px] font-semibold text-alert-fg"
        >
          This feels different
        </button>
        <button
          type="button"
          onClick={falseAlarm}
          className="min-h-12 rounded-xl bg-raised text-[16px]"
        >
          False alarm / sent home
        </button>
      </div>
      {session.falseAlarm ? (
        <p className="mt-3 text-[14px] text-muted">Banners silenced. Log kept.</p>
      ) : null}
      <p className="mt-4 hidden">{waves.length}</p>
    </Sheet>
  );
}

export function FlagSheet() {
  const sheet = useLaborStore((s) => s.sheet);
  const setSheet = useLaborStore((s) => s.setSheet);
  const addFlag = useLaborStore((s) => s.addFlag);
  const flags = useLaborStore((s) => s.flags);
  const removeFlag = useLaborStore((s) => s.removeFlag);

  return (
    <Sheet open={sheet === "flags"} onClose={() => setSheet(null)} title="Log a change">
      <div className="flex flex-col gap-2">
        {FLAG_ORDER.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => addFlag(type)}
            className="min-h-12 rounded-xl bg-raised px-4 text-left text-[17px]"
          >
            {FLAG_LABEL[type]}
          </button>
        ))}
      </div>
      {flags.length > 0 ? (
        <ul className="mt-5 flex flex-col gap-2">
          {flags.map((f) => (
            <li key={f.id} className="flex items-center justify-between text-[15px]">
              <span>
                {FLAG_LABEL[f.type]} · {formatClock(f.at)}
              </span>
              <button type="button" onClick={() => removeFlag(f.id)} className="text-muted">
                Undo
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </Sheet>
  );
}

export function NurseSheet({ now }: { now: number }) {
  const sheet = useLaborStore((s) => s.sheet);
  const setSheet = useLaborStore((s) => s.setSheet);
  const settings = useLaborStore((s) => s.settings);
  const flags = useLaborStore((s) => s.flags);
  const waves = useLaborStore((s) => s.waves);
  const session = useLaborStore((s) => s.session);
  const { stage } = usePeakArchitect(now);
  const stats = lastHourStats(waves, session.phaseResetAt, now);
  const avg = averages(waves, session.phaseResetAt, now);
  const [status, setStatus] = useState("");

  const text = nurseCardText(settings, flags, waves, session, now);

  return (
    <Sheet open={sheet === "nurse"} onClose={() => setSheet(null)} title="Nurse card">
      <div className="rounded-2xl bg-raised px-4 py-5">
        <p className="text-[13px] uppercase tracking-[0.14em] text-muted">Labor Pulse</p>
        <p className="mt-3 text-[22px] font-semibold leading-snug">
          {STAGE_BLURB[stage.stage].name}
        </p>
        <dl className="mt-4 space-y-2 text-[17px]">
          <Row
            k="Started"
            v={
              session.laborStartedAt
                ? formatDayTime(session.laborStartedAt)
                : waves[0]
                  ? formatDayTime(waves[0].start)
                  : "—"
            }
          />
          <Row k="Last 60 min interval" v={formatInterval(stats.avgInterval)} />
          <Row k="Last 60 min duration" v={formatDuration(stats.avgDuration)} />
          <Row k="Last 5 interval" v={formatInterval(avg.last5.interval)} />
          <Row k="Last 5 duration" v={formatDuration(avg.last5.duration)} />
          <Row k="Longest wave" v={formatDuration(stats.longest)} />
          <Row
            k="Left home"
            v={session.leftHomeAt ? formatDayTime(session.leftHomeAt) : "still home"}
          />
        </dl>
        <p className="mt-4 text-[15px] text-muted">
          Flags:{" "}
          {flags.length
            ? flags.map((f) => `${FLAG_LABEL[f.type]} ${formatClock(f.at)}`).join(" · ")
            : "none"}
        </p>
      </div>
      <button
        type="button"
        onClick={async () => {
          const r = await shareOrCopy("Labor Pulse nurse card", text);
          setStatus(r === "copied" ? "Copied" : "Shared");
        }}
        className="mt-4 min-h-12 w-full rounded-xl bg-action text-[16px] font-semibold text-action-fg"
      >
        Share card
      </button>
      {status ? <p className="mt-2 text-[14px] text-muted">{status}</p> : null}
      <p className="mt-4 text-[14px] text-muted">{DISCLAIMER}</p>
    </Sheet>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{k}</dt>
      <dd className="tabular-nums">{v}</dd>
    </div>
  );
}

export function WaveEditSheet() {
  const sheet = useLaborStore((s) => s.sheet);
  const setSheet = useLaborStore((s) => s.setSheet);
  const editingWaveId = useLaborStore((s) => s.editingWaveId);
  const waves = useLaborStore((s) => s.waves);
  const editWave = useLaborStore((s) => s.editWave);
  const deleteWave = useLaborStore((s) => s.deleteWave);
  const wave = waves.find((w) => w.id === editingWaveId);
  const [seconds, setSeconds] = useState("");
  const [note, setNote] = useState("");

  const open = sheet === "wave-edit" && Boolean(wave);

  return (
    <Sheet
      open={open}
      onClose={() => {
        setSheet(null);
      }}
      title="Edit wave"
    >
      {wave ? (
        <div className="flex flex-col gap-4">
          <p className="text-[16px] text-muted">Started {formatDayTime(wave.start)}</p>
          <Field label="Duration seconds" hint="Wrong taps should be fixable in two seconds.">
            <TextInput
              inputMode="numeric"
              defaultValue={String(Math.round((wave.duration ?? 0) / 1000))}
              onChange={(e) => setSeconds(e.target.value)}
            />
          </Field>
          <Field label="Note">
            <TextInput
              defaultValue={wave.note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Field>
          <button
            type="button"
            onClick={() => {
              const dur = seconds ? Number(seconds) * 1000 : wave.duration;
              editWave(wave.id, {
                duration: dur,
                end: dur ? wave.start + dur : wave.end,
                note: note || wave.note,
              });
            }}
            className="min-h-12 rounded-xl bg-action font-semibold text-action-fg"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => deleteWave(wave.id)}
            className="min-h-12 rounded-xl bg-raised text-alert"
          >
            Delete wave
          </button>
        </div>
      ) : null}
    </Sheet>
  );
}

export function LeavingSheet() {
  const sheet = useLaborStore((s) => s.sheet);
  const setSheet = useLaborStore((s) => s.setSheet);
  const settings = useLaborStore((s) => s.settings);
  const bags = useLaborStore((s) => s.bags);
  const session = useLaborStore((s) => s.session);
  const arrived = useLaborStore((s) => s.arrived);
  const [status, setStatus] = useState("");
  const text = leavingNote(settings, bags, session);
  const map = mapsHref(settings.hospitalAddress);

  return (
    <Sheet open={sheet === "leaving"} onClose={() => setSheet(null)} title="Leaving now">
      <pre className="whitespace-pre-wrap font-sans text-[17px] leading-relaxed">{text}</pre>
      {map ? (
        <a href={map} className="mt-4 block text-[16px] text-action">
          Pin address
        </a>
      ) : null}
      <button
        type="button"
        onClick={async () => {
          const r = await shareOrCopy("Leaving now", text);
          setStatus(r === "copied" ? "Copied" : "Shared");
        }}
        className="mt-4 min-h-12 w-full rounded-xl bg-action font-semibold text-action-fg"
      >
        Share
      </button>
      <button
        type="button"
        onClick={() => {
          arrived();
          setSheet(null);
        }}
        className="mt-2 min-h-12 w-full rounded-xl bg-raised"
      >
        We arrived
      </button>
      {status ? <p className="mt-2 text-[14px] text-muted">{status}</p> : null}
    </Sheet>
  );
}

export function CallNowModal() {
  const call = useLaborStore((s) => s.call);
  const settings = useLaborStore((s) => s.settings);
  const flags = useLaborStore((s) => s.flags);
  const waves = useLaborStore((s) => s.waves);
  const session = useLaborStore((s) => s.session);
  const dismissCall = useLaborStore((s) => s.dismissCall);
  const closeCall = useLaborStore((s) => s.closeCall);
  const leavingNow = useLaborStore((s) => s.leavingNow);
  const setTab = useLaborStore((s) => s.setTab);
  const reason = call.reason;
  const open = call.open && Boolean(reason);
  const dismissible =
    reason !== "bleeding" && reason !== "water" && reason !== "movement";

  const hospital = telHref(settings.contacts.hospital);
  const midwife = telHref(settings.contacts.midwife);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!open) return;
    const root = dialogRef.current;
    const previously =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const inerted: HTMLElement[] = [];
    const parent = root?.parentElement;
    if (parent && root) {
      for (const child of Array.from(parent.children)) {
        if (child !== root && child instanceof HTMLElement && !child.inert) {
          child.inert = true;
          inerted.push(child);
        }
      }
    }
    titleRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (!root) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeCall();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = [
        ...root.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])",
        ),
      ].filter((el) => el.getAttribute("aria-disabled") !== "true");
      if (focusables.length === 0) {
        e.preventDefault();
        titleRef.current?.focus();
        return;
      }
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      const active = document.activeElement;
      if (e.shiftKey) {
        if (active === first || active === titleRef.current || !root.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      for (const el of inerted) el.inert = false;
      if (previously && document.contains(previously)) {
        previously.focus();
      } else {
        const heading = document.querySelector<HTMLElement>("main h1, h1");
        if (heading) {
          if (!heading.hasAttribute("tabindex")) heading.tabIndex = -1;
          heading.focus();
        }
      }
    };
  }, [open, closeCall]);

  if (!open || !reason) return null;

  const missingContact = !hospital || !midwife;

  return (
    <div
      ref={dialogRef}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="call-now-title"
      data-tone="alert"
      className="absolute inset-0 z-50 flex flex-col overflow-y-auto bg-alert px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))] text-alert-fg"
    >
      <CallAlertFire />
      <p className="text-[13px] font-medium uppercase tracking-[0.16em]">Call now</p>
      <h1
        id="call-now-title"
        ref={titleRef}
        tabIndex={-1}
        className="mt-3 text-[2rem] font-semibold leading-tight tracking-tight"
      >
        {CALL_COPY[reason]}
      </h1>
      <p className="mt-6 text-[18px] leading-relaxed">
        {triageScript(settings, flags, waves, session)}
      </p>
      <div className="mt-auto flex flex-col gap-2 pt-6">
        {hospital ? (
          <a
            href={hospital}
            className="flex min-h-14 items-center justify-center rounded-2xl bg-alert-fg text-[18px] font-semibold text-alert"
          >
            Call hospital
          </a>
        ) : (
          <p className="flex min-h-11 items-center justify-center text-center text-[18px] font-medium">
            Hospital number not set
          </p>
        )}
        {midwife ? (
          <a
            href={midwife}
            className="flex min-h-14 items-center justify-center rounded-2xl bg-alert-fg/15 text-[18px] font-semibold"
          >
            Call midwife
          </a>
        ) : (
          <p className="flex min-h-11 items-center justify-center text-center text-[18px] font-medium">
            Midwife number not set
          </p>
        )}
        {missingContact ? (
          <p className="text-center text-[15px]">Add contact numbers in Settings.</p>
        ) : null}
        <button
          type="button"
          onClick={() => {
            closeCall();
            setTab("bags");
          }}
          className="flex min-h-14 items-center justify-center rounded-2xl bg-alert-fg/15 text-[18px] font-semibold"
        >
          Grab bags
        </button>
        <button
          type="button"
          onClick={leavingNow}
          className="min-h-12 text-[16px] font-medium"
        >
          We’re leaving
        </button>
        {dismissible ? (
          <button type="button" onClick={dismissCall} className="min-h-12 text-[16px]">
            Dismiss 10 min
          </button>
        ) : (
          <p className="text-center text-[15px]">This alert cannot be dismissed.</p>
        )}
        <p className="pt-2 text-center text-[14px] opacity-80">
          For a true emergency that cannot wait, call 911.
        </p>
      </div>
    </div>
  );
}

function CallAlertFire() {
  const preset = useLaborStore((s) => s.settings.hapticPreset);
  const sensitive = useLaborStore((s) => s.settings.sensitive);
  useEffect(() => {
    hapticAlert(preset, sensitive);
  }, [preset, sensitive]);
  return null;
}

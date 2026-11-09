import { useId } from "react";
import { DISCLAIMER, LOG_PRIVACY } from "@/lib/labor/copy";
import { hapticsAreVisualOnly } from "@/lib/labor/haptics";
import { useLaborStore } from "@/lib/labor/store";
import type { CallRule, HapticPreset, Role } from "@/lib/labor/types";
import { Field, Segmented, TextArea, TextInput, Toggle } from "./primitives";

export function SettingsScreen() {
  const settings = useLaborStore((s) => s.settings);
  const patch = useLaborStore((s) => s.patchSettings);
  const falseAlarm = useLaborStore((s) => s.falseAlarm);
  const deleteLog = useLaborStore((s) => s.deleteLog);
  const session = useLaborStore((s) => s.session);
  const visualOnly = hapticsAreVisualOnly();

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 pb-10">
      <header>
        <h1 className="text-[28px] font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-[15px] text-muted">{LOG_PRIVACY}</p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-[13px] font-medium uppercase tracking-[0.12em] text-muted">
          This phone
        </h2>
        <Segmented<Role>
          value={settings.role}
          onChange={(role) => patch({ role })}
          options={[
            { id: "birthing", label: "Birthing" },
            { id: "partner", label: "Partner" },
            { id: "both", label: "Both" },
          ]}
        />
        <Field label="Birthing person’s name">
          <TextInput
            value={settings.birthingName}
            onChange={(e) => patch({ birthingName: e.target.value })}
            placeholder="For the triage script"
          />
        </Field>
        <Field label="Weeks">
          <TextInput
            inputMode="numeric"
            value={settings.weeks?.toString() ?? ""}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              patch({ weeks: Number.isFinite(n) ? n : null });
            }}
            placeholder="Optional"
          />
        </Field>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[13px] font-medium uppercase tracking-[0.12em] text-muted">
          Call rule
        </h2>
        <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
          <span className="text-[17px]">First baby</span>
          <Toggle
            label="First baby"
            checked={settings.firstBaby}
            onChange={(firstBaby) => patch({ firstBaby })}
          />
        </div>
        <Segmented<CallRule>
          value={settings.callRule}
          onChange={(callRule) => patch({ callRule })}
          options={[
            { id: "5-1-1", label: "5-1-1" },
            { id: "4-1-1", label: "4-1-1" },
            { id: "custom", label: "Custom" },
          ]}
        />
        {settings.callRule === "custom" ? (
          <div className="grid grid-cols-3 gap-2">
            <Field label="Interval min">
              <TextInput
                inputMode="numeric"
                value={String(settings.customRule.intervalMin)}
                onChange={(e) =>
                  patch({
                    customRule: {
                      ...settings.customRule,
                      intervalMin: Number(e.target.value) || 0,
                    },
                  })
                }
              />
            </Field>
            <Field label="Duration s">
              <TextInput
                inputMode="numeric"
                value={String(settings.customRule.durationSec)}
                onChange={(e) =>
                  patch({
                    customRule: {
                      ...settings.customRule,
                      durationSec: Number(e.target.value) || 0,
                    },
                  })
                }
              />
            </Field>
            <Field label="For min">
              <TextInput
                inputMode="numeric"
                value={String(settings.customRule.sustainedMin)}
                onChange={(e) =>
                  patch({
                    customRule: {
                      ...settings.customRule,
                      sustainedMin: Number(e.target.value) || 0,
                    },
                  })
                }
              />
            </Field>
          </div>
        ) : null}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[13px] font-medium uppercase tracking-[0.12em] text-muted">
          Place
        </h2>
        <Field label="Hospital name">
          <TextInput
            value={settings.hospitalName}
            onChange={(e) => patch({ hospitalName: e.target.value })}
          />
        </Field>
        <Field label="Address">
          <TextInput
            value={settings.hospitalAddress}
            onChange={(e) => patch({ hospitalAddress: e.target.value })}
          />
        </Field>
        <Field label="Parking note">
          <TextArea
            value={settings.parkingNote}
            onChange={(e) => patch({ parkingNote: e.target.value })}
            placeholder="Garage, entrance, code"
          />
        </Field>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[13px] font-medium uppercase tracking-[0.12em] text-muted">
          Contacts
        </h2>
        {(
          [
            ["hospital", "Hospital"],
            ["afterHours", "After hours"],
            ["midwife", "Midwife"],
            ["doula", "Doula"],
            ["pediatrician", "Pediatrician"],
            ["backupDriver", "Backup driver"],
          ] as const
        ).map(([key, label]) => (
          <Field key={key} label={label}>
            <TextInput
              type="tel"
              value={settings.contacts[key]}
              onChange={(e) =>
                patch({
                  contacts: { ...settings.contacts, [key]: e.target.value },
                })
              }
            />
          </Field>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[13px] font-medium uppercase tracking-[0.12em] text-muted">
          Provider
        </h2>
        <ToggleRow
          label="Go at first regular waves"
          checked={settings.goAtFirstRegular}
          onChange={(goAtFirstRegular) => patch({ goAtFirstRegular })}
        />
        <ToggleRow
          label="Induction — unit instructions win"
          checked={settings.inductionMode}
          onChange={(inductionMode) => patch({ inductionMode })}
        />
        <ToggleRow
          label="VBAC / special instructions"
          checked={settings.vbac}
          onChange={(vbac) => patch({ vbac })}
        />
        <ToggleRow
          label="Don’t eat"
          checked={settings.dontEat}
          onChange={(dontEat) => patch({ dontEat })}
        />
        <ToggleRow
          label="Provider said stay in bed"
          checked={settings.stayInBed}
          onChange={(stayInBed) => patch({ stayInBed })}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[13px] font-medium uppercase tracking-[0.12em] text-muted">
          Feel
        </h2>
        <p className="text-[15px] text-muted">
          {visualOnly
            ? "iPhone Home Screen PWA cannot use Taptic Engine. Peak is visual only."
            : "Haptics follow Peak Architect. They never own the clock."}
        </p>
        <Segmented<HapticPreset>
          value={settings.hapticPreset}
          onChange={(hapticPreset) => patch({ hapticPreset })}
          options={[
            { id: "off", label: "Off" },
            { id: "peak", label: "Peak" },
            { id: "full", label: "Full" },
            { id: "alerts", label: "Alerts" },
          ]}
        />
        <ToggleRow
          label="Sensitive haptics"
          checked={settings.sensitive}
          onChange={(sensitive) => patch({ sensitive })}
        />
        <ToggleRow
          label="Reduce motion"
          checked={settings.reduceMotion}
          onChange={(reduceMotion) => patch({ reduceMotion })}
        />
        <ToggleRow
          label="Giant type"
          checked={settings.giantType}
          onChange={(giantType) => patch({ giantType })}
        />
        <ToggleRow
          label="Spoken cues"
          checked={settings.spokenCues}
          onChange={(spokenCues) => patch({ spokenCues })}
        />
        <ToggleRow
          label="Practice as default"
          checked={settings.practiceDefault}
          onChange={(practiceDefault) => patch({ practiceDefault })}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[13px] font-medium uppercase tracking-[0.12em] text-muted">
          This labor
        </h2>
        <button
          type="button"
          onClick={falseAlarm}
          className="min-h-12 rounded-2xl bg-raised text-[16px]"
        >
          False alarm / sent home
        </button>
        {session.falseAlarm ? (
          <p className="text-[14px] text-muted">
            Log kept. Banners silenced. Pattern reset to early.
          </p>
        ) : null}
        <button
          type="button"
          onClick={deleteLog}
          className="min-h-12 rounded-2xl bg-surface text-[16px] text-alert"
        >
          Delete log
        </button>
      </section>

      <p className="text-[16px] leading-relaxed text-muted">{DISCLAIMER}</p>
      <p className="text-[14px] text-muted">
        If this helped, a tip jar will live here later. Never required. No ads. No
        account.
      </p>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const labelId = useId();
  return (
    <div
      className="flex min-h-14 items-center justify-between gap-3 rounded-2xl bg-surface px-4"
      onClick={() => onChange(!checked)}
    >
      <span id={labelId} className="text-[17px]">
        {label}
      </span>
      <Toggle labelledBy={labelId} label={label} checked={checked} onChange={onChange} />
    </div>
  );
}

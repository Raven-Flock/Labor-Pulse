import { useState } from "react";
import { BAG_SUGGESTIONS, slugBag } from "@/lib/labor/copy";
import { mapsHref, telHref } from "@/lib/labor/format";
import { useLaborStore } from "@/lib/labor/store";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, ChevronUp, Phone, Plus, Trash2 } from "lucide-react";
import { TextInput } from "./primitives";

export function BagsScreen() {
  const bags = useLaborStore((s) => s.bags);
  const sections = useLaborStore((s) => s.bagSections);
  const toggleBag = useLaborStore((s) => s.toggleBag);
  const addBagItem = useLaborStore((s) => s.addBagItem);
  const editBagItem = useLaborStore((s) => s.editBagItem);
  const removeBagItem = useLaborStore((s) => s.removeBagItem);
  const renameBagSection = useLaborStore((s) => s.renameBagSection);
  const deleteBagSection = useLaborStore((s) => s.deleteBagSection);
  const addBagSection = useLaborStore((s) => s.addBagSection);
  const moveBagSection = useLaborStore((s) => s.moveBagSection);
  const resetBags = useLaborStore((s) => s.resetBags);
  const settings = useLaborStore((s) => s.settings);
  const session = useLaborStore((s) => s.session);
  const setBagsByDoor = useLaborStore((s) => s.setBagsByDoor);
  const setBagsInCar = useLaborStore((s) => s.setBagsInCar);
  const leavingNow = useLaborStore((s) => s.leavingNow);
  const openCall = useLaborStore((s) => s.openCall);

  const [draft, setDraft] = useState<Record<string, string>>({});
  const [sectionDraft, setSectionDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [sectionName, setSectionName] = useState("");
  const [confirmSection, setConfirmSection] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const packed = bags.filter((b) => b.done).length;
  const total = bags.length;
  const hospitalTel = telHref(settings.contacts.hospital);
  const midwifeTel = telHref(settings.contacts.midwife);
  const map = mapsHref(settings.hospitalAddress);
  const sectionIds = new Set(sections.map((s) => s.id));

  const suggestions = BAG_SUGGESTIONS.filter(
    (s) =>
      sectionIds.has(s.list) &&
      !bags.some((b) => slugBag(b.label) === slugBag(s.label)),
  );

  const commitItem = (id: string) => {
    const trimmed = editValue.trim();
    if (trimmed) editBagItem(id, trimmed);
    setEditingId(null);
    setEditValue("");
  };

  const commitSection = (id: string) => {
    const trimmed = sectionName.trim();
    if (trimmed) renameBagSection(id, trimmed);
    setEditingSection(null);
    setSectionName("");
  };

  return (
    <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 pb-6">
      <header>
        <h1 className="text-[28px] font-semibold tracking-tight">Hospital bag</h1>
        <p className="mt-1 text-[16px] text-muted">
          Start with a common list. Add, rename, or delete anything — including whole sections.
        </p>
        <p className="mt-2 text-[17px] font-medium tabular-nums text-action">
          {packed} of {total} packed
        </p>
      </header>

      {sections.map((list, index) => {
        const items = bags
          .filter((b) => b.list === list.id)
          .slice()
          .sort((a, b) => Number(a.done) - Number(b.done));
        return (
          <section key={list.id} className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              {editingSection === list.id ? (
                <TextInput
                  autoFocus
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  onBlur={() => commitSection(list.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitSection(list.id);
                    }
                    if (e.key === "Escape") {
                      setEditingSection(null);
                      setSectionName("");
                    }
                  }}
                  className="min-h-11 flex-1"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditingSection(list.id);
                    setSectionName(list.label);
                  }}
                  className="min-h-11 flex-1 rounded-xl px-2 text-left text-[16px] font-semibold tracking-tight"
                >
                  {list.label}
                </button>
              )}
              <button
                type="button"
                onClick={() => moveBagSection(list.id, -1)}
                disabled={index === 0}
                className="flex size-11 items-center justify-center rounded-xl bg-surface text-muted disabled:opacity-30"
                aria-label={`Move ${list.label} up`}
              >
                <ChevronUp className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => moveBagSection(list.id, 1)}
                disabled={index === sections.length - 1}
                className="flex size-11 items-center justify-center rounded-xl bg-surface text-muted disabled:opacity-30"
                aria-label={`Move ${list.label} down`}
              >
                <ChevronDown className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setConfirmSection(list.id)}
                className="flex size-11 items-center justify-center rounded-xl bg-surface text-muted"
                aria-label={`Delete ${list.label} section`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>

            {confirmSection === list.id ? (
              <div className="flex flex-col gap-2 rounded-2xl bg-surface px-3 py-3">
                <p className="text-[15px] leading-snug">
                  Delete {list.label} and its items? This does not come back unless you reset the starter list.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      deleteBagSection(list.id);
                      setConfirmSection(null);
                    }}
                    className="min-h-11 flex-1 rounded-xl bg-alert text-[15px] font-semibold text-alert-fg"
                  >
                    Delete section
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmSection(null)}
                    className="min-h-11 flex-1 rounded-xl bg-raised text-[15px] font-medium"
                  >
                    Keep
                  </button>
                </div>
              </div>
            ) : null}

            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleBag(item.id)}
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-xl",
                    item.done ? "bg-ease text-ease-fg" : "bg-raised",
                  )}
                  aria-label={item.done ? `Unpack ${item.label}` : `Pack ${item.label}`}
                  aria-pressed={item.done}
                >
                  {item.done ? (
                    <Check className="size-6" />
                  ) : (
                    <span className="size-6 rounded-md border border-hairline" />
                  )}
                </button>
                {editingId === item.id ? (
                  <TextInput
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => commitItem(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        commitItem(item.id);
                      }
                      if (e.key === "Escape") {
                        setEditingId(null);
                        setEditValue("");
                      }
                    }}
                    className="min-h-12 flex-1"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(item.id);
                      setEditValue(item.label);
                    }}
                    className={cn(
                      "min-h-12 flex-1 rounded-xl px-3 text-left text-[17px]",
                      item.done ? "bg-raised text-muted line-through" : "bg-surface",
                    )}
                  >
                    {item.label}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeBagItem(item.id)}
                  className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-surface text-muted"
                  aria-label={`Remove ${item.label}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                addBagItem(list.id, draft[list.id] ?? "");
                setDraft((d) => ({ ...d, [list.id]: "" }));
              }}
            >
              <TextInput
                value={draft[list.id] ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, [list.id]: e.target.value }))
                }
                placeholder="Add item"
                className="flex-1"
              />
              <button
                type="submit"
                className="flex size-12 items-center justify-center rounded-xl bg-raised"
                aria-label={`Add ${list.label} item`}
              >
                <Plus className="size-5" />
              </button>
            </form>
          </section>
        );
      })}

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          addBagSection(sectionDraft);
          setSectionDraft("");
        }}
      >
        <TextInput
          value={sectionDraft}
          onChange={(e) => setSectionDraft(e.target.value)}
          placeholder="Add a section"
          className="flex-1"
        />
        <button
          type="submit"
          className="flex size-12 items-center justify-center rounded-xl bg-raised"
          aria-label="Add section"
        >
          <Plus className="size-5" />
        </button>
      </form>

      {suggestions.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-[15px] font-medium text-muted">Suggestions</h2>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={`${s.list}-${s.label}`}
                type="button"
                onClick={() => addBagItem(s.list, s.label)}
                className="min-h-11 rounded-full bg-surface px-3.5 text-[15px] font-medium"
              >
                {s.label}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {confirmReset ? (
        <div className="flex flex-col gap-2 rounded-2xl bg-surface px-4 py-3">
          <p className="text-[15px] leading-snug">
            Restore the starter list? Checks, renamed sections, and extra items go away.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                resetBags();
                setConfirmReset(false);
                setConfirmSection(null);
              }}
              className="min-h-11 flex-1 rounded-xl bg-action text-[15px] font-semibold text-action-fg"
            >
              Reset starter list
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="min-h-11 flex-1 rounded-xl bg-raised text-[15px] font-medium"
            >
              Keep mine
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          className="text-left text-[15px] text-muted underline-offset-4 hover:underline"
        >
          Reset starter list
        </button>
      )}

      <div className="grid grid-cols-2 gap-2">
        <a
          href={hospitalTel ?? "#"}
          aria-disabled={!hospitalTel ? true : undefined}
          tabIndex={!hospitalTel ? -1 : undefined}
          className={cn(
            "flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-action text-[16px] font-semibold text-action-fg",
            !hospitalTel && "pointer-events-none opacity-40",
          )}
        >
          <Phone className="size-4" />
          Hospital
        </a>
        <a
          href={midwifeTel ?? "#"}
          aria-disabled={!midwifeTel ? true : undefined}
          tabIndex={!midwifeTel ? -1 : undefined}
          className={cn(
            "flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-raised text-[16px] font-semibold",
            !midwifeTel && "pointer-events-none opacity-40",
          )}
        >
          <Phone className="size-4" />
          Midwife
        </a>
      </div>

      {map ? (
        <a href={map} className="text-[16px] text-action">
          {settings.hospitalAddress}
        </a>
      ) : null}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={setBagsByDoor}
          className={cn(
            "min-h-11 flex-1 rounded-xl text-[15px] font-medium",
            session.bagsByDoor ? "bg-ease text-ease-fg" : "bg-raised",
          )}
        >
          Bags by the door
        </button>
        <button
          type="button"
          onClick={setBagsInCar}
          className={cn(
            "min-h-11 flex-1 rounded-xl text-[15px] font-medium",
            session.bagsInCar ? "bg-ease text-ease-fg" : "bg-raised",
          )}
        >
          Bags in the car
        </button>
      </div>

      <button
        type="button"
        onClick={leavingNow}
        className="min-h-12 rounded-2xl bg-surface text-[16px] font-medium"
      >
        We’re leaving now
      </button>

      <button
        type="button"
        onClick={() => openCall("wrong")}
        className="flex min-h-12 items-center justify-center rounded-2xl bg-alert text-[16px] font-semibold text-alert-fg"
      >
        Something feels wrong
      </button>

      <p className="text-[13px] text-muted">
        Logs live on this phone. 911 is for emergencies that cannot wait.
      </p>
    </div>
  );
}

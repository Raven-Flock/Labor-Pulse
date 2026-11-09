import type {
  BagItem,
  BagSection,
  BreathPattern,
  FlagType,
  Role,
  SuggestedStage,
  WavePhase,
} from "./types";
import { publicAsset } from "../public-asset";

export const DISCLAIMER =
  "Timing is a pattern guess. Dilation, water, bleeding, and baby movement matter more. Call your midwife or hospital if anything feels wrong.";

export const LOG_PRIVACY =
  "Logs live on this phone. Nothing is sent unless you share a card.";

export const STAGE_BLURB: Record<SuggestedStage, { name: string; feel: string }> = {
  "need-more": {
    name: "Need a few more waves",
    feel: "A pattern needs a handful of timed waves. Nothing is late.",
  },
  irregular: {
    name: "Irregular / practice",
    feel: "Mixed timing is common. This is information, not a test.",
  },
  early: {
    name: "Early labor",
    feel: "Early labor can last a while. That’s the body opening the door, not a test.",
  },
  active: {
    name: "Active labor",
    feel: "Each wave has a peak and a come-down. Ride the peak; rest on the other side.",
  },
  transition: {
    name: "Transition-like",
    feel: "Often the shortest hard stretch. You are not stuck. You are close.",
  },
};

export const PHASE_LINE: Record<
  WavePhase,
  { birthing: string; partner: string }
> = {
  idle: { birthing: "", partner: "" },
  rise: {
    birthing: "Here it comes. Find the out-breath.",
    partner: "Here it is.",
  },
  peak: {
    birthing: "This is the top. Stay.",
    partner: "This is the top. Stay.",
  },
  ease: {
    birthing: "Going. Let the belly fall.",
    partner: "Going. Let it go.",
  },
  rest: {
    birthing: "Clear rest. Drink. Reset your jaw.",
    partner: "Clear rest. Water.",
  },
};

export const BREATH_META: Record<
  BreathPattern,
  { name: string; what: string; when: string; cue: string; how: string }
> = {
  "slow-wave": {
    name: "Slow belly / early labor",
    what: "Nose in, mouth out. Exhale a little longer than inhale. Belly rises. Jaw loose.",
    when: "Early labor, or any wave you can still talk through.",
    cue: "Long out-breath.",
    how: "In through the nose for 4. Out the mouth for 6–8.",
  },
  "counted-calm": {
    name: "Slow paced",
    what: "Even counts (4 in / 6 out). One easy organizing breath at the start of the wave.",
    when: "Waves are regular and you need a rhythm, but they are not yet overwhelming.",
    cue: "Keep the same speed.",
    how: "In 4, out 6. Same speed at the peak. Do not chase it.",
  },
  "low-and-low": {
    name: "Light / accelerated",
    what: "Shorter, lighter mouth breaths. Stay shallow on purpose. Do not gulp air.",
    when: "Active labor, when slow breathing is not enough and the peak is sharp.",
    cue: "Low voice. Don’t chase it.",
    how: "Low rib inhale. Low ooo or sss for 6–8 seconds.",
  },
  "light-blow": {
    name: "Patterned (pant-pant-blow / hee-hee-hoo)",
    what: "A few light pants, then one longer blow. Repeat. Do not hold the breath.",
    when: "Transition — waves stack, focus slips, or you feel pushy before you should push.",
    cue: "Pant pant blow. Don’t push.",
    how: "Light breaths on the rise. Pant-pant-blow on the peak. Slow wave on the ease.",
  },
  "rest-between": {
    name: "Rest between waves",
    what: "Soft normal breaths. Drop shoulders. No counting unless it helps.",
    when: "The space between contractions. Recover. Do not work the rest.",
    cue: "Clear rest. Drop your shoulders.",
    how: "Breathe however feels easy. Jaw loose.",
  },
  "breath-down": {
    name: "Open-glottis / pushing",
    what: "Breathe in, then exhale with sound (sigh, moan, slow blow) while bearing down. Do not lock the throat unless a clinician is coaching otherwise.",
    when: "Second stage only, when the urge to push is there or you have been told it is time.",
    cue: "Push on the peak. Breathe in the dip.",
    how: "In, chin tuck, exhale or bear down 5–6 seconds, 2–3 times per wave. Then Slow wave.",
  },
};

export const BREATH_FOOTER =
  "Coping tool, not medical advice. Follow your care team.";

export const STAGE_HEADERS = [
  { id: "early", label: "Early labor" },
  { id: "active", label: "Active labor" },
  { id: "transition", label: "Transition" },
  { id: "pushing", label: "Pushing / rest" },
] as const;

export type StageHeaderId = (typeof STAGE_HEADERS)[number]["id"];

export const BREATH_BY_STAGE: Record<StageHeaderId, BreathPattern[]> = {
  early: ["slow-wave", "counted-calm", "rest-between"],
  active: ["counted-calm", "low-and-low", "rest-between"],
  transition: ["low-and-low", "light-blow"],
  pushing: ["breath-down", "rest-between"],
};

export type GuidePositionId =
  | "forward-lean"
  | "birth-ball"
  | "hands-knees"
  | "kneeling-lean"
  | "side-lying"
  | "supported-squat";

export const GUIDE_POSITIONS: Record<
  GuidePositionId,
  { name: string; what: string; when: string; image: string }
> = {
  "forward-lean": {
    name: "Standing forward lean",
    what: "Forearms on a counter, wall, or partner. Soft knees. Belly hangs. Sway if it helps.",
    when: "Early labor, or anytime standing feels better than sitting.",
    image: publicAsset("/positions/forward-lean.jpg"),
  },
  "birth-ball": {
    name: "Birth ball",
    what: "Sit tall on the ball, feet flat and wide. Small circles between waves.",
    when: "Early labor while you still want rhythm. Stop if it makes you dizzy.",
    image: publicAsset("/positions/birth-ball.jpg"),
  },
  "hands-knees": {
    name: "Hands and knees",
    what: "Hands under shoulders, knees wide, long spine. Rock or stay still through the wave.",
    when: "Back labor, or when you want room for the baby to turn.",
    image: publicAsset("/positions/hands-knees.jpg"),
  },
  "kneeling-lean": {
    name: "Kneeling lean on bed",
    what: "Kneel on a pad, fold the upper body onto the mattress, let the hips get heavy.",
    when: "Active labor when standing is too much but you still want to be upright-ish.",
    image: publicAsset("/positions/kneeling-lean.jpg"),
  },
  "side-lying": {
    name: "Side-lying rest",
    what: "On your side, pillow or peanut between the knees, top knee a little forward.",
    when: "Between stacked waves, overnight, or with an epidural.",
    image: publicAsset("/positions/side-lying.jpg"),
  },
  "supported-squat": {
    name: "Supported squat",
    what: "Heels down if you can, knees open, hold a partner or bed rail. Do not bounce.",
    when: "Later first stage and pushing if legs feel strong and baby is low.",
    image: publicAsset("/positions/supported-squat.jpg"),
  },
};

export const SIDE_LYING_PUSH_WHEN =
  "Between pushes, or pushing on the side if squat is too much.";

export const POSITIONS_BY_STAGE: Record<StageHeaderId, GuidePositionId[]> = {
  early: ["forward-lean", "birth-ball"],
  active: ["forward-lean", "hands-knees", "kneeling-lean"],
  transition: ["hands-knees", "kneeling-lean", "side-lying"],
  pushing: ["supported-squat", "side-lying"],
};

export const TAKE_CHARGE_LINE = "Look at me. Blow out. Again.";
export const CANT_BREATHE_LINE = "Drop shoulders. This wave will end.";
export const STACKING_LINE = "Light on the peak. Don’t push.";
export const PEAK_STAY = "This is the top. Stay.";

export const FLAG_LABEL: Record<FlagType, string> = {
  water: "Water broke",
  mucus: "Mucus / bloody show",
  bleeding: "Bright red bleeding",
  reduced_movement: "Reduced movement",
  vomiting: "Vomiting",
  epidural: "Epidural placed",
  pitocin: "Pitocin started",
  wrong: "Something feels wrong",
};

export type PositionCard = {
  id: string;
  name: string;
  why: string;
  bestWhen: string;
  partnerJob: string;
  cue: string;
  hideWalk: boolean;
  hideSquat: boolean;
  epiduralOk: boolean;
  stages: SuggestedStage[];
};

export const POSITIONS: PositionCard[] = [
  {
    id: "walk",
    name: "Walk / sway",
    why: "Upright change helps the first stage.",
    bestWhen: "Early labor, restless, waiting.",
    partnerJob: "Walk beside her. Carry water. Time.",
    cue: "Slow walk. Sway through it.",
    hideWalk: true,
    hideSquat: false,
    epiduralOk: false,
    stages: ["early", "irregular", "need-more"],
  },
  {
    id: "dance",
    name: "Slow dance",
    why: "Swaying keeps hips open and soft.",
    bestWhen: "Active waves, needs rhythm.",
    partnerJob: "Hold her. Match her sway. Quiet.",
    cue: "Sway with me. Slow.",
    hideWalk: true,
    hideSquat: false,
    epiduralOk: false,
    stages: ["early", "active"],
  },
  {
    id: "lean",
    name: "Lean on counter / wall / ball",
    why: "Forward lean takes weight off the back.",
    bestWhen: "Back labor, standing rest.",
    partnerJob: "Hip squeeze or counterpressure. Steady.",
    cue: "Lean forward. Let the belly hang.",
    hideWalk: false,
    hideSquat: false,
    epiduralOk: true,
    stages: ["early", "active", "transition"],
  },
  {
    id: "hands-knees",
    name: "Hands and knees",
    why: "Hands and knees eases backache more.",
    bestWhen: "Back labor, restless pelvis.",
    partnerJob: "Counterpressure on the sacrum. Heat or ice.",
    cue: "Hands and knees. Hips high.",
    hideWalk: false,
    hideSquat: false,
    epiduralOk: true,
    stages: ["active", "early", "transition"],
  },
  {
    id: "lunge",
    name: "Open-knee lunge",
    why: "Opens one side of the pelvis.",
    bestWhen: "Waves organizing, hips tight.",
    partnerJob: "Spot the knee. Do not rush her.",
    cue: "Open the knee. Rest between.",
    hideWalk: true,
    hideSquat: false,
    epiduralOk: false,
    stages: ["early", "active"],
  },
  {
    id: "backward",
    name: "Sit backward on chair / toilet",
    why: "Toilet sitting uses gravity and privacy.",
    bestWhen: "Active labor, needs a rest upright.",
    partnerJob: "Stay close. Run the timer. Water.",
    cue: "Sit backward. Let the belly drop.",
    hideWalk: false,
    hideSquat: false,
    epiduralOk: true,
    stages: ["early", "active"],
  },
  {
    id: "side",
    name: "Side-lying",
    why: "Side-lying rests you between hard waves.",
    bestWhen: "Need sleep, epidural, long labor.",
    partnerJob: "Pillow the top knee. Hands off if she wants.",
    cue: "Side rest. Soft jaw.",
    hideWalk: false,
    hideSquat: false,
    epiduralOk: true,
    stages: ["early", "active", "transition", "irregular"],
  },
  {
    id: "peanut",
    name: "Side-lying + peanut ball",
    why: "Peanut ball plus side changes can shorten first stage.",
    bestWhen: "Epidural, bed rest, long first stage.",
    partnerJob: "Change sides every 30–90 minutes.",
    cue: "Peanut between knees. Rest.",
    hideWalk: false,
    hideSquat: false,
    epiduralOk: true,
    stages: ["active", "early", "transition"],
  },
  {
    id: "squat",
    name: "Supported squat / stool",
    why: "Squat in short bursts with a true urge.",
    bestWhen: "Second stage, with the urge, supported.",
    partnerJob: "Hold her. Count the out-breath. Watch knees.",
    cue: "Short squat. Rest on the dip.",
    hideWalk: false,
    hideSquat: true,
    epiduralOk: false,
    stages: ["transition"],
  },
  {
    id: "semisit",
    name: "Semi-sit in bed",
    why: "Flat on the back is for checks, not a plan.",
    bestWhen: "Cervical checks, monitoring, brief rest.",
    partnerJob: "Ask to change as soon as the check ends.",
    cue: "This is for a check. Then move.",
    hideWalk: false,
    hideSquat: false,
    epiduralOk: true,
    stages: ["active", "transition"],
  },
];

export const HANDS_ON = {
  counterpressure: {
    name: "Counterpressure",
    how: "Fist or heel on the spot she points to. Other hand on the front hip. Steady the whole wave.",
  },
  hip: {
    name: "Double hip squeeze",
    how: "She leans forward. Squeeze the fleshiest hips in and slightly up. Hold through the peak.",
  },
  knee: {
    name: "Knee press",
    how: "She sits. Press knees toward the hip sockets on the wave.",
  },
  heat: {
    name: "Heat or cold",
    how: "Low back or belly. Ice for back labor. Ask once, then stop asking.",
  },
  shower: {
    name: "Shower on the low back",
    how: "Water on the low back. Partner stays dry and runs the timer.",
  },
};

export const BAG_REVISION = 3;

export function defaultBagSections(): BagSection[] {
  return [
    { id: "mom", label: "Mom" },
    { id: "dad", label: "Dad" },
    { id: "baby", label: "Baby" },
    { id: "optional", label: "Optional" },
    { id: "outside", label: "Outside the bag" },
  ];
}

export function defaultBags(): BagItem[] {
  const row = (list: string, label: string): BagItem => ({
    id: `bag-${list}-${slugBag(label)}`,
    list,
    label,
    done: false,
  });
  return [
    row("mom", "Photo ID & insurance card"),
    row("mom", "10-ft phone charger"),
    row("mom", "Toiletries (shampoo, toothbrush, toothpaste, deodorant)"),
    row("mom", "Hair ties / claw clip"),
    row("mom", "Lip balm"),
    row("mom", "Portable fan"),
    row("mom", "Reusable water bottle"),
    row("mom", "2 nursing bras"),
    row("mom", "2 nursing tops (one for going home)"),
    row("mom", "Robe"),
    row("mom", "Pajamas"),
    row("mom", "2–3 pairs of underwear"),
    row("mom", "1–2 pairs of socks"),
    row("mom", "Slippers or slides"),
    row("mom", "Going-home leggings"),
    row("dad", "Photo ID & wallet / card"),
    row("dad", "Phone charger"),
    row("dad", "Change of clothes (1–2 days)"),
    row("dad", "Toiletries (toothbrush, deodorant)"),
    row("dad", "Comfortable shoes"),
    row("dad", "Snacks and drinks"),
    row("dad", "Reusable water bottle"),
    row("dad", "Pillow & blanket"),
    row("baby", "1 outfit (0–3 months)"),
    row("baby", "2 newborn sleepers / onesies"),
    row("baby", "Going-home outfit"),
    row("baby", "1 swaddle blanket"),
    row("baby", "1–2 burp cloths"),
    row("optional", "Nipple cream"),
    row("optional", "Nursing pads"),
    row("outside", "Install rear-facing car seat"),
  ];
}

export const BAG_SUGGESTIONS: { list: string; label: string }[] = [
  { list: "mom", label: "glasses / contacts" },
  { list: "mom", label: "snacks" },
  { list: "mom", label: "birth-plan copies" },
  { list: "mom", label: "hairbrush" },
  { list: "mom", label: "going-home bra" },
  { list: "dad", label: "hoodie / extra layer" },
  { list: "dad", label: "own medication" },
  { list: "dad", label: "book or headphones" },
  { list: "dad", label: "parking payment" },
  { list: "baby", label: "hat" },
  { list: "baby", label: "mittens" },
  { list: "baby", label: "extra onesie" },
  { list: "baby", label: "newborn diapers" },
  { list: "baby", label: "wipes" },
  { list: "outside", label: "gas tank full" },
  { list: "outside", label: "hospital route pinned" },
  { list: "outside", label: "pediatrician phone" },
  { list: "outside", label: "car-seat base checked" },
];

export function slugBag(label: string): string {
  return label
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function migrateBagState(
  bags: BagItem[] | undefined,
  sections: BagSection[] | undefined,
  revision: number | undefined,
): { bags: BagItem[]; bagSections: BagSection[]; bagRevision: number } {
  if (revision === BAG_REVISION && sections && sections.length > 0 && bags) {
    return { bags, bagSections: sections, bagRevision: revision };
  }
  return {
    bags: defaultBags(),
    bagSections: defaultBagSections(),
    bagRevision: BAG_REVISION,
  };
}

export function midWaveLine(opts: {
  phase: WavePhase;
  role: Role;
  takeCharge: boolean;
  cantBreathe: boolean;
  stacking: boolean;
  pinnedCue: string | null;
  pattern: BreathPattern;
  pushMode: boolean;
}): string {
  if (opts.cantBreathe) return CANT_BREATHE_LINE;
  if (opts.takeCharge) return TAKE_CHARGE_LINE;
  if (opts.pinnedCue) return opts.pinnedCue;
  if (opts.stacking && opts.phase === "peak") return STACKING_LINE;
  if (opts.pattern === "light-blow" && opts.phase === "peak") {
    return "Pant pant blow. Don’t push.";
  }
  if (opts.pushMode && opts.pattern === "breath-down") {
    if (opts.phase === "peak") return "Push on the peak. Breathe in the dip.";
    if (opts.phase === "rise") return "Wait for the peak.";
  }
  const pair = PHASE_LINE[opts.phase];
  if (opts.role === "partner") return pair.partner;
  return pair.birthing;
}

export const R3 = ["Relaxation", "Rhythm", "Ritual"] as const;

export const PARTNER_ONCE = [
  "Protect her pattern.",
  "No questions on a wave.",
  "Match her volume.",
  "One job per wave: time, breathe, or press.",
  "Ask once — Pressure / Light / None — then stop.",
  "Eat, drink, pee.",
];

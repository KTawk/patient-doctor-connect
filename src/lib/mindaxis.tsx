import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";

export const PHQ9_ITEMS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself or that you are a failure",
  "Trouble concentrating",
  "Moving or speaking slowly, or being restless",
  "Thoughts that you would be better off asleep and not waking, or hurting yourself",
];

export const GAD7_ITEMS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen",
];

const FREQ = ["Not at all", "Several days", "More than half the days", "Nearly every day"];

type Tone = "ok" | "warn" | "bad" | "info";
type Band = { label: string; tone: Tone };

export function phq9Band(s: number): Band {
  if (s <= 4) return { label: "Minimal", tone: "ok" };
  if (s <= 9) return { label: "Mild", tone: "ok" };
  if (s <= 14) return { label: "Moderate", tone: "warn" };
  if (s <= 19) return { label: "Moderately severe", tone: "bad" };
  return { label: "Severe", tone: "bad" };
}
export function gad7Band(s: number): Band {
  if (s <= 4) return { label: "Minimal", tone: "ok" };
  if (s <= 9) return { label: "Mild", tone: "ok" };
  if (s <= 14) return { label: "Moderate", tone: "warn" };
  return { label: "Severe", tone: "bad" };
}

export const SOFIA_PHQ9 = [2, 2, 2, 2, 2, 2, 2, 1, 1];
export const SOFIA_GAD7 = [2, 2, 2, 2, 2, 2, 1];

const toneClasses: Record<Tone, string> = {
  ok: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warn: "bg-amber-50 text-amber-700 border-amber-200",
  bad: "bg-rose-50 text-rose-700 border-rose-200",
  info: "bg-indigo-50 text-indigo-700 border-indigo-200",
};
const dotColor: Record<string, string> = { ok: "bg-emerald-400", warn: "bg-amber-400", bad: "bg-rose-500" };

export function Pill({ tone = "info", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${toneClasses[tone]}`}>{children}</span>
  );
}

export function Card({ title, right, children, accent = "border-slate-200" }: { title?: React.ReactNode; right?: React.ReactNode; children: React.ReactNode; accent?: string }) {
  return (
    <div className={`rounded-2xl border ${accent} bg-white p-5 shadow-sm`}>
      {(title || right) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {title && <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h3>}
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

function ScoreTile({ name, score, max, band }: { name: string; score: number; max: number; band: Band }) {
  return (
    <div className={`rounded-xl border p-3 ${toneClasses[band.tone]}`}>
      <div className="text-xs font-semibold uppercase tracking-wide opacity-80">{name}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-3xl font-extrabold leading-none">{score}</span>
        <span className="text-sm font-medium opacity-70">/ {max}</span>
      </div>
      <div className="mt-1 text-xs font-semibold">{band.label}</div>
    </div>
  );
}

function TrendChart({ series }: { series: { name: string; color: string; labels: string[]; points: number[] }[] }) {
  const W = 520, H = 180, pad = 30, maxY = 27;
  const xs = series[0].points.length;
  const x = (i: number) => pad + (i * (W - pad * 2)) / (xs - 1);
  const y = (v: number) => H - pad - (v / maxY) * (H - pad * 2);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0, 9, 18, 27].map((g) => (
        <g key={g}>
          <line x1={pad} y1={y(g)} x2={W - pad} y2={y(g)} stroke="#e2e8f0" strokeWidth="1" />
          <text x={4} y={y(g) + 4} fontSize="10" fill="#94a3b8">{g}</text>
        </g>
      ))}
      {series[0].labels.map((lab, i) => (
        <text key={lab} x={x(i)} y={H - 8} fontSize="10" fill="#64748b" textAnchor="middle">{lab}</text>
      ))}
      {series.map((s) => (
        <g key={s.name}>
          <polyline fill="none" stroke={s.color} strokeWidth="2.5" points={s.points.map((p, i) => `${x(i)},${y(p)}`).join(" ")} />
          {s.points.map((p, i) => (<circle key={i} cx={x(i)} cy={y(p)} r="3.5" fill={s.color} />))}
        </g>
      ))}
    </svg>
  );
}

function AvatarFace({ speaking }: { speaking: boolean }) {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    const t = setInterval(() => { setBlink(true); setTimeout(() => setBlink(false), 150); }, 3200);
    return () => clearInterval(t);
  }, []);
  return (
    <svg viewBox="0 0 96 100" className="h-16 w-16 shrink-0">
      <circle cx="48" cy="48" r="46" fill="#eef2ff" stroke="#c7d2fe" strokeWidth="2" />
      <circle cx="48" cy="42" r="22" fill="#6366f1" />
      <g fill="#ffffff">
        <ellipse cx="40" cy="40" rx="3" ry={blink ? 0.6 : 3} />
        <ellipse cx="56" cy="40" rx="3" ry={blink ? 0.6 : 3} />
      </g>
      <rect x="42" y="49" width="12" height={speaking ? 5 : 2} rx="2" fill="#ffffff">
        {speaking && <animate attributeName="height" values="2;6;2" dur="0.45s" repeatCount="indefinite" />}
      </rect>
      <path d="M22 96 a26 22 0 0 1 52 0 z" fill="#6366f1" />
    </svg>
  );
}

type Chip = { key?: string; label: string; tone?: Tone };

function AvatarChat({ title, lines, chips, onDone, doneLabel = "Continue" }: { title: string; lines: string[]; chips?: Chip[]; onDone: (c?: Chip) => void; doneLabel?: string }) {
  const [i, setI] = useState(0);
  const [voice, setVoice] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const current = lines[i];
  const last = i >= lines.length - 1;

  useEffect(() => {
    if (!current) return;
    const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
    if (voice && synth) {
      try {
        synth.cancel();
        const u = new SpeechSynthesisUtterance(current);
        u.rate = 1; u.pitch = 1.05;
        u.onstart = () => setSpeaking(true);
        u.onend = () => setSpeaking(false);
        synth.speak(u);
      } catch (e) { /* voice unavailable */ }
    }
    return () => { try { synth && synth.cancel(); } catch (e) {} setSpeaking(false); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, voice]);

  return (
    <Card accent="border-indigo-200">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h3>
        <div className="flex gap-2">
          <button onClick={() => setVoice((v) => !v)} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500 hover:bg-slate-200">
            {voice ? "Voice on" : "Voice off"}
          </button>
          <button onClick={() => onDone()} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-400 hover:bg-slate-200">Skip</button>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <AvatarFace speaking={speaking} />
        <div className="flex-1">
          <div className="text-xs font-semibold text-indigo-600">Axis, your check-in guide</div>
          <p className="mt-1 rounded-2xl rounded-tl-sm bg-indigo-50 p-3 text-slate-800">{current}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {!last ? (
              <button onClick={() => setI(i + 1)} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700">Continue</button>
            ) : chips ? (
              chips.map((c) => (
                <button key={c.label} onClick={() => onDone(c)}
                  className={`rounded-full border px-3 py-1.5 text-left text-sm font-semibold ${c.tone ? toneClasses[c.tone] : "border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50"}`}>
                  {c.label}
                </button>
              ))
            ) : (
              <button onClick={() => onDone()} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700">{doneLabel}</button>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-400">Axis is supportive, not therapeutic. It never diagnoses or manages crisis. Safety routes to your physician.</p>
        </div>
      </div>
    </Card>
  );
}

const SOFIA = {
  name: "Sofia M.", age: 34, reason: "stress and poor sleep",
  concern: "I feel overwhelmed, cannot sleep, and I am crying more.",
  goal: "Sleep six hours a night and return to work reliably.",
  meds: "Past sertraline stopped due to GI side effects (nausea).",
  sleep: "Sleep onset about 90 min; wakes 3 times nightly.",
  family: [
    { who: "Partner", note: "Supportive, works shifts", tone: "ok" as Tone },
    { who: "2 children (6, 9)", note: "Primary caregiver", tone: "warn" as Tone },
    { who: "Mother", note: "Eldercare responsibility", tone: "warn" as Tone },
    { who: "Work", note: "Recent layoffs, high load", tone: "bad" as Tone },
  ],
};

const RISK_FACTORS = [
  { name: "Family history of mood disorders", find: "Mother treated for depression; maternal aunt with bipolar II disorder", src: "narrative", tone: "warn" as Tone },
  { name: "Past or current substance use", find: "Alcohol 8 to 10 drinks per week; no tobacco or other substances", src: "structured", tone: "warn" as Tone },
  { name: "Social support", find: "Supportive partner on shift work; high caregiver load, limited respite", src: "narrative", tone: "warn" as Tone },
  { name: "Cardiometabolic health", find: "BMI 31, BP 138 over 88, HbA1c 5.9 percent (pre-diabetes range)", src: "structured", tone: "bad" as Tone },
  { name: "Recent adverse life events", find: "Job insecurity after layoffs; financial strain over the past 3 months", src: "narrative", tone: "warn" as Tone },
];

const MACI = {
  score: 72, max: 100, band: "Elevated", tone: "bad" as Tone,
  contributors: [
    { label: "Validated symptom severity (PHQ-9, GAD-7)", pct: 58 },
    { label: "Cardiometabolic and substance signals (structured EMR)", pct: 20 },
    { label: "Family history and social context (narrative intake)", pct: 14 },
    { label: "Sleep and circadian disruption", pct: 8 },
  ],
};

const RECS = [
  { text: "Moderately severe depression: offer a high intensity psychological therapy or an antidepressant. Given prior sertraline GI intolerance, consider an alternative SSRI or SNRI with shared decision making.", cite: "NICE NG222" },
  { text: "Moderate anxiety: step up from low intensity support to individual CBT or applied relaxation. Consider an SSRI if the patient prefers medication.", cite: "NICE CG113" },
  { text: "Insomnia: offer CBT-I as first line and avoid routine hypnotic prescribing; reserve short term hypnotics for selected cases only.", cite: "AAFP 2024" },
  { text: "Confirm safety today, document a safety plan, and reassess risk at each contact. Escalate if active ideation, plan, or intent emerges.", cite: "Columbia C-SSRS" },
  { text: "Set a 2 week tolerability check and a 4 to 6 week response review. Adjust treatment or refer if response is inadequate.", cite: "CANMAT 2023" },
];

const CONV = {
  intro: {
    title: "Pre-visit, meet Axis first",
    lines: [
      "Hi Sofia, I am Axis. I will help you get ready for your visit. This takes about three minutes.",
      "I am here to listen and prepare your visit. I will not diagnose you. Your physician does that.",
      "We will talk through how the last two weeks have felt, your sleep, your safety, and what you are hoping will change. Ready?",
    ],
    doneLabel: "Start my check-in",
  },
  checkin: {
    title: "Week 2 follow-up, Axis checks in",
    lines: [
      "Hi Sofia, it is Axis checking in. It has been two weeks since your visit. How have you been?",
      "How are you tolerating the plan? Any side effects, and how is your sleep?",
    ],
    chips: [
      { key: "better", label: "Sleep is improving and my mood is a little better", tone: "ok" as Tone },
      { key: "sideeffect", label: "I have had nausea and still cannot sleep", tone: "bad" as Tone },
      { key: "worse", label: "I feel much worse and quite low", tone: "bad" as Tone },
    ] as Chip[],
  },
};

const FOLLOWUP_BRANCHES: Record<string, any> = {
  better: {
    accent: "border-slate-200", tone: "ok",
    ack: "That is good to hear, Sofia. I have logged steady improvement and no new side effects. Your physician will review at the planned 4 week checkpoint.",
    badge: null,
    summaryTitle: "Review summary prepared for the physician",
    summary: ["Self reported improvement in sleep and mood", "No new side effects reported", "No safety concerns at this check-in"],
    week2: { wk: "Week 2", tone: "ok", flag: false, title: "Check-in: improving", note: "Sofia reports better sleep and slightly improved mood. Plan continued without changes." },
    later: [
      { wk: "Week 4", tone: "ok", flag: false, title: "Sustained improvement", note: "PHQ-9 9, GAD-7 7. Functioning is improving and sleep is more consolidated." },
      { wk: "Week 8", tone: "ok", flag: false, title: "Near goal", note: "PHQ-9 6, GAD-7 5. Returned to work most days; goal on track." },
    ],
    trend: { phq: [16, 12, 9, 6], gad: [13, 9, 7, 5] },
    rec: { tone: "ok", text: "Continue the current plan and CBT-I. Reassess with full PHQ-9 and GAD-7 at week 4.", cite: "NICE NG222" },
  },
  sideeffect: {
    accent: "border-rose-300", tone: "bad",
    ack: "Thank you, Sofia. I have flagged nausea and persistent insomnia for your physician and prepared a focused review summary before your next visit.",
    badge: "escalated to physician review",
    summaryTitle: "Focused review summary prepared for the physician",
    summary: ["New medication side effect: nausea", "Insomnia persists despite the plan", "Adherence maintained, no safety concerns"],
    week2: { wk: "Week 2", tone: "bad", flag: true, title: "Nausea and persistent insomnia", note: "Sofia reports nausea and ongoing insomnia. MindAxis flags this for physician review and prepares a focused summary before the next visit." },
    later: [
      { wk: "Week 4", tone: "warn", flag: false, title: "Reassessment after switch", note: "PHQ-9 11, GAD-7 8. Tolerating the alternative option; sleep slowly improving." },
      { wk: "Week 8", tone: "ok", flag: false, title: "Goal progress", note: "Residual insomnia; considering a CBT-I step up." },
    ],
    trend: { phq: [16, 15, 11, 9], gad: [13, 11, 8, 7] },
    rec: { tone: "warn", text: "Review tolerability of the current medication and consider an alternative agent. Step up CBT-I for persistent insomnia. Defer interaction checks to EMR and pharmacy systems.", cite: "NICE NG222 and AAFP 2024" },
  },
  worse: {
    accent: "border-rose-300", tone: "bad",
    ack: "I am sorry you are feeling this low, Sofia. I have prioritized this for urgent physician review and surfaced support resources for you. You do not have to manage this alone.",
    badge: "urgent review and safety pathway",
    summaryTitle: "Priority review summary prepared for the physician",
    summary: ["Self reported worsening of mood", "Reduced motivation and function", "Safety pathway re-activated for clinician confirmation"],
    week2: { wk: "Week 2", tone: "bad", flag: true, title: "Deterioration and safety re-check", note: "Sofia reports worsening mood. Routed for urgent clinician review and the safety pathway is re-activated for confirmation." },
    later: [
      { wk: "Week 4", tone: "bad", flag: false, title: "Close monitoring", note: "PHQ-9 17, GAD-7 14. Urgent review completed; treatment plan adjusted and follow-up tightened." },
      { wk: "Week 8", tone: "warn", flag: false, title: "Stabilizing", note: "PHQ-9 14, GAD-7 11. Specialist referral in progress; safety re-confirmed." },
    ],
    trend: { phq: [16, 19, 17, 14], gad: [13, 16, 14, 11] },
    rec: { tone: "bad", text: "Arrange urgent clinician review and re-assess risk with a structured tool. Consider a treatment change and specialist referral if deterioration continues.", cite: "CANMAT 2023 and Columbia C-SSRS" },
  },
};

function Likert({ items, values, setValues }: { items: string[]; values: number[]; setValues: (v: number[]) => void }) {
  return (
    <div className="space-y-2">
      {items.map((q, i) => (
        <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
          <span className="text-sm text-slate-700">{q}</span>
          <div className="flex shrink-0 gap-1">
            {FREQ.map((f, v) => (
              <button key={v} title={f} onClick={() => { const n = [...values]; n[i] = v; setValues(n); }}
                className={`h-7 w-7 rounded-md text-xs font-bold transition ${values[i] === v ? "bg-indigo-600 text-white" : "bg-white text-slate-400 ring-1 ring-slate-200 hover:ring-indigo-300"}`}>
                {v}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Intake({ phq, setPhq, gad, setGad, phqScore, gadScore, passiveIdeation, onSubmit }: any) {
  const [intro, setIntro] = useState(true);
  if (intro) {
    return <AvatarChat title={CONV.intro.title} lines={CONV.intro.lines} doneLabel={CONV.intro.doneLabel} onDone={() => setIntro(false)} />;
  }
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-5">
        <Card title="Why are you here today?">
          <p className="rounded-lg bg-slate-50 p-3 text-slate-700 italic">"{SOFIA.concern}"</p>
          <p className="mt-2 text-sm text-slate-500">Booking reason: {SOFIA.reason}</p>
        </Card>
        <Card title="Depression screen (PHQ-9)" right={<Pill tone={phq9Band(phqScore).tone}>{phqScore}, {phq9Band(phqScore).label}</Pill>}>
          <p className="mb-3 text-xs text-slate-500">Over the last 2 weeks. 0 = not at all, 3 = nearly every day. <span className="font-semibold">Tap any answer to see scoring update live.</span></p>
          <Likert items={PHQ9_ITEMS} values={phq} setValues={setPhq} />
        </Card>
        <Card title="Anxiety screen (GAD-7)" right={<Pill tone={gad7Band(gadScore).tone}>{gadScore}, {gad7Band(gadScore).label}</Pill>}>
          <Likert items={GAD7_ITEMS} values={gad} setValues={setGad} />
        </Card>
      </div>
      <div className="space-y-5">
        <Card title="Sleep">
          <p className="text-sm text-slate-700">{SOFIA.sleep}</p>
          <p className="mt-1 text-xs text-slate-500">Insomnia Severity Index (placeholder): <b>18, moderate to severe</b></p>
        </Card>
        <Card title="Safety check" accent={passiveIdeation ? "border-amber-300" : "border-slate-200"}>
          <p className="text-sm text-slate-700">PHQ-9 item 9: {passiveIdeation ? "endorsed" : "not endorsed"}.</p>
          <p className="mt-1 text-sm text-slate-700">"Passive thoughts of not wanting to wake up; <b>denies plan or intent.</b>"</p>
          {passiveIdeation && <div className="mt-2"><Pill tone="warn">Risk flag, physician must confirm</Pill></div>}
        </Card>
        <Card title="Medication history"><p className="text-sm text-slate-700">{SOFIA.meds}</p></Card>
        <Card title="Your goal in 4 weeks">
          <p className="rounded-lg bg-indigo-50 p-3 text-sm text-indigo-800 italic">"{SOFIA.goal}"</p>
        </Card>
        <button onClick={onSubmit} className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-center font-bold text-white shadow-sm transition hover:bg-indigo-700">
          Complete intake
        </button>
        <p className="text-center text-xs text-slate-400">This prepares the visit. It does not diagnose.</p>
      </div>
    </div>
  );
}

function MaciCard() {
  return (
    <Card title="MindAxis Composite Index" right={<Pill tone="info">Proprietary algorithm</Pill>} accent="border-indigo-200">
      <div className="flex items-baseline gap-3">
        <div className="text-4xl font-extrabold leading-none text-indigo-600">{MACI.score}<span className="text-base font-bold text-slate-400"> / {MACI.max}</span></div>
        <Pill tone={MACI.tone}>{MACI.band} risk</Pill>
      </div>
      <p className="mt-2 text-xs text-slate-500">Goes beyond PHQ-9 and GAD-7 alone. MACI fuses validated instruments with structured EMR signals and narrative intake into one trajectory aware risk index.</p>
      <div className="mt-3 space-y-2">
        {MACI.contributors.map((c) => (
          <div key={c.label}>
            <div className="flex justify-between text-xs font-semibold text-slate-600"><span>{c.label}</span><span>{c.pct}%</span></div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${c.pct}%` }} /></div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function FactorsCard() {
  return (
    <Card title="Top whole-person mental-health factors" right={<span className="text-xs text-slate-400">structured + narrative data</span>}>
      <div className="divide-y divide-slate-100">
        {RISK_FACTORS.map((f) => (
          <div key={f.name} className="flex items-start justify-between gap-3 py-2.5">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <span className={`h-2.5 w-2.5 rounded-full ${dotColor[f.tone]}`} /> {f.name}
              </div>
              <div className="mt-0.5 text-sm text-slate-500">{f.find}</div>
            </div>
            <span className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${f.src === "structured" ? "border-cyan-200 bg-cyan-50 text-cyan-700" : "border-purple-200 bg-purple-50 text-purple-700"}`}>
              {f.src === "structured" ? "Structured EMR" : "Narrative intake"}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function RecommendationsCard() {
  return (
    <Card title="Guideline-based recommendations" right={<Pill tone="info">cited</Pill>}>
      <div className="space-y-2">
        {RECS.map((r) => (
          <div key={r.cite + r.text.slice(0, 8)} className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
            <span className="flex-1 text-sm text-slate-700">{r.text}</span>
            <span className="shrink-0 rounded-md border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[11px] font-extrabold text-indigo-700">{r.cite}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ReasoningCard({ title, tone, purpose, steps }: { title: string; tone: Tone; purpose: string; steps: string[] }) {
  return (
    <div className={`rounded-xl border p-4 ${toneClasses[tone]}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-bold">{title}</h4>
        <Pill tone={tone}>{tone === "bad" ? "priority" : tone === "warn" ? "review" : "monitor"}</Pill>
      </div>
      <p className="mt-1 text-xs opacity-80">{purpose}</p>
      <ul className="mt-2 list-disc space-y-0.5 pl-4 text-sm">{steps.map((s) => <li key={s}>{s}</li>)}</ul>
    </div>
  );
}

export function Dashboard({ phqScore, gadScore, safetyConfirmed, setSafetyConfirmed, onCarePlan }: any) {
  const actions = ["Generate visit note", "Create care plan", "Start follow-up check-ins", "Prepare referral", "Prepare work form", "Send patient resources"];
  return (
    <div className="space-y-5">
      <Card accent="border-indigo-200">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{SOFIA.name}, {SOFIA.age}, Mental Health Visit</h2>
            <p className="text-sm text-slate-500">Main concern: anxiety, low mood, insomnia. Goal: "{SOFIA.goal}"</p>
          </div>
          <Pill tone="info">60 second clinical view</Pill>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ScoreTile name="PHQ-9" score={phqScore} max={27} band={phq9Band(phqScore)} />
          <ScoreTile name="GAD-7" score={gadScore} max={21} band={gad7Band(gadScore)} />
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-700">
            <div className="text-xs font-semibold uppercase tracking-wide opacity-80">Sleep</div>
            <div className="mt-1 text-sm font-bold">Onset 90 min</div>
            <div className="text-xs">Wakes 3x nightly</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Function</div>
            <div className="mt-1 text-sm font-bold text-slate-700">3 days missed</div>
            <div className="text-xs text-slate-500">Parenting strain</div>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2"><MaciCard /><FactorsCard /></div>

      <div className={`rounded-2xl border-2 p-5 ${safetyConfirmed ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50"}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 font-extrabold text-slate-900">
              <span>Safety pathway</span>
              {safetyConfirmed ? <Pill tone="ok">confirmed by clinician</Pill> : <Pill tone="bad">requires confirmation</Pill>}
            </h3>
            <p className="mt-1 text-sm text-slate-700">Passive death wish (PHQ-9 item 9). <b>Denies plan or intent.</b> The platform will not enter this in the note until the physician confirms.</p>
          </div>
          {!safetyConfirmed ? (
            <button onClick={() => setSafetyConfirmed(true)} className="rounded-xl bg-rose-600 px-4 py-2 font-bold text-white hover:bg-rose-700">Physician confirm risk flag</button>
          ) : (
            <span className="text-sm font-semibold text-emerald-700">Confirmed. Added to clinical note with audit trail.</span>
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Clinical reasoning cards</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <ReasoningCard title="Depression pathway" tone="bad" purpose="Stepped and matched treatment planning." steps={["Moderately severe (PHQ-9 16)", "Prior sertraline GI intolerance, avoid re-challenge", "Discuss patient preference and functional impact"]} />
          <ReasoningCard title="Anxiety pathway" tone="warn" purpose="Stepped care for GAD." steps={["Moderate (GAD-7 13)", "Low intensity CBT or applied relaxation", "Active monitoring plus resources"]} />
          <ReasoningCard title="Sleep pathway" tone="warn" purpose="Prevent reflexive sedative prescribing." steps={["Offer CBT-I as first line", "Sleep diary and stimulus control", "Caution on hypnotics"]} />
          <ReasoningCard title="Medication follow-up" tone="info" purpose="Track response, adherence, side effects." steps={["Past sertraline caused nausea", "Set a 1 to 2 week tolerance checkpoint", "Interaction checks deferred to EMR and pharmacy"]} />
        </div>
      </div>

      <RecommendationsCard />

      <Card title="Actions">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {actions.map((a) => {
            const primary = a === "Create care plan";
            return (
              <button key={a} onClick={primary ? onCarePlan : undefined}
                className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${primary ? "bg-indigo-600 text-white hover:bg-indigo-700 ring-2 ring-indigo-300" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                {a}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function DocRow({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
      <div>
        <div className="font-semibold text-slate-700">{label}</div>
        <div className="text-xs text-slate-500">{detail}</div>
      </div>
      <span className="text-xs font-semibold text-indigo-600">draft ready</span>
    </div>
  );
}

export function CarePlanScreen({ onFollowup }: { onFollowup?: () => void }) {
  const [gen, setGen] = useState(false);
  return (
    <div className="space-y-5">
      <Card accent="border-indigo-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Shared care plan</h2>
            <p className="text-sm text-slate-500">Generated for {SOFIA.name}, physician reviewed before sending</p>
          </div>
          {!gen && (
            <button onClick={() => setGen(true)} className="rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-700">Generate care plan</button>
          )}
        </div>
      </Card>

      {!gen ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center text-slate-400">
          Click <b>Generate care plan</b> to draft the plan, resources, referral, and work note.
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card title="Plain language plan (for Sofia)">
            <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
              <li>Start <b>CBT-I</b> for sleep. We will share a guided program and a sleep diary.</li>
              <li>Begin low intensity anxiety support and applied relaxation resources.</li>
              <li>Given past nausea with sertraline, we will <b>choose a different option</b> and review together.</li>
              <li>We will check in at 48 hours, 1 week, and 2 weeks to see how you feel and tolerate treatment.</li>
              <li>Your goal: sleep about 6 hours and return to work reliably. We will track this.</li>
            </ol>
          </Card>
          <Card title="Auto-drafted documents" right={<Pill tone="info">awaiting physician sign-off</Pill>}>
            <div className="space-y-2 text-sm">
              <DocRow label="Psychiatry or therapy referral" detail="CBT plus medication review" />
              <DocRow label="Work accommodation note" detail="Reduced hours, 2 weeks" />
              <DocRow label="CBT-I resource pack" detail="Sleep program and diary" />
              <DocRow label="Anxiety resource pack" detail="Applied relaxation" />
            </div>
          </Card>
          <Card title="Follow-up schedule (auto-started)">
            <ul className="space-y-1 text-sm text-slate-700">
              <li>48h: "Do you understand your plan?"</li>
              <li>1 week: side effects, adherence, sleep, safety</li>
              <li>2 weeks: PHQ-2 or GAD-2 plus medication tolerance</li>
              <li>4 weeks: full PHQ-9 and GAD-7 reassessment</li>
            </ul>
          </Card>
          {onFollowup && (
            <div className="flex items-end">
              <button onClick={onFollowup} className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white hover:bg-indigo-700">Start the journey, see follow-up</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function FollowUp() {
  const [checkin, setCheckin] = useState(true);
  const [reportedKey, setReportedKey] = useState<string | null>(null);
  const [reportedLabel, setReportedLabel] = useState<string | null>(null);

  if (checkin) {
    return (
      <AvatarChat
        title={CONV.checkin.title} lines={CONV.checkin.lines} chips={CONV.checkin.chips}
        onDone={(c) => {
          if (c && c.key) { setReportedKey(c.key); setReportedLabel(c.label); }
          else { setReportedKey("sideeffect"); setReportedLabel(CONV.checkin.chips[1].label); }
          setCheckin(false);
        }}
      />
    );
  }

  const branch = FOLLOWUP_BRANCHES[reportedKey || "sideeffect"];
  const timeline = [
    { wk: "48h", tone: "ok", flag: false, title: "Plan understood", note: "Sofia confirmed she understands the plan. Resources opened." },
    { wk: "Week 1", tone: "ok", flag: false, title: "Early check-in", note: "Adherence good. No safety concerns reported." },
    branch.week2,
  ].concat(branch.later);
  const series = [
    { name: "PHQ-9", color: "#4f46e5", labels: ["Wk0", "Wk2", "Wk4", "Wk8"], points: branch.trend.phq },
    { name: "GAD-7", color: "#0d9488", labels: ["Wk0", "Wk2", "Wk4", "Wk8"], points: branch.trend.gad },
  ];

  return (
    <div className="space-y-5">
      <Card accent={branch.accent}>
        <div className="flex items-start gap-3">
          <AvatarFace speaking={false} />
          <div className="flex-1">
            <div className="text-xs font-semibold text-indigo-600">Axis</div>
            <p className="mt-0.5 text-xs text-slate-500">Patient replied: "{reportedLabel}"</p>
            <p className="mt-1.5 text-sm text-slate-700">{branch.ack}</p>
            <div className="mt-2">{branch.badge ? <Pill tone="bad">{branch.badge}</Pill> : <Pill tone="ok">on track, routine review</Pill>}</div>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <Card title="Longitudinal narrative arc">
            <ol className="relative ml-3 border-l-2 border-slate-200">
              {timeline.map((t: any) => (
                <li key={t.wk + t.title} className="mb-4 ml-4">
                  <div className={`absolute -left-[9px] mt-1 h-4 w-4 rounded-full border-2 border-white ${dotColor[t.tone]}`} />
                  <div className={`rounded-xl border p-3 ${t.flag ? "border-rose-300 bg-rose-50 shadow-sm" : "border-slate-100 bg-white"}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{t.wk}, {t.title}</span>
                      {t.flag && <Pill tone="bad">needs review</Pill>}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{t.note}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
        <div className="space-y-5">
          <Card title={branch.summaryTitle}>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {branch.summary.map((s: string) => <li key={s}>{s}</li>)}
            </ul>
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
              <span className="flex-1 text-sm text-slate-700">{branch.rec.text}</span>
              <span className="shrink-0 rounded-md border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[11px] font-extrabold text-indigo-700">{branch.rec.cite}</span>
            </div>
          </Card>
          <Card title="Symptom trajectory">
            <TrendChart series={series} />
            <div className="mt-2 flex gap-4 text-xs">
              <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-indigo-600" /> PHQ-9</span>
              <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-teal-600" /> GAD-7</span>
            </div>
          </Card>
          <Card title="Family and caregiving map">
            <div className="grid grid-cols-2 gap-2">
              {SOFIA.family.map((f) => (
                <div key={f.who} className={`rounded-lg border p-2 text-xs ${toneClasses[f.tone]}`}>
                  <div className="font-bold">{f.who}</div>
                  <div className="opacity-80">{f.note}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="flex justify-center">
        <button onClick={() => { setCheckin(true); setReportedKey(null); setReportedLabel(null); }}
          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-200">
          Replay check-in with a different answer
        </button>
      </div>
    </div>
  );
}

const FHIR_MAP: [string, string][] = [
  ["Patient profile", "Patient"],
  ["Pre-visit questionnaire", "Questionnaire / QuestionnaireResponse"],
  ["PHQ-9, GAD-7, sleep scores", "Observation"],
  ["Diagnosis or problem", "Condition"],
  ["Medication history", "MedicationRequest"],
  ["Care plan", "CarePlan"],
  ["Referral", "ServiceRequest"],
  ["Visit note", "DocumentReference"],
  ["Family or caregiver", "RelatedPerson"],
  ["Appointment", "Appointment"],
];

const SAMPLE_BUNDLE = `{
  "resourceType": "Observation",
  "status": "final",
  "code": { "text": "PHQ-9 total score" },
  "subject": { "reference": "Patient/sofia-m" },
  "valueQuantity": { "value": 16, "unit": "score" },
  "interpretation": [{ "text": "Moderately severe" }]
}`;

export function FhirScreen() {
  const [exported, setExported] = useState(false);
  const steps = [
    "EMR launches the SMART app (OAuth2 context)",
    "App reads Patient and prior Observations",
    "Intake maps to QuestionnaireResponse",
    "Scores map to Observation",
    "Plan maps to CarePlan, referral to ServiceRequest",
    "Note written back as DocumentReference",
  ];
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card title="SMART on FHIR launch model">
        <p className="text-sm text-slate-600">
          MindAxis 360 launches <b>inside the EMR</b> as a SMART app and exchanges structured data with the clinical record.
        </p>
        <div className="mt-3 space-y-2 text-sm">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">{i + 1}</span>
              {s}
            </div>
          ))}
        </div>
        <button onClick={() => setExported(true)} className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-700">
          {exported ? "Exported to EMR (mock)" : "Export visit to EMR"}
        </button>
        {exported && <p className="mt-2 text-center text-xs text-emerald-600">10 FHIR resources written. Audit trail updated.</p>}
      </Card>
      <div className="space-y-5">
        <Card title="Platform object to FHIR resource">
          <table className="w-full text-sm">
            <tbody>
              {FHIR_MAP.map(([a, b]) => (
                <tr key={a} className="border-b border-slate-100 last:border-0">
                  <td className="py-1.5 pr-3 text-slate-600">{a}</td>
                  <td className="py-1.5 font-mono text-xs text-indigo-700">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card title="Sample resource (PHQ-9 to Observation)">
          <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-emerald-300">{SAMPLE_BUNDLE}</pre>
        </Card>
      </div>
    </div>
  );
}

const PROVIDERS = [
  { id: "drchen", name: "Dr. Amelia Chen", role: "Family Medicine" },
  { id: "drpatel", name: "Dr. Raj Patel", role: "Family Medicine, behavioural health focus" },
  { id: "drwright", name: "Dr. Lena Wright", role: "Family Medicine, sleep medicine" },
];
const REASONS = ["Mental health follow-up", "Medication review", "New concern", "Annual visit"];
const SLOTS = ["09:00", "09:30", "10:30", "11:00", "13:30", "14:00", "15:30", "16:00"];

function nextDays(n: number) {
  const out: { iso: string; day: string; date: string }[] = [];
  const d = new Date();
  for (let i = 1; i <= n; i++) {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    out.push({
      iso: x.toISOString().slice(0, 10),
      day: x.toLocaleDateString(undefined, { weekday: "short" }),
      date: x.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    });
  }
  return out;
}

export function Booking() {
  const days = useMemo(() => nextDays(10), []);
  const [provider, setProvider] = useState(PROVIDERS[0].id);
  const [reason, setReason] = useState(REASONS[0]);
  const [day, setDay] = useState(days[1].iso);
  const [slot, setSlot] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) {
    const dObj = days.find((d) => d.iso === day)!;
    const prov = PROVIDERS.find((p) => p.id === provider)!;
    return (
      <div className="mx-auto max-w-xl">
        <Card accent="border-emerald-300">
          <div className="text-center">
            <Pill tone="ok">Appointment confirmed</Pill>
            <h2 className="mt-3 text-xl font-extrabold text-slate-900">You are booked with {prov.name}</h2>
            <p className="mt-1 text-sm text-slate-600">{dObj.day}, {dObj.date} at {slot}</p>
            <p className="mt-3 text-sm text-slate-600">Reason: {reason}</p>
            <p className="mt-4 text-xs text-slate-500">Axis will reach out before your visit to help you get ready.</p>
            <button onClick={() => { setConfirmed(false); setSlot(null); }} className="mt-5 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200">
              Book another time
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-5">
        <Card title="Choose a provider">
          <div className="grid gap-2 sm:grid-cols-3">
            {PROVIDERS.map((p) => (
              <button key={p.id} onClick={() => setProvider(p.id)}
                className={`rounded-xl border p-3 text-left transition ${provider === p.id ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white hover:border-indigo-200"}`}>
                <div className="text-sm font-bold text-slate-800">{p.name}</div>
                <div className="text-xs text-slate-500">{p.role}</div>
              </button>
            ))}
          </div>
        </Card>

        <Card title="Pick a day">
          <div className="flex flex-wrap gap-2">
            {days.map((d) => (
              <button key={d.iso} onClick={() => { setDay(d.iso); setSlot(null); }}
                className={`rounded-xl border px-3 py-2 text-center transition ${day === d.iso ? "border-indigo-500 bg-indigo-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200"}`}>
                <div className="text-[11px] font-semibold uppercase opacity-80">{d.day}</div>
                <div className="text-sm font-bold">{d.date}</div>
              </button>
            ))}
          </div>
        </Card>

        <Card title="Available times">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SLOTS.map((s) => (
              <button key={s} onClick={() => setSlot(s)}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${slot === s ? "border-indigo-500 bg-indigo-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300"}`}>
                {s}
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-5">
        <Card title="Reason for visit">
          <div className="space-y-2">
            {REASONS.map((r) => (
              <label key={r} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${reason === r ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-700"}`}>
                <input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} className="accent-indigo-600" />
                {r}
              </label>
            ))}
          </div>
        </Card>

        <Card title="Summary">
          <ul className="space-y-1 text-sm text-slate-700">
            <li><span className="text-slate-500">Provider:</span> <b>{PROVIDERS.find((p) => p.id === provider)?.name}</b></li>
            <li><span className="text-slate-500">Date:</span> <b>{days.find((d) => d.iso === day)?.date}</b></li>
            <li><span className="text-slate-500">Time:</span> <b>{slot ?? "select a time"}</b></li>
            <li><span className="text-slate-500">Reason:</span> <b>{reason}</b></li>
          </ul>
          <button disabled={!slot} onClick={() => setConfirmed(true)}
            className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">
            Confirm appointment
          </button>
          <p className="mt-2 text-center text-xs text-slate-400">You can reschedule or cancel up to 24 hours before.</p>
        </Card>
      </div>
    </div>
  );
}

export function AppHeader({ role, tabs, active, setActive }: { role: "patient" | "doctor"; tabs: { key: string; label: string }[]; active: string; setActive: (k: string) => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 font-black text-white">M</div>
            <div>
              <div className="text-lg font-extrabold leading-none text-slate-900">MindAxis <span className="text-indigo-600">360</span></div>
              <div className="text-xs text-slate-500">{role === "patient" ? "Patient portal" : "Physician workspace"}</div>
            </div>
          </div>
          <Link to="/" className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200">Sign out</Link>
        </div>
        <nav className="mt-3 flex flex-wrap gap-1.5">
          {tabs.map((s) => (
            <button key={s.key} onClick={() => setActive(s.key)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${active === s.key ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {s.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function PatientApp() {
  const [tab, setTab] = useState("intake");
  const [phq, setPhq] = useState(SOFIA_PHQ9);
  const [gad, setGad] = useState(SOFIA_GAD7);
  const phqScore = useMemo(() => phq.reduce((a, b) => a + b, 0), [phq]);
  const gadScore = useMemo(() => gad.reduce((a, b) => a + b, 0), [gad]);
  const passiveIdeation = phq[8] > 0;

  const tabs = [
    { key: "intake", label: "Pre-visit intake" },
    { key: "booking", label: "Book appointment" },
    { key: "followup", label: "Follow-up check-in" },
  ];
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <AppHeader role="patient" tabs={tabs} active={tab} setActive={setTab} />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6">
        {tab === "booking" && <Booking />}
        {tab === "intake" && (
          <Intake phq={phq} setPhq={setPhq} gad={gad} setGad={setGad}
            phqScore={phqScore} gadScore={gadScore} passiveIdeation={passiveIdeation}
            onSubmit={() => setTab("followup")} />
        )}
        {tab === "followup" && <FollowUp />}
      </main>
    </div>
  );
}

export function DoctorApp() {
  const [tab, setTab] = useState("patients");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [safetyConfirmed, setSafetyConfirmed] = useState(false);
  const phqScore = SOFIA_PHQ9.reduce((a, b) => a + b, 0);
  const gadScore = SOFIA_GAD7.reduce((a, b) => a + b, 0);

  const tabs = [
    { key: "patients", label: "Patients" },
    { key: "dashboard", label: "Physician dashboard" },
    { key: "careplan", label: "Care plan" },
    { key: "followup", label: "Follow-up journey" },
    { key: "fhir", label: "EMR / FHIR" },
  ];
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <AppHeader role="doctor" tabs={tabs} active={tab} setActive={setTab} />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6">
        {tab === "patients" && (
          <PatientsList
            selectedId={selectedPatient}
            onSelect={(id) => { setSelectedPatient(id); setTab("dashboard"); }}
          />
        )}
        {tab === "dashboard" && (
          <Dashboard phqScore={phqScore} gadScore={gadScore}
            safetyConfirmed={safetyConfirmed} setSafetyConfirmed={setSafetyConfirmed}
            onCarePlan={() => setTab("careplan")} />
        )}
        {tab === "careplan" && <CarePlanScreen onFollowup={() => setTab("followup")} />}
        {tab === "followup" && <FollowUp />}
        {tab === "fhir" && <FhirScreen />}
      </main>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import axisAvatarImg from "@/assets/axis-avatar.jpg";
import { Mic } from "lucide-react";

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
type Tier = "low" | "moderate" | "high";

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

const toneClasses: Record<Tone, string> = {
  ok: "bg-secondary/20 text-secondary/90 border-secondary/30",
  warn: "bg-accent/15 text-accent-foreground border-accent/25",
  bad: "bg-destructive/10 text-destructive/90 border-destructive/20",
  info: "bg-primary/10 text-primary/90 border-primary/20",
};
const dotColor: Record<string, string> = { ok: "bg-secondary", warn: "bg-accent", bad: "bg-destructive" };

export function Pill({ tone = "info", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${toneClasses[tone]}`}>{children}</span>
  );
}

export function Card({ title, right, children, accent = "border-border" }: { title?: React.ReactNode; right?: React.ReactNode; children: React.ReactNode; accent?: string }) {
  return (
    <div className={`rounded-2xl border ${accent} bg-card p-5 shadow-sm`}>
      {(title || right) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {title && <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{title}</h3>}
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
    <Card accent="border-primary/20">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{title}</h3>
        <div className="flex gap-2">
          <button onClick={() => setVoice((v) => !v)} className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground hover:bg-border">
            {voice ? "Voice on" : "Voice off"}
          </button>
          <button onClick={() => onDone()} className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground hover:bg-border">Skip</button>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <AvatarFace speaking={speaking} />
        <div className="flex-1">
          <div className="text-xs font-semibold text-primary">Axis, your check-in guide</div>
          <p className="mt-1 rounded-2xl rounded-tl-sm bg-primary/10 p-3 text-foreground">{current}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {!last ? (
              <button onClick={() => setI(i + 1)} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90">Continue</button>
            ) : chips ? (
              chips.map((c) => (
                <button key={c.label} onClick={() => onDone(c)}
                  className={`rounded-full border px-3 py-1.5 text-left text-sm font-semibold ${c.tone ? toneClasses[c.tone] : "border-primary/20 bg-card text-primary/90 hover:bg-primary/10"}`}>
                  {c.label}
                </button>
              ))
            ) : (
              <button onClick={() => onDone()} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90">{doneLabel}</button>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Axis is supportive, not therapeutic. It never diagnoses or manages crisis. Safety routes to your physician.</p>
        </div>
      </div>
    </Card>
  );
}

type ChatTurn = { role: "avatar" | "patient"; text: string };

function InteractiveIntakeChat({
  patientName,
  phq,
  setPhq,
  gad,
  setGad,
  onComplete,
  onDecline,
}: {
  patientName: string;
  phq: number[];
  setPhq: (v: number[]) => void;
  gad: number[];
  setGad: (v: number[]) => void;
  onComplete: () => void;
  onDecline: () => void;
}) {
  const firstName = patientName.split(" ")[0] || "there";
  const greeting =
    `Hello, ${firstName}. Before we begin, please note that I cannot provide a medical diagnosis or treatment. ` +
    `If you are experiencing a medical emergency, having thoughts of harming yourself or others, or feel that you are in immediate danger, ` +
    `please call 911 or go to the nearest emergency department.\n\nHow can I help you today?`;

  const [turns, setTurns] = useState<ChatTurn[]>([{ role: "avatar", text: greeting }]);
  const [stage, setStage] = useState<"concern" | "consent" | "phq" | "gad" | "done">("concern");
  const [qIndex, setQIndex] = useState(0);
  const [input, setInput] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [voice, setVoice] = useState(true);

  const lastAvatar = useMemo(() => {
    for (let i = turns.length - 1; i >= 0; i--) if (turns[i].role === "avatar") return turns[i].text;
    return "";
  }, [turns]);

  useEffect(() => {
    if (!lastAvatar) return;
    const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
    if (voice && synth) {
      try {
        synth.cancel();
        const u = new SpeechSynthesisUtterance(lastAvatar);
        u.rate = 1; u.pitch = 1.05;
        u.onstart = () => setSpeaking(true);
        u.onend = () => setSpeaking(false);
        synth.speak(u);
      } catch (e) { /* voice unavailable */ }
    }
    return () => { try { synth && synth.cancel(); } catch (e) {} setSpeaking(false); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastAvatar, voice]);

  const sendConcern = (text: string) => {
    const concern = text.trim();
    if (!concern) return;
    const reply =
      `I'm sorry to hear that you're feeling this way, ${firstName}. ` +
      `I'd like to ask you a few questions to better understand what you're experiencing and help prepare for a healthcare appointment if needed. Is that okay?`;
    setTurns((t) => [...t, { role: "patient", text: concern }, { role: "avatar", text: reply }]);
    setStage("consent");
    setInput("");
  };

  const askPhq = (idx: number) => {
    const preamble = idx === 0
      ? `Thank you. Over the last 2 weeks, how often have you been bothered by the following?\n\n1. ${PHQ9_ITEMS[idx]}?`
      : `${idx + 1}. ${PHQ9_ITEMS[idx]}?`;
    setTurns((t) => [...t, { role: "avatar", text: preamble }]);
  };
  const askGad = (idx: number) => {
    const preamble = idx === 0
      ? `Great, just a few more. Over the last 2 weeks, how often have you been bothered by the following?\n\n1. ${GAD7_ITEMS[idx]}?`
      : `${idx + 1}. ${GAD7_ITEMS[idx]}?`;
    setTurns((t) => [...t, { role: "avatar", text: preamble }]);
  };

  const handleConsent = (yes: boolean) => {
    const label = yes ? "Sure." : "Not right now.";
    setTurns((t) => [...t, { role: "patient", text: label }]);
    if (!yes) {
      setStage("done");
      setTimeout(() => onDecline(), 450);
      return;
    }
    setStage("phq");
    setQIndex(0);
    setTimeout(() => askPhq(0), 300);
  };

  const answerFreq = (value: number) => {
    const label = FREQ[value];
    setTurns((t) => [...t, { role: "patient", text: label }]);
    if (stage === "phq") {
      const next = [...phq];
      next[qIndex] = value;
      setPhq(next);
      const nextIdx = qIndex + 1;
      if (nextIdx < PHQ9_ITEMS.length) {
        setQIndex(nextIdx);
        setTimeout(() => askPhq(nextIdx), 250);
      } else {
        setStage("gad");
        setQIndex(0);
        setTimeout(() => askGad(0), 300);
      }
    } else if (stage === "gad") {
      const next = [...gad];
      next[qIndex] = value;
      setGad(next);
      const nextIdx = qIndex + 1;
      if (nextIdx < GAD7_ITEMS.length) {
        setQIndex(nextIdx);
        setTimeout(() => askGad(nextIdx), 250);
      } else {
        setStage("done");
        setTurns((t) => [
          ...t,
          {
            role: "avatar",
            text: `Thank you, ${firstName}. I have what I need to prepare your visit. Let's get you booked with a clinician.`,
          },
        ]);
        setTimeout(() => onComplete(), 1200);
      }
    }
  };

  const concernSuggestions = ["I am feeling anxious.", "I've been feeling down.", "I'm having trouble sleeping.", "I'm stressed at work."];

  const submitText = () => {
    const value = input.trim();
    if (!value) return;
    if (stage === "concern") sendConcern(value);
    setInput("");
  };

  const startMic = () => {
    const w = typeof window !== "undefined" ? (window as any) : null;
    const SR = w?.SpeechRecognition || w?.webkitSpeechRecognition;
    if (!SR) {
      alert("Voice input isn't supported in this browser. Try Chrome or Edge.");
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      const transcript = e.results?.[0]?.[0]?.transcript ?? "";
      if (transcript) setInput((prev) => (prev ? prev + " " + transcript : transcript));
    };
    try { rec.start(); } catch (e) { /* ignore */ }
  };

  return (
    <div className="grid gap-4 md:grid-cols-[280px_1fr]">
      {/* Left: avatar identity card */}
      <Card accent="border-primary/20">
        <div className="flex flex-col items-center text-center">
          <img
            src={axisAvatarImg}
            alt="Axis assistant"
            width={320}
            height={320}
            loading="lazy"
            className="aspect-square w-full rounded-2xl object-cover"
          />
          <h3 className="mt-4 text-xl font-extrabold text-foreground">Axis assistant</h3>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <span className={`h-1.5 w-1.5 rounded-full ${speaking ? "bg-secondary" : "bg-muted-foreground"}`} />
            AI-enabled · usually replies instantly
          </p>
          <div className="mt-4 w-full rounded-xl border border-border bg-muted p-3 text-left text-xs text-foreground/70">
            <b className="text-foreground">Important.</b> Your assistant cannot provide diagnosis or treatment. In an emergency, call 911 or go to the nearest emergency department.
          </div>
          <button
            onClick={onComplete}
            className="mt-4 w-full rounded-xl border border-primary/20 bg-card px-4 py-2 text-sm font-bold text-primary/90 hover:bg-primary/10"
          >
            I'm ready for screening →
          </button>
          <p className="mt-2 text-xs text-muted-foreground">A few short questions, then book your visit.</p>
          <button
            onClick={() => setVoice((v) => !v)}
            className="mt-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            {voice ? "🔊 Voice on" : "🔇 Voice off"}
          </button>
        </div>
      </Card>

      {/* Right: chat panel */}
      <Card accent="border-primary/20">
        <div className="flex h-[28rem] flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {turns.map((t, i) => (
              <div key={i} className={t.role === "avatar" ? "flex justify-start" : "flex justify-end"}>
                <p className={
                  t.role === "avatar"
                    ? "max-w-[85%] whitespace-pre-line rounded-2xl rounded-tl-sm bg-primary/10 p-3 text-foreground"
                    : "max-w-[85%] rounded-2xl rounded-tr-sm bg-foreground p-3 text-background"
                }>{t.text}</p>
              </div>
            ))}

            {stage === "concern" && (
              <div className="flex flex-wrap gap-2 pt-1">
                {concernSuggestions.map((s) => (
                  <button key={s} onClick={() => sendConcern(s)}
                    className="rounded-full border border-primary/20 bg-card px-3 py-1.5 text-xs font-semibold text-primary/90 hover:bg-primary/10">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {stage === "consent" && (
              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <button onClick={() => handleConsent(true)}
                  className="rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground hover:bg-primary/90">
                  Sure
                </button>
                <button onClick={() => handleConsent(false)}
                  className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-semibold text-foreground/70 hover:bg-muted">
                  Not right now
                </button>
              </div>
            )}

            {(stage === "phq" || stage === "gad") && (
              <div className="space-y-2 pt-1">
                <div className="flex flex-wrap gap-2">
                  {FREQ.map((label, i) => (
                    <button
                      key={label}
                      onClick={() => answerFreq(i)}
                      className="rounded-full border border-primary/20 bg-card px-3 py-1.5 text-xs font-semibold text-primary/90 hover:bg-primary/10"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stage === "phq" ? `Question ${qIndex + 1} of ${PHQ9_ITEMS.length} (depression screen)` : `Question ${qIndex + 1} of ${GAD7_ITEMS.length} (anxiety screen)`}
                </p>
              </div>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => { e.preventDefault(); submitText(); }}
            className="mt-3 flex items-center gap-2 rounded-full border border-border bg-muted p-1.5"
          >
            <button
              type="button"
              onClick={startMic}
              aria-label="Speak"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card text-foreground/70 shadow-sm hover:bg-muted"
            >
              🎤
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={stage === "concern" ? "Type a message..." : "Use the buttons above to answer"}
              disabled={stage !== "concern"}
              className="flex-1 bg-transparent px-2 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={stage !== "concern" || !input.trim()}
              aria-label="Send"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background shadow-sm hover:bg-foreground disabled:opacity-40"
            >
              →
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}

// ---------------- Per-patient synthetic data ----------------

export type FamilyEntry = { who: string; note: string; tone: Tone };
export type RiskFactor = { name: string; find: string; src: "structured" | "narrative"; tone: Tone };
export type MaciContributor = { label: string; pct: number };
export type Rec = { text: string; cite: string };
export type Reasoning = { title: string; tone: Tone; purpose: string; steps: string[] };
export type Branch = {
  accent: string; tone: Tone; ack: string; badge: string | null;
  summaryTitle: string; summary: string[];
  week2: { wk: string; tone: string; flag: boolean; title: string; note: string };
  later: { wk: string; tone: string; flag: boolean; title: string; note: string }[];
  trend: { phq: number[]; gad: number[] };
  rec: { tone: Tone; text: string; cite: string };
};

export type PatientProfile = {
  id: string; name: string; firstName: string; age: number; reason: string;
  status: string; statusTone: Tone; next: string;
  concern: string; goal: string; meds: string; sleep: string;
  sleepShort: string; sleepDetail: string; functionShort: string; functionDetail: string;
  family: FamilyEntry[];
  phq: number[]; gad: number[];
  risk: RiskFactor[];
  maci: { score: number; max: number; band: string; tone: Tone; contributors: MaciContributor[] };
  recs: Rec[];
  reasoning: Reasoning[];
  conv: { intro: { title: string; lines: string[]; doneLabel: string }; checkin: { title: string; lines: string[]; chips: Chip[] } };
  branches: Record<string, Branch>;
  plan: { plainSteps: React.ReactNode[]; docs: { label: string; detail: string }[]; schedule: string[] };
  tier: Tier;
};

function tierFor(maci: number): Tier {
  if (maci >= 60) return "high";
  if (maci >= 30) return "moderate";
  return "low";
}

const SOFIA: PatientProfile = {
  id: "sofia", name: "Sofia M.", firstName: "Sofia", age: 34, reason: "Stress and poor sleep",
  status: "Active", statusTone: "bad", next: "Today, 10:30",
  concern: "I feel overwhelmed, cannot sleep, and I am crying more.",
  goal: "Sleep six hours a night and return to work reliably.",
  meds: "Past sertraline stopped due to GI side effects (nausea).",
  sleep: "Sleep onset about 90 min; wakes 3 times nightly.",
  sleepShort: "Onset 90 min", sleepDetail: "Wakes 3x nightly",
  functionShort: "3 days missed", functionDetail: "Parenting strain",
  family: [
    { who: "Partner", note: "Supportive, works shifts", tone: "ok" },
    { who: "2 children (6, 9)", note: "Primary caregiver", tone: "warn" },
    { who: "Mother", note: "Eldercare responsibility", tone: "warn" },
    { who: "Work", note: "Recent layoffs, high load", tone: "bad" },
  ],
  phq: [2, 2, 2, 2, 2, 2, 2, 1, 1],
  gad: [2, 2, 2, 2, 2, 2, 1],
  risk: [
    { name: "Family history of mood disorders", find: "Mother treated for depression; maternal aunt with bipolar II disorder", src: "narrative", tone: "warn" },
    { name: "Past or current substance use", find: "Alcohol 8 to 10 drinks per week; no tobacco or other substances", src: "structured", tone: "warn" },
    { name: "Social support", find: "Supportive partner on shift work; high caregiver load, limited respite", src: "narrative", tone: "warn" },
    { name: "Cardiometabolic health", find: "BMI 31, BP 138 over 88, HbA1c 5.9 percent (pre-diabetes range)", src: "structured", tone: "bad" },
    { name: "Recent adverse life events", find: "Job insecurity after layoffs; financial strain over the past 3 months", src: "narrative", tone: "warn" },
  ],
  maci: { score: 72, max: 100, band: "Elevated", tone: "bad", contributors: [
    { label: "Validated symptom severity (PHQ-9, GAD-7)", pct: 58 },
    { label: "Cardiometabolic and substance signals (structured EMR)", pct: 20 },
    { label: "Family history and social context (narrative intake)", pct: 14 },
    { label: "Sleep and circadian disruption", pct: 8 },
  ] },
  recs: [
    { text: "Moderately severe depression: offer a high intensity psychological therapy or an antidepressant. Given prior sertraline GI intolerance, consider an alternative SSRI or SNRI with shared decision making.", cite: "NICE NG222" },
    { text: "Moderate anxiety: step up from low intensity support to individual CBT or applied relaxation. Consider an SSRI if the patient prefers medication.", cite: "NICE CG113" },
    { text: "Insomnia: offer CBT-I as first line and avoid routine hypnotic prescribing; reserve short term hypnotics for selected cases only.", cite: "AAFP 2024" },
    { text: "Confirm safety today, document a safety plan, and reassess risk at each contact. Escalate if active ideation, plan, or intent emerges.", cite: "Columbia C-SSRS" },
    { text: "Set a 2 week tolerability check and a 4 to 6 week response review. Adjust treatment or refer if response is inadequate.", cite: "CANMAT 2023" },
  ],
  reasoning: [
    { title: "Depression pathway", tone: "bad", purpose: "Stepped and matched treatment planning.", steps: ["Moderately severe (PHQ-9 16)", "Prior sertraline GI intolerance, avoid re-challenge", "Discuss patient preference and functional impact"] },
    { title: "Anxiety pathway", tone: "warn", purpose: "Stepped care for GAD.", steps: ["Moderate (GAD-7 13)", "Low intensity CBT or applied relaxation", "Active monitoring plus resources"] },
    { title: "Sleep pathway", tone: "warn", purpose: "Prevent reflexive sedative prescribing.", steps: ["Offer CBT-I as first line", "Sleep diary and stimulus control", "Caution on hypnotics"] },
    { title: "Medication follow-up", tone: "info", purpose: "Track response, adherence, side effects.", steps: ["Past sertraline caused nausea", "Set a 1 to 2 week tolerance checkpoint", "Interaction checks deferred to EMR and pharmacy"] },
  ],
  conv: {
    intro: { title: "Pre-visit, meet Axis first", doneLabel: "Start my check-in", lines: [
      "Hi Sofia, I am Axis. I will help you get ready for your visit. This takes about three minutes.",
      "I am here to listen and prepare your visit. I will not diagnose you. Your physician does that.",
      "We will talk through how the last two weeks have felt, your sleep, your safety, and what you are hoping will change. Ready?",
    ] },
    checkin: { title: "Week 2 follow-up, Axis checks in", lines: [
      "Hi Sofia, it is Axis checking in. It has been two weeks since your visit. How have you been?",
      "How are you tolerating the plan? Any side effects, and how is your sleep?",
    ], chips: [
      { key: "better", label: "Sleep is improving and my mood is a little better", tone: "ok" },
      { key: "sideeffect", label: "I have had nausea and still cannot sleep", tone: "bad" },
      { key: "worse", label: "I feel much worse and quite low", tone: "bad" },
    ] },
  },
  branches: {
    better: {
      accent: "border-border", tone: "ok",
      ack: "That is good to hear, Sofia. I have logged steady improvement and no new side effects. Your physician will review at the planned 4 week checkpoint.",
      badge: null, summaryTitle: "Review summary prepared for the physician",
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
      accent: "border-destructive/30", tone: "bad",
      ack: "Thank you, Sofia. I have flagged nausea and persistent insomnia for your physician and prepared a focused review summary before your next visit.",
      badge: "escalated to physician review", summaryTitle: "Focused review summary prepared for the physician",
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
      accent: "border-destructive/30", tone: "bad",
      ack: "I am sorry you are feeling this low, Sofia. I have prioritized this for urgent physician review and surfaced support resources for you. You do not have to manage this alone.",
      badge: "urgent review and safety pathway", summaryTitle: "Priority review summary prepared for the physician",
      summary: ["Self reported worsening of mood", "Reduced motivation and function", "Safety pathway re-activated for clinician confirmation"],
      week2: { wk: "Week 2", tone: "bad", flag: true, title: "Deterioration and safety re-check", note: "Sofia reports worsening mood. Routed for urgent clinician review and the safety pathway is re-activated for confirmation." },
      later: [
        { wk: "Week 4", tone: "bad", flag: false, title: "Close monitoring", note: "PHQ-9 17, GAD-7 14. Urgent review completed; treatment plan adjusted and follow-up tightened." },
        { wk: "Week 8", tone: "warn", flag: false, title: "Stabilizing", note: "PHQ-9 14, GAD-7 11. Specialist referral in progress; safety re-confirmed." },
      ],
      trend: { phq: [16, 19, 17, 14], gad: [13, 16, 14, 11] },
      rec: { tone: "bad", text: "Arrange urgent clinician review and re-assess risk with a structured tool. Consider a treatment change and specialist referral if deterioration continues.", cite: "CANMAT 2023 and Columbia C-SSRS" },
    },
  },
  plan: {
    plainSteps: [
      <>Start <b>CBT-I</b> for sleep. We will share a guided program and a sleep diary.</>,
      <>Begin low intensity anxiety support and applied relaxation resources.</>,
      <>Given past nausea with sertraline, we will <b>choose a different option</b> and review together.</>,
      <>We will check in at 48 hours, 1 week, and 2 weeks to see how you feel and tolerate treatment.</>,
      <>Your goal: sleep about 6 hours and return to work reliably. We will track this.</>,
    ],
    docs: [
      { label: "Psychiatry or therapy referral", detail: "CBT plus medication review" },
      { label: "Work accommodation note", detail: "Reduced hours, 2 weeks" },
      { label: "CBT-I resource pack", detail: "Sleep program and diary" },
      { label: "Anxiety resource pack", detail: "Applied relaxation" },
    ],
    schedule: [
      "48h: \"Do you understand your plan?\"",
      "1 week: side effects, adherence, sleep, safety",
      "2 weeks: PHQ-2 or GAD-2 plus medication tolerance",
      "4 weeks: full PHQ-9 and GAD-7 reassessment",
    ],
  },
  tier: "high",
};

const MARCUS: PatientProfile = {
  id: "marcus", name: "Marcus T.", firstName: "Marcus", age: 41, reason: "Medication review",
  status: "Follow-up", statusTone: "warn", next: "Jun 24, 14:00",
  concern: "My meds help, but I'm tired all the time and worrying about work performance.",
  goal: "Stable mood, better energy, sustain full-time work.",
  meds: "Escitalopram 10 mg daily for 4 months; tolerated well.",
  sleep: "Sleeps 6.5h; mid-cycle wakes 1-2x.",
  sleepShort: "6.5h nightly", sleepDetail: "Mid-cycle wakes",
  functionShort: "Working full-time", functionDetail: "Energy dips PM",
  family: [
    { who: "Spouse", note: "Engaged, supportive", tone: "ok" },
    { who: "1 teen child", note: "Low conflict", tone: "ok" },
    { who: "Work", note: "Demanding manager role", tone: "warn" },
    { who: "Brother", note: "History of depression", tone: "warn" },
  ],
  phq: [1, 2, 1, 2, 1, 1, 1, 0, 0],
  gad: [1, 1, 1, 1, 1, 1, 1],
  risk: [
    { name: "Family history of mood disorders", find: "Brother with recurrent depression", src: "narrative", tone: "warn" },
    { name: "Past or current substance use", find: "Social alcohol only; no tobacco", src: "structured", tone: "ok" },
    { name: "Social support", find: "Strong partner support; close friend network", src: "narrative", tone: "ok" },
    { name: "Cardiometabolic health", find: "BMI 26, BP 124/78, lipids normal", src: "structured", tone: "ok" },
    { name: "Recent adverse life events", find: "Promotion 6 months ago; increased workload", src: "narrative", tone: "warn" },
  ],
  maci: { score: 40, max: 100, band: "Moderate", tone: "warn", contributors: [
    { label: "Validated symptom severity (PHQ-9, GAD-7)", pct: 45 },
    { label: "Treatment response and adherence (EMR)", pct: 25 },
    { label: "Occupational stress (narrative)", pct: 20 },
    { label: "Family history signal", pct: 10 },
  ] },
  recs: [
    { text: "Mild residual depression on SSRI: continue current dose, optimize adherence, reassess at 4 weeks. Consider dose adjustment only if no further improvement.", cite: "CANMAT 2023" },
    { text: "Mild anxiety: brief CBT or self-guided digital CBT is appropriate; no medication change needed.", cite: "NICE CG113" },
    { text: "Fatigue and sleep maintenance: review sleep hygiene, caffeine timing, and screen exposure before any pharmacological change.", cite: "AAFP 2024" },
    { text: "Track functional outcomes (work attendance, productivity) alongside symptom scores.", cite: "CANMAT 2023" },
  ],
  reasoning: [
    { title: "Maintenance therapy", tone: "warn", purpose: "Sustain remission, monitor relapse signs.", steps: ["Mild residual symptoms on SSRI", "Continue 6-9 months after remission", "Track function, not only scores"] },
    { title: "Workplace stress", tone: "warn", purpose: "Address modifiable driver.", steps: ["Promotion-linked workload", "Discuss boundaries, delegation", "Refer to EAP for coaching"] },
    { title: "Sleep optimization", tone: "info", purpose: "Behavioural first.", steps: ["Sleep hygiene review", "Caffeine cut after 14:00", "Reassess in 4 weeks"] },
  ],
  conv: {
    intro: { title: "Pre-visit, meet Axis first", doneLabel: "Start my check-in", lines: [
      "Hi Marcus, I am Axis. I will help you get ready for your medication review. About three minutes.",
      "I will ask about how the medicine is working, your energy, sleep, and how work is going.",
      "Your physician will review everything I learn. Ready to begin?",
    ] },
    checkin: { title: "4 week medication check-in", lines: [
      "Hi Marcus, Axis here. How has the past month felt on your current medication?",
      "Any side effects, energy changes, or work pressure I should pass on?",
    ], chips: [
      { key: "better", label: "Mood is steady and energy is improving", tone: "ok" },
      { key: "sideeffect", label: "Still fatigued and work is hard", tone: "warn" },
      { key: "worse", label: "Mood is slipping and I'm worrying more", tone: "bad" },
    ] },
  },
  branches: {
    better: {
      accent: "border-border", tone: "ok",
      ack: "Great to hear, Marcus. Steady mood and improving energy noted. Physician will continue the current plan.",
      badge: null, summaryTitle: "Maintenance review summary",
      summary: ["Stable mood on current SSRI", "Energy trending up", "No safety concerns"],
      week2: { wk: "Week 2", tone: "ok", flag: false, title: "Tolerating well", note: "Marcus reports stable mood; no side effects." },
      later: [
        { wk: "Week 4", tone: "ok", flag: false, title: "Maintenance confirmed", note: "PHQ-9 7, GAD-7 5. Continue current regimen." },
        { wk: "Week 8", tone: "ok", flag: false, title: "Plan unchanged", note: "PHQ-9 5, GAD-7 4. Work pressure manageable." },
      ],
      trend: { phq: [9, 8, 7, 5], gad: [7, 6, 5, 4] },
      rec: { tone: "ok", text: "Continue escitalopram 10 mg. Reassess at 3 months.", cite: "CANMAT 2023" },
    },
    sideeffect: {
      accent: "border-accent/30", tone: "warn",
      ack: "Noted, Marcus. I'll pass along the ongoing fatigue and work strain so your physician can review options.",
      badge: "routine review with focus on fatigue", summaryTitle: "Focused review summary",
      summary: ["Persistent fatigue despite stable mood", "Workplace stress contributing", "Consider sleep optimization before dose change"],
      week2: { wk: "Week 2", tone: "warn", flag: false, title: "Fatigue persists", note: "Marcus reports ongoing tiredness; sleep hygiene reviewed." },
      later: [
        { wk: "Week 4", tone: "warn", flag: false, title: "Behavioural changes trialled", note: "PHQ-9 8, GAD-7 6. Some energy gain after caffeine and screen changes." },
        { wk: "Week 8", tone: "ok", flag: false, title: "Improving", note: "PHQ-9 6, GAD-7 5. Discussed EAP referral for workload coaching." },
      ],
      trend: { phq: [9, 9, 8, 6], gad: [7, 7, 6, 5] },
      rec: { tone: "warn", text: "Optimize sleep hygiene and assess workplace load before any dose change. Consider EAP referral.", cite: "CANMAT 2023" },
    },
    worse: {
      accent: "border-destructive/30", tone: "bad",
      ack: "Thanks for telling me, Marcus. I have flagged the worsening mood for prompt physician review.",
      badge: "escalated to physician review", summaryTitle: "Priority review summary",
      summary: ["Mood and anxiety worsening", "Possible inadequate response to current dose", "Reassess treatment plan"],
      week2: { wk: "Week 2", tone: "bad", flag: true, title: "Relapse signs", note: "Marcus reports worsening mood; flagged for review." },
      later: [
        { wk: "Week 4", tone: "warn", flag: false, title: "Dose adjusted", note: "PHQ-9 12, GAD-7 10. Escitalopram increased to 15 mg." },
        { wk: "Week 8", tone: "warn", flag: false, title: "Partial response", note: "PHQ-9 9, GAD-7 7. CBT referral initiated." },
      ],
      trend: { phq: [9, 13, 12, 9], gad: [7, 11, 10, 7] },
      rec: { tone: "bad", text: "Consider dose optimization and add psychotherapy. Re-assess at 4 weeks.", cite: "CANMAT 2023" },
    },
  },
  plan: {
    plainSteps: [
      <>Continue your current medication. We will check progress in 4 weeks.</>,
      <>Try a brief sleep hygiene refresh, especially caffeine and screens before bed.</>,
      <>Use a digital CBT self-guide for mild anxiety, 10-15 minutes daily.</>,
      <>If energy keeps dragging, we'll talk about workload and possible EAP coaching.</>,
    ],
    docs: [
      { label: "Maintenance plan summary", detail: "Continue SSRI, 4 week recheck" },
      { label: "Sleep hygiene handout", detail: "Caffeine and screen guidance" },
      { label: "Digital CBT resource", detail: "Self-guided for mild anxiety" },
    ],
    schedule: [
      "2 weeks: side effect quick check",
      "4 weeks: PHQ-9 and GAD-7 reassessment",
      "3 months: full maintenance review",
    ],
  },
  tier: "moderate",
};

const ELENA: PatientProfile = {
  id: "elena", name: "Elena R.", firstName: "Elena", age: 28, reason: "Anxiety",
  status: "Stable", statusTone: "ok", next: "Jul 02, 09:00",
  concern: "I still get anxious before presentations, but it's much better than last year.",
  goal: "Keep tools sharp, prevent setbacks before grad school applications.",
  meds: "No psychotropic medication. Completed 12 sessions of CBT last year.",
  sleep: "Sleeps 7.5h, rare disruptions.",
  sleepShort: "7.5h nightly", sleepDetail: "Restorative",
  functionShort: "Full work + study", functionDetail: "Engaged socially",
  family: [
    { who: "Partner", note: "Long-term, supportive", tone: "ok" },
    { who: "Friends", note: "Strong social network", tone: "ok" },
    { who: "Family", note: "Close, occasional contact", tone: "ok" },
    { who: "Studies", note: "Grad school prep, motivated", tone: "info" },
  ],
  phq: [1, 0, 1, 1, 0, 1, 1, 0, 0],
  gad: [1, 1, 1, 0, 0, 1, 1],
  risk: [
    { name: "Family history of mood disorders", find: "No known psychiatric family history", src: "narrative", tone: "ok" },
    { name: "Past or current substance use", find: "Occasional social alcohol only", src: "structured", tone: "ok" },
    { name: "Social support", find: "Strong partner, friend, and family ties", src: "narrative", tone: "ok" },
    { name: "Cardiometabolic health", find: "BMI 22, BP 112/70, all labs normal", src: "structured", tone: "ok" },
    { name: "Recent adverse life events", find: "Anticipating grad school applications", src: "narrative", tone: "info" },
  ],
  maci: { score: 18, max: 100, band: "Low", tone: "ok", contributors: [
    { label: "Validated symptom severity (PHQ-9, GAD-7)", pct: 55 },
    { label: "Anticipatory stressors (narrative)", pct: 30 },
    { label: "Protective factors offset (support, sleep)", pct: 15 },
  ] },
  recs: [
    { text: "Subclinical to mild anxiety: continue self-management with CBT skills learned previously. No medication indicated.", cite: "NICE CG113" },
    { text: "Wellness focus: maintain sleep, activity, and social connection as primary protective factors.", cite: "AAFP 2024" },
    { text: "Provide refresher CBT resources and a brief booster session option if anxiety rises before applications.", cite: "NICE CG113" },
  ],
  reasoning: [
    { title: "Prevention pathway", tone: "ok", purpose: "Preserve gains, prevent relapse.", steps: ["Subclinical residual anxiety", "Strong protective factors", "Offer booster CBT if needed"] },
    { title: "Wellness maintenance", tone: "info", purpose: "Reinforce healthy routine.", steps: ["Sleep, exercise, social ties intact", "Continue current pattern", "Annual mental health review"] },
  ],
  conv: {
    intro: { title: "Pre-visit, meet Axis first", doneLabel: "Start my check-in", lines: [
      "Hi Elena, I am Axis. Quick wellness check-in before your visit, about two minutes.",
      "I'll ask how things have been and what you want to keep working well.",
      "Ready?",
    ] },
    checkin: { title: "Wellness check-in", lines: [
      "Hi Elena, Axis here. How have the past weeks felt overall?",
      "Anything coming up, like applications or events, that feels stressful?",
    ], chips: [
      { key: "better", label: "Feeling steady and using my tools", tone: "ok" },
      { key: "sideeffect", label: "A bit of pre-application anxiety", tone: "warn" },
      { key: "worse", label: "Anxiety creeping back, noticeably", tone: "bad" },
    ] },
  },
  branches: {
    better: {
      accent: "border-secondary/30", tone: "ok",
      ack: "Wonderful, Elena. Maintaining well. Physician will keep this as a routine wellness review.",
      badge: null, summaryTitle: "Wellness review summary",
      summary: ["Stable mood and low anxiety", "CBT tools actively used", "No medication needed"],
      week2: { wk: "Week 2", tone: "ok", flag: false, title: "Maintained", note: "Elena reports steady wellbeing." },
      later: [
        { wk: "Week 4", tone: "ok", flag: false, title: "Stable", note: "PHQ-9 3, GAD-7 4. Annual review scheduled." },
        { wk: "Week 8", tone: "ok", flag: false, title: "Sustained wellness", note: "PHQ-9 2, GAD-7 3. No intervention needed." },
      ],
      trend: { phq: [5, 4, 3, 2], gad: [6, 5, 4, 3] },
      rec: { tone: "ok", text: "Continue self-management. Annual mental health check.", cite: "NICE CG113" },
    },
    sideeffect: {
      accent: "border-accent/25", tone: "warn",
      ack: "Got it, Elena. Light anticipatory anxiety noted; I'll suggest a booster resource pack.",
      badge: "booster resource sent", summaryTitle: "Light review summary",
      summary: ["Mild anticipatory anxiety", "CBT booster resources sent", "No clinical escalation needed"],
      week2: { wk: "Week 2", tone: "warn", flag: false, title: "Used booster tools", note: "Elena practiced applied relaxation; helping." },
      later: [
        { wk: "Week 4", tone: "ok", flag: false, title: "Settled", note: "PHQ-9 4, GAD-7 5. Applications submitted; anxiety eased." },
        { wk: "Week 8", tone: "ok", flag: false, title: "Back to baseline", note: "PHQ-9 3, GAD-7 4." },
      ],
      trend: { phq: [5, 6, 4, 3], gad: [6, 8, 5, 4] },
      rec: { tone: "ok", text: "Self-guided CBT booster, brief therapy session optional.", cite: "NICE CG113" },
    },
    worse: {
      accent: "border-destructive/30", tone: "bad",
      ack: "Thanks for telling me. I'll offer a brief therapy session and flag this for your physician.",
      badge: "brief therapy offered", summaryTitle: "Step-up review summary",
      summary: ["Anxiety symptoms returning", "Step-up to brief CBT recommended", "Reassess in 4 weeks"],
      week2: { wk: "Week 2", tone: "bad", flag: true, title: "Symptom return", note: "Elena reports recurrence; brief CBT referral made." },
      later: [
        { wk: "Week 4", tone: "warn", flag: false, title: "Therapy started", note: "PHQ-9 7, GAD-7 9. Engaged in brief CBT." },
        { wk: "Week 8", tone: "ok", flag: false, title: "Responding", note: "PHQ-9 5, GAD-7 6." },
      ],
      trend: { phq: [5, 8, 7, 5], gad: [6, 11, 9, 6] },
      rec: { tone: "warn", text: "Step up to brief individual CBT. Re-evaluate in 4 weeks.", cite: "NICE CG113" },
    },
  },
  plan: {
    plainSteps: [
      <>Keep using your <b>CBT skills</b>; a quick refresher pack is included.</>,
      <>Maintain sleep, activity, and social connection. These are protecting you.</>,
      <>If anxiety rises before applications, request a booster session - it's quick.</>,
      <>We'll check in once at 4 weeks; otherwise, see you at annual review.</>,
    ],
    docs: [
      { label: "Wellness summary", detail: "Self-management plan" },
      { label: "CBT booster pack", detail: "Refresher for application stress" },
    ],
    schedule: [
      "4 weeks: light check-in",
      "Annual: full mental health review",
    ],
  },
  tier: "low",
};

const JAMES: PatientProfile = {
  id: "james", name: "James K.", firstName: "James", age: 52, reason: "Annual visit",
  status: "New intake", statusTone: "info", next: "Jun 27, 11:30",
  concern: "Just here for my annual. Sleep could be better but I'm fine.",
  goal: "Stay healthy, sleep a bit more deeply.",
  meds: "No psychotropic medication. Statin and lisinopril for cardiovascular.",
  sleep: "Sleeps 7h; occasional restless nights.",
  sleepShort: "7h nightly", sleepDetail: "Light some nights",
  functionShort: "Full-time work", functionDetail: "Active hobbies",
  family: [
    { who: "Spouse", note: "Married 22 years", tone: "ok" },
    { who: "2 adult children", note: "Close relationship", tone: "ok" },
    { who: "Community", note: "Active in local groups", tone: "ok" },
  ],
  phq: [0, 1, 1, 1, 0, 0, 0, 0, 0],
  gad: [1, 1, 0, 1, 0, 1, 0],
  risk: [
    { name: "Family history of mood disorders", find: "None reported", src: "narrative", tone: "ok" },
    { name: "Past or current substance use", find: "1-2 alcohol drinks weekly; no tobacco", src: "structured", tone: "ok" },
    { name: "Social support", find: "Strong family, community engagement", src: "narrative", tone: "ok" },
    { name: "Cardiometabolic health", find: "BMI 28, controlled HTN, statin therapy", src: "structured", tone: "warn" },
    { name: "Recent adverse life events", find: "None reported", src: "narrative", tone: "ok" },
  ],
  maci: { score: 12, max: 100, band: "Low", tone: "ok", contributors: [
    { label: "Validated symptom severity (PHQ-9, GAD-7)", pct: 40 },
    { label: "Cardiometabolic comorbidity (EMR)", pct: 35 },
    { label: "Protective social factors", pct: 25 },
  ] },
  recs: [
    { text: "Subclinical symptoms: no specific mental health treatment indicated. Reassure and screen annually.", cite: "USPSTF 2023" },
    { text: "Cardiometabolic optimization remains the primary modifiable risk factor for late-life mood disorders.", cite: "AAFP 2024" },
    { text: "Brief sleep hygiene guidance for occasional restless nights.", cite: "AAFP 2024" },
  ],
  reasoning: [
    { title: "Routine screening", tone: "ok", purpose: "Annual mental health screen.", steps: ["Subclinical scores", "Reassurance, document baseline", "Annual repeat"] },
    { title: "Cardiometabolic link", tone: "warn", purpose: "Mood-CV bidirectional risk.", steps: ["Continue CV medications", "Monitor weight and BP", "Lifestyle reinforcement"] },
  ],
  conv: {
    intro: { title: "Pre-visit, meet Axis first", doneLabel: "Start my check-in", lines: [
      "Hi James, I am Axis. Just a quick wellness check before your annual visit, two minutes.",
      "I'll ask about mood, sleep, and stress so your physician has the full picture.",
    ] },
    checkin: { title: "Annual wellness check-in", lines: [
      "Hi James, Axis here. Anything on your mind since your last visit?",
      "How's sleep been lately?",
    ], chips: [
      { key: "better", label: "All good, sleep is fine", tone: "ok" },
      { key: "sideeffect", label: "Sleep is a bit off", tone: "warn" },
      { key: "worse", label: "I've been feeling down lately", tone: "bad" },
    ] },
  },
  branches: {
    better: {
      accent: "border-secondary/30", tone: "ok",
      ack: "Glad to hear, James. Routine wellness baseline confirmed.",
      badge: null, summaryTitle: "Annual wellness summary",
      summary: ["No mental health concerns", "Sleep adequate", "Continue CV care"],
      week2: { wk: "Week 2", tone: "ok", flag: false, title: "Routine", note: "No change." },
      later: [
        { wk: "Week 4", tone: "ok", flag: false, title: "Stable", note: "PHQ-9 2, GAD-7 3." },
        { wk: "Annual", tone: "ok", flag: false, title: "Next screen", note: "Repeat annual mental health check." },
      ],
      trend: { phq: [3, 3, 2, 2], gad: [4, 4, 3, 3] },
      rec: { tone: "ok", text: "Routine annual screen. No intervention.", cite: "USPSTF 2023" },
    },
    sideeffect: {
      accent: "border-accent/25", tone: "warn",
      ack: "Noted, James. I'll include a brief sleep hygiene pack for your visit.",
      badge: "sleep handout sent", summaryTitle: "Brief review summary",
      summary: ["Occasional sleep disruption", "Sleep hygiene resources provided", "No clinical concern"],
      week2: { wk: "Week 2", tone: "warn", flag: false, title: "Sleep tweaks", note: "James trying earlier wind-down." },
      later: [
        { wk: "Week 4", tone: "ok", flag: false, title: "Improved", note: "PHQ-9 2, GAD-7 3. Sleep more consistent." },
        { wk: "Week 8", tone: "ok", flag: false, title: "Maintained", note: "Stable." },
      ],
      trend: { phq: [3, 4, 2, 2], gad: [4, 5, 3, 3] },
      rec: { tone: "ok", text: "Sleep hygiene measures. No medication.", cite: "AAFP 2024" },
    },
    worse: {
      accent: "border-destructive/30", tone: "bad",
      ack: "Thanks for sharing, James. I'll flag this for your physician so they can explore it with you.",
      badge: "physician review requested", summaryTitle: "New concern summary",
      summary: ["New low mood reported", "Triggers and context to be explored", "Full PHQ-9 recheck recommended"],
      week2: { wk: "Week 2", tone: "bad", flag: true, title: "New low mood", note: "James reports low mood; flagged for clinical review." },
      later: [
        { wk: "Week 4", tone: "warn", flag: false, title: "Assessed", note: "PHQ-9 9, GAD-7 6. Brief counselling started." },
        { wk: "Week 8", tone: "ok", flag: false, title: "Improving", note: "PHQ-9 5, GAD-7 4." },
      ],
      trend: { phq: [3, 10, 9, 5], gad: [4, 8, 6, 4] },
      rec: { tone: "warn", text: "Full evaluation; consider brief counselling. Reassess in 4 weeks.", cite: "NICE NG222" },
    },
  },
  plan: {
    plainSteps: [
      <>Keep up your <b>cardiovascular routine</b>; it protects mood too.</>,
      <>Aim for a consistent bedtime and avoid late caffeine.</>,
      <>We'll repeat a quick mental health check at your next annual.</>,
    ],
    docs: [
      { label: "Annual wellness summary", detail: "Baseline documented" },
      { label: "Sleep hygiene handout", detail: "Brief guidance" },
    ],
    schedule: [
      "Annual: repeat PHQ-9 and GAD-7 screen",
    ],
  },
  tier: "low",
};

const PRIYA: PatientProfile = {
  id: "priya", name: "Priya S.", firstName: "Priya", age: 37, reason: "Insomnia and low mood",
  status: "Active", statusTone: "warn", next: "Jun 23, 15:30",
  concern: "Can't fall asleep, mind racing. Mood is lower than usual but I'm coping.",
  goal: "Sleep 7 hours, get back to morning runs.",
  meds: "No current psychotropic. Trialled melatonin without clear benefit.",
  sleep: "Sleep onset 60 min; wakes 1-2x.",
  sleepShort: "Onset 60 min", sleepDetail: "Wakes 1-2x",
  functionShort: "Working, tired", functionDetail: "Stopped exercise",
  family: [
    { who: "Partner", note: "New relationship, supportive", tone: "ok" },
    { who: "Parents", note: "Long-distance, low contact", tone: "warn" },
    { who: "Work", note: "Project deadlines", tone: "warn" },
    { who: "Friends", note: "Small but close group", tone: "ok" },
  ],
  phq: [2, 2, 2, 2, 1, 1, 1, 1, 0],
  gad: [2, 2, 2, 1, 1, 1, 1],
  risk: [
    { name: "Family history of mood disorders", find: "Father had postpartum depression history (per patient)", src: "narrative", tone: "warn" },
    { name: "Past or current substance use", find: "No alcohol or tobacco", src: "structured", tone: "ok" },
    { name: "Social support", find: "New relationship; limited family contact", src: "narrative", tone: "warn" },
    { name: "Cardiometabolic health", find: "BMI 23, BP 118/74, labs normal", src: "structured", tone: "ok" },
    { name: "Recent adverse life events", find: "Work project deadline; stopped routine exercise", src: "narrative", tone: "warn" },
  ],
  maci: { score: 48, max: 100, band: "Moderate", tone: "warn", contributors: [
    { label: "Validated symptom severity (PHQ-9, GAD-7)", pct: 50 },
    { label: "Sleep disruption (structured + narrative)", pct: 30 },
    { label: "Behavioural withdrawal (exercise drop)", pct: 12 },
    { label: "Family history signal", pct: 8 },
  ] },
  recs: [
    { text: "Moderate depression and anxiety: offer CBT or guided self-help as first-line. Medication is optional with shared decision making.", cite: "NICE NG222" },
    { text: "Insomnia: CBT-I as first line. Avoid hypnotics; review melatonin trial.", cite: "AAFP 2024" },
    { text: "Behavioural activation: rebuild exercise routine as a core part of the plan.", cite: "CANMAT 2023" },
  ],
  reasoning: [
    { title: "Depression pathway", tone: "warn", purpose: "Stepped care, behavioural focus.", steps: ["Moderate (PHQ-9 12)", "Behavioural activation: reinstate exercise", "CBT or guided self-help"] },
    { title: "Sleep pathway", tone: "warn", purpose: "CBT-I first, not hypnotics.", steps: ["Sleep onset insomnia", "Stimulus control, sleep restriction", "Reassess at 4 weeks"] },
    { title: "Anxiety pathway", tone: "warn", purpose: "Address racing thoughts.", steps: ["Moderate (GAD-7 10)", "CBT skills, applied relaxation", "Active monitoring"] },
  ],
  conv: {
    intro: { title: "Pre-visit, meet Axis first", doneLabel: "Start my check-in", lines: [
      "Hi Priya, I am Axis. I will help prepare your visit, about three minutes.",
      "We'll talk about sleep, mood, and what helps or gets in the way.",
      "Your physician will see what I learn. Ready?",
    ] },
    checkin: { title: "Week 2 follow-up, Axis checks in", lines: [
      "Hi Priya, Axis here. Two weeks in - how's sleep been?",
      "And how's the mood and exercise restart going?",
    ], chips: [
      { key: "better", label: "Sleep is improving, started a run again", tone: "ok" },
      { key: "sideeffect", label: "Sleep is still rough, no exercise yet", tone: "warn" },
      { key: "worse", label: "Worse - mind racing, low mood", tone: "bad" },
    ] },
  },
  branches: {
    better: {
      accent: "border-border", tone: "ok",
      ack: "Lovely progress, Priya. Sleep and behavioural activation are working. Physician will keep the plan.",
      badge: null, summaryTitle: "Review summary",
      summary: ["Sleep improving with CBT-I", "Exercise restarted", "No safety concerns"],
      week2: { wk: "Week 2", tone: "ok", flag: false, title: "Improving", note: "Sleep better, exercise resumed." },
      later: [
        { wk: "Week 4", tone: "ok", flag: false, title: "On track", note: "PHQ-9 7, GAD-7 5. CBT-I helping." },
        { wk: "Week 8", tone: "ok", flag: false, title: "Goal close", note: "PHQ-9 5, GAD-7 4. Sleeping 7h." },
      ],
      trend: { phq: [12, 9, 7, 5], gad: [10, 7, 5, 4] },
      rec: { tone: "ok", text: "Continue CBT-I and behavioural activation. Reassess at week 4.", cite: "NICE NG222" },
    },
    sideeffect: {
      accent: "border-accent/30", tone: "warn",
      ack: "Thanks Priya. Persistent sleep issues noted; physician will review the plan.",
      badge: "plan revision needed", summaryTitle: "Focused review summary",
      summary: ["Sleep onset still > 45 min", "Behavioural activation not yet started", "Adherence barriers to explore"],
      week2: { wk: "Week 2", tone: "warn", flag: false, title: "Slow start", note: "CBT-I adherence partial; barriers reviewed." },
      later: [
        { wk: "Week 4", tone: "warn", flag: false, title: "Adjusted plan", note: "PHQ-9 10, GAD-7 8. Added sleep restriction." },
        { wk: "Week 8", tone: "ok", flag: false, title: "Progressing", note: "PHQ-9 7, GAD-7 6. Exercise restarted briefly." },
      ],
      trend: { phq: [12, 12, 10, 7], gad: [10, 10, 8, 6] },
      rec: { tone: "warn", text: "Reinforce CBT-I, address adherence barriers, consider brief therapy referral.", cite: "AAFP 2024" },
    },
    worse: {
      accent: "border-destructive/30", tone: "bad",
      ack: "I'm sorry it's worse, Priya. I'll flag this for urgent physician review.",
      badge: "urgent physician review", summaryTitle: "Priority review summary",
      summary: ["Worsening mood and anxiety", "Treatment intensification likely needed", "Safety to be reconfirmed"],
      week2: { wk: "Week 2", tone: "bad", flag: true, title: "Deterioration", note: "Symptoms worsening; urgent review." },
      later: [
        { wk: "Week 4", tone: "warn", flag: false, title: "Treatment added", note: "PHQ-9 14, GAD-7 12. CBT started, SSRI offered." },
        { wk: "Week 8", tone: "warn", flag: false, title: "Partial response", note: "PHQ-9 10, GAD-7 8." },
      ],
      trend: { phq: [12, 16, 14, 10], gad: [10, 14, 12, 8] },
      rec: { tone: "bad", text: "Intensify treatment: combine CBT and consider SSRI. Reassess in 2 weeks.", cite: "NICE NG222" },
    },
  },
  plan: {
    plainSteps: [
      <>Start <b>CBT-I</b> for sleep with stimulus control and a sleep diary.</>,
      <>Rebuild your <b>morning run</b> gradually - even 15 minutes counts.</>,
      <>Try CBT-style skills for racing thoughts; a guided resource is included.</>,
      <>We'll check at 2 and 4 weeks; if it's not working we'll add more support.</>,
    ],
    docs: [
      { label: "CBT-I resource pack", detail: "Sleep program and diary" },
      { label: "Behavioural activation plan", detail: "Exercise restart schedule" },
      { label: "Anxiety self-help resource", detail: "Racing-thought skills" },
    ],
    schedule: [
      "1 week: sleep diary check",
      "2 weeks: mood and adherence review",
      "4 weeks: full PHQ-9 and GAD-7 reassessment",
    ],
  },
  tier: "moderate",
};

export const PATIENT_PROFILES: Record<string, PatientProfile> = {
  sofia: SOFIA, marcus: MARCUS, elena: ELENA, james: JAMES, priya: PRIYA,
};

export const PATIENT_ROSTER = Object.values(PATIENT_PROFILES).map((p) => ({
  id: p.id, name: p.name, age: p.age, reason: p.reason,
  status: p.status, tone: p.statusTone,
  phq: p.phq.reduce((a, b) => a + b, 0),
  gad: p.gad.reduce((a, b) => a + b, 0),
  next: p.next,
}));

// ---------------- Components ----------------

function Likert({ items, values, setValues }: { items: string[]; values: number[]; setValues: (v: number[]) => void }) {
  return (
    <div className="space-y-2">
      {items.map((q, i) => (
        <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-muted bg-muted px-3 py-2">
          <span className="text-sm text-foreground">{q}</span>
          <div className="flex shrink-0 gap-1">
            {FREQ.map((f, v) => (
              <button key={v} title={f} onClick={() => { const n = [...values]; n[i] = v; setValues(n); }}
                className={`h-7 w-7 rounded-md text-xs font-bold transition ${values[i] === v ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground ring-1 ring-border hover:ring-primary/30"}`}>
                {v}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Intake({ profile, phq, setPhq, gad, setGad, phqScore, gadScore, passiveIdeation, onSubmit }: any) {
  return (
    <InteractiveIntakeChat
      patientName={profile.name || "Emily"}
      phq={phq}
      setPhq={setPhq}
      gad={gad}
      setGad={setGad}
      onComplete={onSubmit}
      onDecline={onSubmit}
    />
  );
}

export function IntakeForm({ profile, phq, setPhq, gad, setGad, phqScore, gadScore, passiveIdeation, onSubmit }: any) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-5">
        <Card title="Why are you here today?">
          <p className="rounded-lg bg-muted p-3 text-foreground italic">"{profile.concern}"</p>
          <p className="mt-2 text-sm text-muted-foreground">Booking reason: {profile.reason}</p>
        </Card>
        <Card title="Depression screen (PHQ-9)" right={<Pill tone={phq9Band(phqScore).tone}>{phqScore}, {phq9Band(phqScore).label}</Pill>}>
          <p className="mb-3 text-xs text-muted-foreground">Over the last 2 weeks. 0 = not at all, 3 = nearly every day. <span className="font-semibold">Tap any answer to see scoring update live.</span></p>
          <Likert items={PHQ9_ITEMS} values={phq} setValues={setPhq} />
        </Card>
        <Card title="Anxiety screen (GAD-7)" right={<Pill tone={gad7Band(gadScore).tone}>{gadScore}, {gad7Band(gadScore).label}</Pill>}>
          <Likert items={GAD7_ITEMS} values={gad} setValues={setGad} />
        </Card>
      </div>
      <div className="space-y-5">
        <Card title="Sleep">
          <p className="text-sm text-foreground">{profile.sleep}</p>
        </Card>
        <Card title="Safety check" accent={passiveIdeation ? "border-accent/30" : "border-border"}>
          <p className="text-sm text-foreground">PHQ-9 item 9: {passiveIdeation ? "endorsed" : "not endorsed"}.</p>
          {passiveIdeation && <div className="mt-2"><Pill tone="warn">Risk flag, physician must confirm</Pill></div>}
        </Card>
        <Card title="Medication history"><p className="text-sm text-foreground">{profile.meds}</p></Card>
        <Card title="Your goal in 4 weeks">
          <p className="rounded-lg bg-primary/10 p-3 text-sm text-primary/80 italic">"{profile.goal}"</p>
        </Card>
        <button onClick={onSubmit} className="w-full rounded-xl bg-primary px-4 py-3 text-center font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90">
          Complete intake
        </button>
        <p className="text-center text-xs text-muted-foreground">This prepares the visit. It does not diagnose.</p>
      </div>
    </div>
  );
}

function MaciCard({ profile }: { profile: PatientProfile }) {
  const m = profile.maci;
  return (
    <Card title="MindAxis Composite Index" right={<Pill tone="info">Proprietary algorithm</Pill>} accent="border-primary/20">
      <div className="flex items-baseline gap-3">
        <div className="text-4xl font-extrabold leading-none text-primary">{m.score}<span className="text-base font-bold text-muted-foreground"> / {m.max}</span></div>
        <Pill tone={m.tone}>{m.band} risk</Pill>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Fuses validated instruments with structured EMR signals and narrative intake into one trajectory aware risk index.</p>
      <div className="mt-3 space-y-2">
        {m.contributors.map((c) => (
          <div key={c.label}>
            <div className="flex justify-between text-xs font-semibold text-foreground/70"><span>{c.label}</span><span>{c.pct}%</span></div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${c.pct}%` }} /></div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function FactorsCard({ profile }: { profile: PatientProfile }) {
  return (
    <Card title="Top whole-person mental-health factors" right={<span className="text-xs text-muted-foreground">structured + narrative data</span>}>
      <div className="divide-y divide-muted">
        {profile.risk.map((f) => (
          <div key={f.name} className="flex items-start justify-between gap-3 py-2.5">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <span className={`h-2.5 w-2.5 rounded-full ${dotColor[f.tone]}`} /> {f.name}
              </div>
              <div className="mt-0.5 text-sm text-muted-foreground">{f.find}</div>
            </div>
            <span className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${f.src === "structured" ? "border-primary/20 bg-primary/10 text-primary" : "border-accent/20 bg-accent/10 text-accent-foreground"}`}>
              {f.src === "structured" ? "Structured EMR" : "Narrative intake"}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function RecommendationsCard({ profile }: { profile: PatientProfile }) {
  return (
    <Card title="Guideline-based recommendations" right={<Pill tone="info">cited</Pill>}>
      <div className="space-y-2">
        {profile.recs.map((r, i) => (
          <div key={i} className="flex items-start gap-2 rounded-lg border border-muted bg-muted px-3 py-2.5">
            <span className="flex-1 text-sm text-foreground">{r.text}</span>
            <span className="shrink-0 rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[11px] font-extrabold text-primary/90">{r.cite}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ReasoningCard({ title, tone, purpose, steps }: Reasoning) {
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

export function Dashboard({ profile, phqScore, gadScore, safetyConfirmed, setSafetyConfirmed, onCarePlan }: any) {
  const actions = ["Generate visit note", "Create care plan", "Start follow-up check-ins", "Prepare referral", "Prepare work form", "Send patient resources"];
  return (
    <div className="space-y-5">
      <Card accent="border-primary/20">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-extrabold text-foreground">{profile.name}, {profile.age}, Mental Health Visit</h2>
            <p className="text-sm text-muted-foreground">Main concern: {profile.reason.toLowerCase()}. Goal: "{profile.goal}"</p>
          </div>
          <Pill tone={profile.maci.tone}>{profile.tier === "high" ? "High risk" : profile.tier === "moderate" ? "Moderate risk" : "Low risk"} · MACI {profile.maci.score}</Pill>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ScoreTile name="PHQ-9" score={phqScore} max={27} band={phq9Band(phqScore)} />
          <ScoreTile name="GAD-7" score={gadScore} max={21} band={gad7Band(gadScore)} />
          <div className={`rounded-xl border p-3 ${toneClasses[profile.maci.tone === "ok" ? "ok" : "warn"]}`}>
            <div className="text-xs font-semibold uppercase tracking-wide opacity-80">Sleep</div>
            <div className="mt-1 text-sm font-bold">{profile.sleepShort}</div>
            <div className="text-xs">{profile.sleepDetail}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Function</div>
            <div className="mt-1 text-sm font-bold text-foreground">{profile.functionShort}</div>
            <div className="text-xs text-muted-foreground">{profile.functionDetail}</div>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2"><MaciCard profile={profile} /><FactorsCard profile={profile} /></div>

      <div className={`rounded-2xl border-2 p-5 ${safetyConfirmed ? "border-secondary/40 bg-secondary/20" : (profile.phq[8] > 0 ? "border-destructive/30 bg-destructive/10" : "border-secondary/40 bg-secondary/20")}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 font-extrabold text-foreground">
              <span>Safety pathway</span>
              {profile.phq[8] > 0
                ? (safetyConfirmed ? <Pill tone="ok">confirmed by clinician</Pill> : <Pill tone="bad">requires confirmation</Pill>)
                : <Pill tone="ok">no risk flags</Pill>}
            </h3>
            <p className="mt-1 text-sm text-foreground">
              {profile.phq[8] > 0
                ? <>Passive death wish (PHQ-9 item 9). <b>Denies plan or intent.</b> The platform will not enter this in the note until the physician confirms.</>
                : <>No suicidal ideation endorsed. Routine safety documentation only.</>}
            </p>
          </div>
          {profile.phq[8] > 0 && !safetyConfirmed && (
            <button onClick={() => setSafetyConfirmed(true)} className="rounded-xl bg-destructive px-4 py-2 font-bold text-primary-foreground hover:bg-destructive/90">Physician confirm risk flag</button>
          )}
          {profile.phq[8] > 0 && safetyConfirmed && (
            <span className="text-sm font-semibold text-secondary/90">Confirmed. Added to clinical note with audit trail.</span>
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">Clinical reasoning cards</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {profile.reasoning.map((r: Reasoning) => <ReasoningCard key={r.title} {...r} />)}
        </div>
      </div>

      <RecommendationsCard profile={profile} />

      <Card title="Actions">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {actions.map((a) => {
            const primary = a === "Create care plan";
            return (
              <button key={a} onClick={primary ? onCarePlan : undefined}
                className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${primary ? "bg-primary text-primary-foreground hover:bg-primary/90 ring-2 ring-primary/30" : "bg-muted text-foreground hover:bg-border"}`}>
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
    <div className="flex items-center justify-between rounded-lg border border-muted bg-muted px-3 py-2">
      <div>
        <div className="font-semibold text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground">{detail}</div>
      </div>
      <span className="text-xs font-semibold text-primary">draft ready</span>
    </div>
  );
}

export function CarePlanScreen({ profile, onFollowup }: { profile: PatientProfile; onFollowup?: () => void }) {
  const [gen, setGen] = useState(false);
  const tierLabel = profile.tier === "high" ? "Intensive plan" : profile.tier === "moderate" ? "Stepped care plan" : "Wellness maintenance plan";
  return (
    <div className="space-y-5">
      <Card accent="border-primary/20">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-foreground">Shared care plan</h2>
            <p className="text-sm text-muted-foreground">{tierLabel} for {profile.name}, physician reviewed before sending. MACI {profile.maci.score} ({profile.maci.band.toLowerCase()} risk).</p>
          </div>
          {!gen && (
            <button onClick={() => setGen(true)} className="rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground hover:bg-primary/90">Generate care plan</button>
          )}
        </div>
      </Card>

      {!gen ? (
        <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center text-muted-foreground">
          Click <b>Generate care plan</b> to draft a plan calibrated to {profile.firstName}'s risk tier.
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card title={`Plain language plan (for ${profile.firstName})`}>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-foreground">
              {profile.plan.plainSteps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </Card>
          <Card title="Auto-drafted documents" right={<Pill tone="info">awaiting physician sign-off</Pill>}>
            <div className="space-y-2 text-sm">
              {profile.plan.docs.map((d) => <DocRow key={d.label} label={d.label} detail={d.detail} />)}
            </div>
          </Card>
          <Card title="Follow-up schedule (auto-started)">
            <ul className="space-y-1 text-sm text-foreground">
              {profile.plan.schedule.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </Card>
          {onFollowup && (
            <div className="flex items-end">
              <button onClick={onFollowup} className="w-full rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground hover:bg-primary/90">Start the journey, see follow-up</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function FollowUp({ profile }: { profile: PatientProfile }) {
  const [checkin, setCheckin] = useState(true);
  const [reportedKey, setReportedKey] = useState<string | null>(null);
  const [reportedLabel, setReportedLabel] = useState<string | null>(null);

  if (checkin) {
    return (
      <AvatarChat
        title={profile.conv.checkin.title} lines={profile.conv.checkin.lines} chips={profile.conv.checkin.chips}
        onDone={(c) => {
          if (c && c.key) { setReportedKey(c.key); setReportedLabel(c.label); }
          else { setReportedKey("sideeffect"); setReportedLabel(profile.conv.checkin.chips[1].label); }
          setCheckin(false);
        }}
      />
    );
  }

  const branch = profile.branches[reportedKey || "sideeffect"];
  const timeline = [
    { wk: "48h", tone: "ok", flag: false, title: "Plan understood", note: `${profile.firstName} confirmed she understands the plan. Resources opened.` },
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
            <div className="text-xs font-semibold text-primary">Axis</div>
            <p className="mt-0.5 text-xs text-muted-foreground">Patient replied: "{reportedLabel}"</p>
            <p className="mt-1.5 text-sm text-foreground">{branch.ack}</p>
            <div className="mt-2">{branch.badge ? <Pill tone="bad">{branch.badge}</Pill> : <Pill tone="ok">on track, routine review</Pill>}</div>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <Card title="Longitudinal narrative arc">
            <ol className="relative ml-3 border-l-2 border-border">
              {timeline.map((t: any) => (
                <li key={t.wk + t.title} className="mb-4 ml-4">
                  <div className={`absolute -left-[9px] mt-1 h-4 w-4 rounded-full border-2 border-white ${dotColor[t.tone]}`} />
                  <div className={`rounded-xl border p-3 ${t.flag ? "border-destructive/30 bg-destructive/10 shadow-sm" : "border-muted bg-card"}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{t.wk}, {t.title}</span>
                      {t.flag && <Pill tone="bad">needs review</Pill>}
                    </div>
                    <p className="mt-1 text-sm text-foreground/70">{t.note}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
        <div className="space-y-5">
          <Card title={branch.summaryTitle}>
            <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
              {branch.summary.map((s: string) => <li key={s}>{s}</li>)}
            </ul>
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-muted bg-muted px-3 py-2.5">
              <span className="flex-1 text-sm text-foreground">{branch.rec.text}</span>
              <span className="shrink-0 rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[11px] font-extrabold text-primary/90">{branch.rec.cite}</span>
            </div>
          </Card>
          <Card title="Symptom trajectory">
            <TrendChart series={series} />
            <div className="mt-2 flex gap-4 text-xs">
              <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-primary" /> PHQ-9</span>
              <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-teal-600" /> GAD-7</span>
            </div>
          </Card>
          <Card title="Family and caregiving map">
            <div className="grid grid-cols-2 gap-2">
              {profile.family.map((f) => (
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
          className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground hover:bg-border">
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
        <p className="text-sm text-foreground/70">
          MindAxis 360 launches <b>inside the EMR</b> as a SMART app and exchanges structured data with the clinical record.
        </p>
        <div className="mt-3 space-y-2 text-sm">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
              {s}
            </div>
          ))}
        </div>
        <button onClick={() => setExported(true)} className="mt-4 w-full rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground hover:bg-primary/90">
          {exported ? "Exported to EMR (mock)" : "Export visit to EMR"}
        </button>
        {exported && <p className="mt-2 text-center text-xs text-secondary">10 FHIR resources written. Audit trail updated.</p>}
      </Card>
      <div className="space-y-5">
        <Card title="Platform object to FHIR resource">
          <table className="w-full text-sm">
            <tbody>
              {FHIR_MAP.map(([a, b]) => (
                <tr key={a} className="border-b border-muted last:border-0">
                  <td className="py-1.5 pr-3 text-foreground/70">{a}</td>
                  <td className="py-1.5 font-mono text-xs text-primary/90">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card title="Sample resource (PHQ-9 to Observation)">
          <pre className="overflow-x-auto rounded-lg bg-foreground p-3 text-xs text-secondary/40">{SAMPLE_BUNDLE}</pre>
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
        <Card accent="border-secondary/40">
          <div className="text-center">
            <Pill tone="ok">Appointment confirmed</Pill>
            <h2 className="mt-3 text-xl font-extrabold text-foreground">You are booked with {prov.name}</h2>
            <p className="mt-1 text-sm text-foreground/70">{dObj.day}, {dObj.date} at {slot}</p>
            <p className="mt-3 text-sm text-foreground/70">Reason: {reason}</p>
            <p className="mt-4 text-xs text-muted-foreground">Axis will reach out before your visit to help you get ready.</p>
            <button onClick={() => { setConfirmed(false); setSlot(null); }} className="mt-5 rounded-xl bg-muted px-4 py-2 text-sm font-semibold text-foreground/70 hover:bg-border">
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
                className={`rounded-xl border p-3 text-left transition ${provider === p.id ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/20"}`}>
                <div className="text-sm font-bold text-foreground">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.role}</div>
              </button>
            ))}
          </div>
        </Card>

        <Card title="Pick a day">
          <div className="flex flex-wrap gap-2">
            {days.map((d) => (
              <button key={d.iso} onClick={() => { setDay(d.iso); setSlot(null); }}
                className={`rounded-xl border px-3 py-2 text-center transition ${day === d.iso ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/20"}`}>
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
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${slot === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/30"}`}>
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
              <label key={r} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${reason === r ? "border-primary bg-primary/10 text-primary/90" : "border-border bg-card text-foreground"}`}>
                <input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} className="accent-primary" />
                {r}
              </label>
            ))}
          </div>
        </Card>

        <Card title="Summary">
          <ul className="space-y-1 text-sm text-foreground">
            <li><span className="text-muted-foreground">Provider:</span> <b>{PROVIDERS.find((p) => p.id === provider)?.name}</b></li>
            <li><span className="text-muted-foreground">Date:</span> <b>{days.find((d) => d.iso === day)?.date}</b></li>
            <li><span className="text-muted-foreground">Time:</span> <b>{slot ?? "select a time"}</b></li>
            <li><span className="text-muted-foreground">Reason:</span> <b>{reason}</b></li>
          </ul>
          <button disabled={!slot} onClick={() => setConfirmed(true)}
            className="mt-4 w-full rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40">
            Confirm appointment
          </button>
          <p className="mt-2 text-center text-xs text-muted-foreground">You can reschedule or cancel up to 24 hours before.</p>
        </Card>
      </div>
    </div>
  );
}

export function AppHeader({ role, tabs, active, setActive }: { role: "patient" | "doctor"; tabs: { key: string; label: string }[]; active: string; setActive: (k: string) => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-black text-primary-foreground">M</div>
            <div>
              <div className="text-lg font-extrabold leading-none text-foreground">MindAxis <span className="text-primary">360</span></div>
              <div className="text-xs text-muted-foreground">{role === "patient" ? "Patient portal" : "Physician workspace"}</div>
            </div>
          </div>
          <Link to="/" className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground/70 hover:bg-border">Sign out</Link>
        </div>
        <nav className="mt-3 flex flex-wrap gap-1.5">
          {tabs.map((s) => (
            <button key={s.key} onClick={() => setActive(s.key)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${active === s.key ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70 hover:bg-border"}`}>
              {s.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function PatientsList({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const filtered = PATIENT_ROSTER.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.reason.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="space-y-5">
      <Card title="Patient roster" right={<Pill tone="info">{PATIENT_ROSTER.length} patients</Pill>}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or reason"
          className="mb-3 w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-primary/60"
        />
        <div className="grid gap-2">
          {filtered.map((p) => {
            const maci = PATIENT_PROFILES[p.id].maci;
            return (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition ${selectedId === p.id ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/20"}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 font-bold text-primary/90">
                    {p.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{p.name} <span className="font-normal text-muted-foreground">· {p.age}</span></div>
                    <div className="text-xs text-muted-foreground">{p.reason}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden text-right text-xs text-muted-foreground sm:block">
                    <div>PHQ-9 <b className="text-foreground">{p.phq}</b> · GAD-7 <b className="text-foreground">{p.gad}</b></div>
                    <div>MACI <b className="text-foreground">{maci.score}</b> · Next: {p.next}</div>
                  </div>
                  <Pill tone={p.tone}>{p.status}</Pill>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && <p className="text-sm text-muted-foreground">No patients match your search.</p>}
        </div>
      </Card>
      <p className="text-center text-xs text-muted-foreground">Select a patient to open their chart in the physician dashboard.</p>
    </div>
  );
}

export function PatientApp() {
  const [tab, setTab] = useState("intake");
  const profile = PATIENT_PROFILES.sofia;
  const [phq, setPhq] = useState(profile.phq);
  const [gad, setGad] = useState(profile.gad);
  const phqScore = useMemo(() => phq.reduce((a, b) => a + b, 0), [phq]);
  const gadScore = useMemo(() => gad.reduce((a, b) => a + b, 0), [gad]);
  const passiveIdeation = phq[8] > 0;

  const tabs = [
    { key: "intake", label: "Pre-visit intake" },
    { key: "booking", label: "Book appointment" },
    { key: "careplan", label: "Care plan" },
    { key: "followup", label: "Follow-up check-in" },
  ];
  return (
    <div className="min-h-screen bg-muted text-foreground">
      <AppHeader role="patient" tabs={tabs} active={tab} setActive={setTab} />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6">
        {tab === "booking" && <Booking />}
        {tab === "intake" && (
          <Intake profile={profile} phq={phq} setPhq={setPhq} gad={gad} setGad={setGad}
            phqScore={phqScore} gadScore={gadScore} passiveIdeation={passiveIdeation}
            onSubmit={() => setTab("booking")} />
        )}
        {tab === "careplan" && (
          <div className="rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center">
            <h2 className="text-lg font-extrabold text-foreground">Care plan</h2>
            <p className="mt-2 text-foreground/70">Care plan waiting for doctor's approval</p>
          </div>
        )}
        {tab === "followup" && <FollowUp profile={profile} />}
      </main>
    </div>
  );
}

export function DoctorApp() {
  const [tab, setTab] = useState("patients");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [safetyConfirmed, setSafetyConfirmed] = useState(false);

  const profile = selectedPatient ? PATIENT_PROFILES[selectedPatient] : null;
  const phqScore = profile ? profile.phq.reduce((a, b) => a + b, 0) : 0;
  const gadScore = profile ? profile.gad.reduce((a, b) => a + b, 0) : 0;

  const tabs = [
    { key: "patients", label: "Patients" },
    { key: "dashboard", label: "Physician dashboard" },
    { key: "careplan", label: "Care plan" },
    { key: "followup", label: "Follow-up journey" },
    { key: "fhir", label: "EMR / FHIR" },
  ];

  const needsPatient = tab !== "patients" && tab !== "fhir" && !profile;

  return (
    <div className="min-h-screen bg-muted text-foreground">
      <AppHeader role="doctor" tabs={tabs} active={tab} setActive={setTab} />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6">
        {tab === "patients" && (
          <PatientsList
            selectedId={selectedPatient}
            onSelect={(id) => { setSelectedPatient(id); setSafetyConfirmed(false); setTab("dashboard"); }}
          />
        )}
        {needsPatient && (
          <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center text-muted-foreground">
            Select a patient from the <button onClick={() => setTab("patients")} className="font-bold text-primary underline">Patients</button> tab to open their chart.
          </div>
        )}
        {tab === "dashboard" && profile && (
          <Dashboard profile={profile} phqScore={phqScore} gadScore={gadScore}
            safetyConfirmed={safetyConfirmed} setSafetyConfirmed={setSafetyConfirmed}
            onCarePlan={() => setTab("careplan")} />
        )}
        {tab === "careplan" && profile && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <button className="rounded-xl bg-secondary px-4 py-2 font-bold text-primary-foreground hover:bg-secondary/90">Approve care plan</button>
              <button className="rounded-xl border border-border bg-card px-4 py-2 font-bold text-foreground hover:bg-muted">Edit care plan</button>
            </div>
            <CarePlanScreen profile={profile} onFollowup={() => setTab("followup")} />
          </div>
        )}
        {tab === "followup" && profile && <FollowUp profile={profile} />}
        {tab === "fhir" && <FhirScreen />}
      </main>
    </div>
  );
}

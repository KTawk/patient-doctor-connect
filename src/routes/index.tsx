import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MindAxis 360 — Whole-person mental health for family medicine" },
      { name: "description", content: "Sign in to MindAxis 360 as a patient or a physician." },
      { property: "og:title", content: "MindAxis 360" },
      { property: "og:description", content: "Sign in to MindAxis 360 as a patient or a physician." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-white text-slate-800">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-black text-white">M</div>
          <div>
            <div className="text-2xl font-extrabold leading-none text-slate-900">MindAxis <span className="text-indigo-600">360</span></div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">Whole-person mental health for family medicine</div>
          </div>
        </div>

        <h1 className="max-w-2xl text-center text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          The visit is not the intervention. <span className="text-indigo-600">The journey is.</span>
        </h1>
        <p className="mt-4 max-w-xl text-center text-base text-slate-600">
          Sign in to continue. Patients prepare for visits and check in between them. Physicians get a whole-person view, guideline-informed support, and EMR-ready outputs.
        </p>

        <div className="mt-10 grid w-full max-w-3xl gap-5 sm:grid-cols-2">
          <Link to="/patient" className="group rounded-2xl border-2 border-indigo-200 bg-white p-6 shadow-sm transition hover:border-indigo-400 hover:shadow-md">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-500">Patient</div>
            <div className="mt-2 text-xl font-extrabold text-slate-900">Patient sign in</div>
            <p className="mt-1 text-sm text-slate-500">Book a visit, complete pre-visit intake with Axis, and check in between visits.</p>
            <span className="mt-4 inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition group-hover:bg-indigo-700">
              Continue as patient →
            </span>
          </Link>

          <Link to="/doctor" className="group rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-400 hover:shadow-md">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Physician</div>
            <div className="mt-2 text-xl font-extrabold text-slate-900">Doctor sign in</div>
            <p className="mt-1 text-sm text-slate-500">See the 60-second clinical view, MACI risk index, care plan, follow-up journey, and FHIR exports.</p>
            <span className="mt-4 inline-flex items-center gap-1 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition group-hover:bg-slate-800">
              Continue as physician →
            </span>
          </Link>
        </div>

        <p className="mt-10 text-xs text-slate-400">Prototype with demo data. No real PHI.</p>
      </div>
    </div>
  );
}

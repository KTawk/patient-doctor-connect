import { createFileRoute } from "@tanstack/react-router";
import { DoctorApp } from "@/lib/mindaxis";

export const Route = createFileRoute("/doctor")({
  head: () => ({
    meta: [
      { title: "Physician workspace — MindAxis 360" },
      { name: "description", content: "Whole-person dashboard, care plan, follow-up journey, and EMR / FHIR." },
    ],
  }),
  component: DoctorApp,
});
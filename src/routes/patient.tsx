import { createFileRoute } from "@tanstack/react-router";
import { PatientApp } from "@/lib/mindaxis";

export const Route = createFileRoute("/patient")({
  head: () => ({
    meta: [
      { title: "Patient portal — MindAxis 360" },
      { name: "description", content: "Book your visit, complete pre-visit intake, and check in between visits." },
    ],
  }),
  component: PatientApp,
});
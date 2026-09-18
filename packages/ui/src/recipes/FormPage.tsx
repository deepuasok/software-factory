"use client";

import React, { useState } from "react";
import {
  Button,
  Combobox,
  DateRangePicker,
  Field,
  Form,
  FormRow,
  FormSection,
  MultiSelect,
  PageHeader,
  RadioCards,
  Slider,
  TagInput,
  TextArea,
  TextInput,
  ValidationSummary,
  type DateRange,
  type Option,
} from "../index";

/** What the form collects. Swap the fields; keep the shape. */
export type FormPageValues = {
  name: string;
  owner: string;
  categories: string[];
  tags: string[];
  period: DateRange;
  threshold: number;
  cadence: "monthly" | "quarterly" | "on-change";
  notes: string;
};

const SAMPLE_OWNERS: Option[] = [
  { value: "praman", label: "Priya Raman", hint: "Contracts, Europe" },
  { value: "talvarez", label: "Tom Alvarez", hint: "Contracts, Americas" },
  { value: "dokonjo", label: "Dana Okonjo", hint: "Sourcing" },
];

const SAMPLE_CATEGORIES: Option[] = [
  { value: "imaging", label: "Imaging" },
  { value: "lab", label: "Laboratory" },
  { value: "consulting", label: "Consulting" },
  { value: "logistics", label: "Logistics" },
];

const SAMPLE_VALUES: FormPageValues = {
  name: "Northgate General — 2027 renewal",
  owner: "praman",
  categories: ["imaging"],
  tags: ["renewal", "sample data"],
  period: { from: "2026-10-01", to: "2027-09-30" },
  threshold: 60,
  cadence: "quarterly",
  notes: "",
};

/**
 * The form page: two groups of fields, the errors above them, and Save pinned
 * to the bottom of the screen.
 *
 * Use it for creating or editing a record people fill in once. Do not use it
 * for a figure people nudge repeatedly while they argue — that is InlineEdit
 * on the number itself.
 */
export function FormPage({
  title = "New renewal",
  subtitle = "Sample data. Nothing here is saved anywhere.",
  initial = SAMPLE_VALUES,
  owners = SAMPLE_OWNERS,
  categories = SAMPLE_CATEGORIES,
}: {
  title?: string;
  subtitle?: string;
  initial?: FormPageValues;
  owners?: Option[];
  categories?: Option[];
}) {
  const [values, setValues] = useState<FormPageValues>(initial);
  const [errors, setErrors] = useState<{ field: string; message: string }[]>([]);

  const set = <K extends keyof FormPageValues>(key: K, value: FormPageValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  function submit() {
    const found: { field: string; message: string }[] = [];
    if (!values.name.trim()) found.push({ field: "Name", message: "Give the renewal a name." });
    if (values.categories.length === 0) {
      found.push({ field: "Categories", message: "Pick at least one category." });
    }
    if (values.period.from > values.period.to) {
      found.push({ field: "Period", message: "The end date is before the start date." });
    }
    setErrors(found);
  }

  return (
    <Form onSubmit={submit} className="flex flex-col gap-4 pb-20">
      <PageHeader title={title} subtitle={subtitle} />

      <ValidationSummary items={errors} />

      <FormSection
        title="What is being renewed"
        description="Everyone who opens this record later reads these three lines first."
      >
        <FormRow>
          <Field label="Name" required htmlFor="renewal-name">
            <TextInput
              id="renewal-name"
              value={values.name}
              invalid={errors.some((e) => e.field === "Name")}
              onChange={(e) => set("name", e.target.value)}
            />
          </Field>
          <Field label="Owner" hint="The person who answers questions about it.">
            <Combobox value={values.owner} onChange={(v) => set("owner", v)} options={owners} />
          </Field>
        </FormRow>
        <FormRow>
          <Field label="Categories" required>
            <MultiSelect value={values.categories} onChange={(v) => set("categories", v)} options={categories} />
          </Field>
          <Field label="Tags" hint="Free text. Nobody governs this list.">
            <TagInput value={values.tags} onChange={(v) => set("tags", v)} />
          </Field>
        </FormRow>
        <Field label="Period covered">
          <DateRangePicker value={values.period} onChange={(v) => set("period", v)} />
        </Field>
      </FormSection>

      <FormSection
        title="How it gets reviewed"
        description="These settings decide who gets told, and how often."
      >
        <Field label="Review cadence">
          <RadioCards
            value={values.cadence}
            onChange={(v) => set("cadence", v)}
            columns={3}
            options={[
              { value: "monthly", title: "Every month", description: "For renewals inside ninety days. Noisy on purpose." },
              { value: "quarterly", title: "Every quarter", description: "The usual choice. One reminder per quarter to the owner." },
              { value: "on-change", title: "Only on a change", description: "Silent until spend or status moves. Nothing lands in a calendar." },
            ]}
          />
        </Field>
        <Field
          label="Flag when usage drops below"
          hint="Roughly right is fine. The alert fires on the monthly figure."
        >
          <Slider
            value={values.threshold}
            onChange={(v) => set("threshold", v)}
            min={0}
            max={100}
            step={5}
            format={(v) => `${v}%`}
          />
        </Field>
        <Field label="Notes" hint="Anything the next person should know.">
          <TextArea
            rows={3}
            value={values.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Optional"
          />
        </Field>
      </FormSection>

      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-edge">
        <div className="max-w-[1280px] mx-auto flex items-center gap-2 px-6 py-3">
          <span className="text-[11px] text-muted">Changes save when you press Save.</span>
          <div className="flex-1" />
          <Button variant="secondary" type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save renewal
          </Button>
        </div>
      </div>
    </Form>
  );
}

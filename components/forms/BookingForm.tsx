"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { InputField, TextareaField } from "@/components/forms/Field";
import { FormStatus } from "@/components/forms/FormStatus";

type Status = "idle" | "submitting" | "success" | "error";

export function BookingForm() {
  const t = useTranslations("booking");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("request_failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return <FormStatus type="success" title={t("successTitle")} body={t("successBody")} />;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {status === "error" ? (
        <FormStatus type="error" title={t("errorTitle")} body={t("errorBody")} />
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <InputField label={t("fields.name")} name="name" type="text" required autoComplete="name" />
        <InputField label={t("fields.phone")} name="phone" type="tel" required autoComplete="tel" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <InputField label={t("fields.email")} name="email" type="email" autoComplete="email" />
        <InputField label={t("fields.company")} name="company" type="text" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <InputField label={t("fields.industry")} name="industry" type="text" />
        <InputField label={t("fields.preferredTime")} name="preferredTime" type="text" />
      </div>
      <TextareaField label={t("fields.message")} name="message" />

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}

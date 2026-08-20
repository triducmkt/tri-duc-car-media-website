import { TextareaHTMLAttributes, InputHTMLAttributes } from "react";

type BaseProps = {
  label: string;
  name: string;
  required?: boolean;
};

export function InputField({
  label,
  name,
  required,
  ...rest
}: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink">
        {label}
        {required ? <span className="text-brand-600"> *</span> : null}
      </span>
      <input
        name={name}
        required={required}
        className="min-h-11 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted/60 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        {...rest}
      />
    </label>
  );
}

export function TextareaField({
  label,
  name,
  required,
  ...rest
}: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink">
        {label}
        {required ? <span className="text-brand-600"> *</span> : null}
      </span>
      <textarea
        name={name}
        required={required}
        rows={5}
        className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted/60 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        {...rest}
      />
    </label>
  );
}

import { CheckCircle2, AlertTriangle } from "lucide-react";

export function FormStatus({
  type,
  title,
  body,
}: {
  type: "success" | "error";
  title: string;
  body: string;
}) {
  const Icon = type === "success" ? CheckCircle2 : AlertTriangle;
  const tone =
    type === "success"
      ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
      : "bg-red-50 text-red-800 ring-red-200";

  return (
    <div className={`flex items-start gap-3 rounded-xl p-4 text-sm ring-1 ${tone}`} role="status">
      <Icon size={20} className="mt-0.5 shrink-0" aria-hidden />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

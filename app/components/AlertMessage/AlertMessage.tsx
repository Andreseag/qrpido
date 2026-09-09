import { FeedbackMessage } from "@/app/admin/settings/types";

interface AlertMessageProps {
  message: FeedbackMessage | null;
}

export function AlertMessage({ message }: AlertMessageProps) {
  if (!message) return null;

  return (
    <div
      className={`p-4 rounded-2xl text-xs font-bold border ${
        message.type === "success"
          ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/30"
          : "bg-rose-950/40 text-rose-300 border-rose-500/30"
      }`}>
      {message.text}
    </div>
  );
}

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
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
          : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
      }`}>
      {message.text}
    </div>
  );
}

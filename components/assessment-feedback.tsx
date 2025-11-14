'use client';

interface AssessmentFeedbackProps {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  show: boolean;
}

export function AssessmentFeedback({ message, type, show }: AssessmentFeedbackProps) {
  if (!show) return null;

  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-100",
    success:
      "bg-green-50 border-green-200 text-green-700 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-100",
    warning:
      "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-950/40 dark:border-yellow-900 dark:text-yellow-100",
    error:
      "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-900 dark:text-red-100",
  };

  return (
    <div
      className={`p-4 border rounded-lg shadow-sm animate-fade-in ${styles[type]}`}
    >
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

'use client';

interface AssessmentFeedbackProps {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  show: boolean;
}

export function AssessmentFeedback({ message, type, show }: AssessmentFeedbackProps) {
  if (!show) return null;

  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    error: 'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <div className={`p-4 border rounded-lg animate-fade-in ${styles[type]}`}>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

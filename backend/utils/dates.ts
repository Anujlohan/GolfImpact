export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function getMonthName(monthNumber: number): string {
  const date = new Date(2026, monthNumber - 1, 1);
  return date.toLocaleString('en-US', { month: 'long' });
}

export function daysUntil(dateString: string | Date): number {
  const target = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

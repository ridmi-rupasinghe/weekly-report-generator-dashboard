import { format, startOfWeek, endOfWeek, addDays, isWithinInterval } from 'date-fns';

export function getCurrentWeek() {
  const now = new Date();
  return {
    weekStart: startOfWeek(now, { weekStartsOn: 1 }),
    weekEnd: endOfWeek(now, { weekStartsOn: 1 }),
  };
}

export function formatWeekRange(start, end) {
  return `${format(new Date(start), 'MMM d')} – ${format(new Date(end), 'MMM d, yyyy')}`;
}

export function toDateInput(date) {
  return format(new Date(date), 'yyyy-MM-dd');
}

export function isCurrentWeek(weekStart) {
  const { weekStart: currentStart, weekEnd: currentEnd } = getCurrentWeek();
  const start = new Date(weekStart);
  return isWithinInterval(start, { start: currentStart, end: currentEnd });
}

export function weekEndFromStart(weekStartStr) {
  const start = new Date(weekStartStr);
  return toDateInput(addDays(start, 6));
}

export interface MonthGridDay {
  date: Date;
  isoDate: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfToday(): Date {
  return startOfDay(new Date());
}

export function isSameDay(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isValidIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

export function shiftIsoDate(dateIso: string, days: number): string {
  const date = new Date(`${dateIso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export function isPastIsoDate(dateIso: string, referenceDate = startOfToday()): boolean {
  return new Date(`${dateIso}T00:00:00`).getTime() < referenceDate.getTime();
}

export function formatDate(
  value: Date | string,
  options: Intl.DateTimeFormatOptions,
  locale = 'es-ES'
): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function buildMonthGrid(referenceDate: Date, selectedDate: Date): MonthGridDay[] {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const today = new Date();
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, month, 0).getDate();
  const leadingDays = (firstDayOfMonth.getDay() + 6) % 7;
  const calendarDays: MonthGridDay[] = [];

  for (let index = leadingDays - 1; index >= 0; index -= 1) {
    const date = new Date(year, month - 1, daysInPreviousMonth - index);
    calendarDays.push(createMonthGridDay(date, selectedDate, false, today));
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    calendarDays.push(createMonthGridDay(date, selectedDate, true, today));
  }

  let trailingDay = 1;
  while (calendarDays.length < 35 || calendarDays.length % 7 !== 0) {
    const date = new Date(year, month + 1, trailingDay);
    calendarDays.push(createMonthGridDay(date, selectedDate, false, today));
    trailingDay += 1;
  }

  return calendarDays;
}

function createMonthGridDay(
  date: Date,
  selectedDate: Date,
  isCurrentMonth: boolean,
  today: Date
): MonthGridDay {
  return {
    date,
    isoDate: toIsoDate(date),
    dayNumber: date.getDate(),
    isCurrentMonth,
    isToday: isSameDay(date, today),
    isSelected: isSameDay(date, selectedDate),
  };
}

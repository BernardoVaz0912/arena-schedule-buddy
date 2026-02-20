export type BookingStatus = "available" | "booked" | "blocked";

export interface Booking {
  id: string;
  arenaId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  clientName: string;
  status: BookingStatus;
  notes?: string;
}

export const ARENAS = [
  { id: "arena-1", name: "Arena 1", color: "hsl(152, 60%, 42%)" },
  { id: "arena-2", name: "Arena 2", color: "hsl(210, 70%, 50%)" },
] as const;

export const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
  "20:00", "21:00", "22:00",
];

export const WEEKDAYS = [
  "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado",
];

export const WEEKDAYS_SHORT = [
  "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb",
];

export function getWeekDates(referenceDate: Date): Date[] {
  const day = referenceDate.getDay();
  const diff = referenceDate.getDate() - day;
  const sunday = new Date(referenceDate);
  sunday.setDate(diff);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDateDisplay(date: Date): string {
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// Sample data
export function generateSampleBookings(): Booking[] {
  const now = new Date();
  const weekDates = getWeekDates(now);
  const bookings: Booking[] = [];

  const names = ["João Silva", "Maria Santos", "Pedro Costa", "Ana Lima", "Carlos Souza"];

  weekDates.forEach((date) => {
    const dateKey = formatDateKey(date);
    // Random bookings for arena 1
    ["09:00", "14:00", "19:00", "20:00"].forEach((time, i) => {
      if (Math.random() > 0.4) {
        bookings.push({
          id: `a1-${dateKey}-${time}`,
          arenaId: "arena-1",
          date: dateKey,
          time,
          clientName: names[i % names.length],
          status: "booked",
        });
      }
    });
    // Random bookings for arena 2
    ["10:00", "15:00", "18:00", "21:00"].forEach((time, i) => {
      if (Math.random() > 0.4) {
        bookings.push({
          id: `a2-${dateKey}-${time}`,
          arenaId: "arena-2",
          date: dateKey,
          time,
          clientName: names[(i + 2) % names.length],
          status: "booked",
        });
      }
    });
  });

  return bookings;
}

import { useMemo } from "react";
import type { Booking } from "@/lib/schedule-data";
import {
  TIME_SLOTS,
  WEEKDAYS_SHORT,
  formatDateKey,
  formatDateDisplay,
} from "@/lib/schedule-data";
import { cn } from "@/lib/utils";

interface WeekScheduleProps {
  weekDates: Date[];
  bookings: Booking[];
  arenaId: string;
  onSlotClick: (date: string, time: string, booking?: Booking) => void;
}

export function WeekSchedule({ weekDates, bookings, arenaId, onSlotClick }: WeekScheduleProps) {
  const bookingMap = useMemo(() => {
    const map = new Map<string, Booking>();
    bookings
      .filter((b) => b.arenaId === arenaId)
      .forEach((b) => map.set(`${b.date}-${b.time}`, b));
    return map;
  }, [bookings, arenaId]);

  const today = formatDateKey(new Date());

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Header */}
        <div className="grid grid-cols-[72px_repeat(7,1fr)] gap-px mb-px">
          <div className="p-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Hora
          </div>
          {weekDates.map((date, i) => {
            const isToday = formatDateKey(date) === today;
            return (
              <div
                key={i}
                className={cn(
                  "p-2 text-center rounded-t-md",
                  isToday
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-muted-foreground"
                )}
              >
                <div className="text-xs font-semibold uppercase">{WEEKDAYS_SHORT[i]}</div>
                <div className={cn("text-lg font-bold", isToday ? "text-primary" : "text-foreground")}>
                  {formatDateDisplay(date)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-[72px_repeat(7,1fr)] gap-px">
          {TIME_SLOTS.map((time) => (
            <>
              <div
                key={`label-${time}`}
                className="p-2 text-xs font-medium text-muted-foreground flex items-center justify-end pr-3"
              >
                {time}
              </div>
              {weekDates.map((date, dayIdx) => {
                const dateKey = formatDateKey(date);
                const key = `${dateKey}-${time}`;
                const booking = bookingMap.get(key);
                const isToday = dateKey === today;

                return (
                  <button
                    key={`${dayIdx}-${time}`}
                    onClick={() => onSlotClick(dateKey, time, booking)}
                    className={cn(
                      "min-h-[44px] p-1.5 rounded-md text-xs transition-all duration-150 border",
                      "hover:ring-2 hover:ring-primary/30 hover:scale-[1.02] cursor-pointer",
                      isToday && "bg-primary/[0.03]",
                      !booking && "bg-arena-slot border-transparent hover:bg-accent",
                      booking?.status === "booked" &&
                        "bg-arena-booked/15 border-arena-booked/30 text-arena-header",
                      booking?.status === "blocked" &&
                        "bg-arena-blocked/15 border-arena-blocked/30 text-muted-foreground"
                    )}
                  >
                    {booking && (
                      <div className="truncate font-medium text-[11px] leading-tight">
                        {booking.status === "blocked" ? "🚫 Bloqueado" : booking.clientName}
                      </div>
                    )}
                  </button>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState, useCallback } from "react";
import { generateSampleBookings, type Booking } from "@/lib/schedule-data";

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>(() => generateSampleBookings());

  const saveBooking = useCallback((booking: Booking) => {
    setBookings((prev) => {
      const idx = prev.findIndex((b) => b.id === booking.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = booking;
        return updated;
      }
      return [...prev, booking];
    });
  }, []);

  const deleteBooking = useCallback((id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return { bookings, saveBooking, deleteBooking };
}

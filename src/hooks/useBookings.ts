import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Booking } from "@/lib/schedule-data";
import { formatDateKey } from "@/lib/schedule-data";

export function useBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*");

    if (error) {
      console.error("Erro ao buscar reservas:", error);
      return;
    }

    const mapped: Booking[] = (data ?? []).map((row) => ({
      id: row.id,
      arenaId: row.arena_id,
      date: row.date,
      time: row.time,
      clientName: row.client_name,
      status: row.status as Booking["status"],
      notes: row.notes ?? undefined,
    }));

    setBookings(mapped);
    setLoading(false);
  }, []);

  // Delete past bookings (non-fixed)
  const cleanupPastBookings = useCallback(async () => {
    const today = formatDateKey(new Date());
    const { error } = await supabase
      .from("bookings")
      .delete()
      .lt("date", today)
      .neq("status", "fixed");

    if (error) {
      console.error("Erro ao limpar reservas passadas:", error);
    }
  }, []);

  // Save (upsert) a booking
  const saveBooking = useCallback(
    async (booking: Booking) => {
      if (!user) return;

      const { error } = await supabase.from("bookings").upsert(
        {
          id: booking.id,
          user_id: user.id,
          arena_id: booking.arenaId,
          date: booking.date,
          time: booking.time,
          client_name: booking.clientName,
          status: booking.status,
          notes: booking.notes ?? null,
        },
        { onConflict: "arena_id,date,time" }
      );

      if (error) {
        console.error("Erro ao salvar reserva:", error);
        return;
      }

      await fetchBookings();
    },
    [user, fetchBookings]
  );

  // Delete a booking
  const deleteBooking = useCallback(
    async (id: string) => {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro ao remover reserva:", error);
        return;
      }

      await fetchBookings();
    },
    [fetchBookings]
  );

  // Initial load + cleanup + realtime
  useEffect(() => {
    cleanupPastBookings().then(() => fetchBookings());

    const channel = supabase
      .channel("bookings-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBookings, cleanupPastBookings]);

  return { bookings, loading, saveBooking, deleteBooking };
}

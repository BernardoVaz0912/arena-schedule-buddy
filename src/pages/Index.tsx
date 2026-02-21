import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logoArenaMix from "@/assets/logo-arena-mix.jpg";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { WeekSchedule } from "@/components/WeekSchedule";
import { BookingDialog } from "@/components/BookingDialog";
import {
  ARENAS,
  getWeekDates,
  generateSampleBookings,
  formatDateKey,
  type Booking,
} from "@/lib/schedule-data";

const Index = () => {
  const { signOut } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>(() => generateSampleBookings());
  const [activeArena, setActiveArena] = useState<string>(ARENAS[0].id);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [slotDate, setSlotDate] = useState("");
  const [slotTime, setSlotTime] = useState("");

  const weekDates = getWeekDates(currentDate);

  const navigateWeek = (dir: number) => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + dir * 7);
      return d;
    });
  };

  const goToToday = () => setCurrentDate(new Date());

  const handleSlotClick = useCallback(
    (date: string, time: string, booking?: Booking) => {
      setSlotDate(date);
      setSlotTime(time);
      setEditingBooking(booking ?? null);
      setDialogOpen(true);
    },
    []
  );

  const handleSave = useCallback((booking: Booking) => {
    setBookings((prev) => {
      const filtered = prev.filter((b) => b.id !== booking.id);
      return [...filtered, booking];
    });
  }, []);

  const handleDelete = useCallback((id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // Stats
  const weekKey = weekDates.map((d) => formatDateKey(d));
  const weekBookings = bookings.filter(
    (b) => b.arenaId === activeArena && weekKey.includes(b.date)
  );
  const bookedCount = weekBookings.filter((b) => b.status === "booked").length;
  const blockedCount = weekBookings.filter((b) => b.status === "blocked").length;

  const monthLabel = weekDates[0].toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoArenaMix} alt="Arena Mix" className="h-10 w-10 rounded-lg object-cover" />
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Arena Mix
              </h1>
              <p className="text-xs text-muted-foreground">
                Gestão de horários
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="hidden sm:flex gap-1">
              <span className="h-2 w-2 rounded-full bg-arena-booked" />
              {bookedCount} reservas
            </Badge>
            <Badge variant="secondary" className="hidden sm:flex gap-1">
              <span className="h-2 w-2 rounded-full bg-arena-blocked" />
              {blockedCount} bloqueios
            </Badge>
            <Button variant="ghost" size="icon" onClick={signOut} title="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Navigation + Arena Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Tabs
            value={activeArena}
            onValueChange={setActiveArena}
            className="w-full sm:w-auto"
          >
            <TabsList>
              {ARENAS.map((arena) => (
                <TabsTrigger key={arena.id} value={arena.id} className="min-w-[100px]">
                  {arena.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoje
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigateWeek(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold capitalize min-w-[160px] text-center">
              {monthLabel}
            </span>
            <Button variant="outline" size="icon" onClick={() => navigateWeek(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="bg-card rounded-xl border p-4 shadow-sm">
          <WeekSchedule
            weekDates={weekDates}
            bookings={bookings}
            arenaId={activeArena}
            onSlotClick={handleSlotClick}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-arena-slot border" />
            Disponível
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-arena-booked/30 border border-arena-booked/40" />
            Reservado
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-arena-blocked/30 border border-arena-blocked/40" />
            Bloqueado
          </div>
        </div>
      </main>

      {/* Booking Dialog */}
      <BookingDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        booking={editingBooking}
        defaultArenaId={activeArena}
        defaultDate={slotDate}
        defaultTime={slotTime}
      />
    </div>
  );
};

export default Index;

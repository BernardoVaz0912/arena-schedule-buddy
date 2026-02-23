import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import logoArenaMix from "@/assets/logo-arena-mix.jpg";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { WeekSchedule } from "@/components/WeekSchedule";
import { BookingDialog } from "@/components/BookingDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ARENAS,
  getWeekDates,
  formatDateKey,
  type Booking,
} from "@/lib/schedule-data";
import { useBookings } from "@/hooks/useBookings";

const Index = () => {
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { bookings, saveBooking, deleteBooking } = useBookings();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeArena, setActiveArena] = useState<string>(ARENAS[0].id);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [slotDate, setSlotDate] = useState("");
  const [slotTime, setSlotTime] = useState("");
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
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
    saveBooking(booking);
  }, [saveBooking]);

  const handleDelete = useCallback((id: string) => {
    deleteBooking(id);
  }, [deleteBooking]);

  // Stats
  const weekKey = weekDates.map((d) => formatDateKey(d));
  const weekBookings = bookings.filter(
    (b) => b.arenaId === activeArena && weekKey.includes(b.date)
  );
  const bookedCount = weekBookings.filter((b) => b.status === "booked").length;
  const fixedCount = weekBookings.filter((b) => b.status === "fixed").length;

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
              <span className="h-2 w-2 rounded-full bg-arena-fixed" />
              {fixedCount} fixos
            </Badge>
            <Button variant="ghost" size="icon" onClick={toggleTheme} title="Alternar tema">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setLogoutDialogOpen(true)} title="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Navigation + Arena Tabs */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <Tabs
            value={activeArena}
            onValueChange={setActiveArena}
            className="w-full"
          >
            <TabsList className="w-full sm:w-auto">
              {ARENAS.map((arena) => (
                <TabsTrigger key={arena.id} value={arena.id} className="flex-1 sm:flex-none sm:min-w-[100px]">
                  {arena.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex items-center justify-center sm:justify-end gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoje
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigateWeek(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold capitalize min-w-[140px] sm:min-w-[160px] text-center">
              {monthLabel}
            </span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigateWeek(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="bg-card rounded-xl border p-2 sm:p-4 shadow-sm">
          <WeekSchedule
            weekDates={weekDates}
            bookings={bookings}
            arenaId={activeArena}
            onSlotClick={handleSlotClick}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-arena-slot border" />
            Disponível
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-arena-booked/30 border border-arena-booked/40" />
            Reservado
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-arena-fixed/30 border border-arena-fixed/40" />
            Fixo
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

      {/* Logout Confirmation */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja sair?</AlertDialogTitle>
            <AlertDialogDescription>
              Você será desconectado da sua conta. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={signOut}>Sim, sair</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;

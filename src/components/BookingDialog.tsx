import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Booking, BookingStatus } from "@/lib/schedule-data";
import { ARENAS } from "@/lib/schedule-data";
import { Trash2 } from "lucide-react";

interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (booking: Booking) => void;
  onDelete?: (id: string) => void;
  booking?: Booking | null;
  defaultArenaId: string;
  defaultDate: string;
  defaultTime: string;
}

export function BookingDialog({
  open,
  onClose,
  onSave,
  onDelete,
  booking,
  defaultArenaId,
  defaultDate,
  defaultTime,
}: BookingDialogProps) {
  const [clientName, setClientName] = useState(booking?.clientName ?? "");
  const [notes, setNotes] = useState(booking?.notes ?? "");
  const [status, setStatus] = useState<BookingStatus>(booking?.status ?? "booked");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const arena = ARENAS.find((a) => a.id === defaultArenaId);
  const isEdit = !!booking;

  const handleSave = () => {
    if (!clientName.trim()) return;
    onSave({
      id: booking?.id ?? `${defaultArenaId}-${defaultDate}-${defaultTime}-${Date.now()}`,
      arenaId: defaultArenaId,
      date: defaultDate,
      time: defaultTime,
      clientName: clientName.trim(),
      status,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <>
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {isEdit ? "Editar Reserva" : "Nova Reserva"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {arena?.name} · {defaultDate} · {defaultTime}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="client">{status === "fixed" ? "Nome do Cliente (Fixo)" : "Nome do Cliente"}</Label>
            <Input
              id="client"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ex: João Silva"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex gap-2">
              {(["booked", "fixed"] as BookingStatus[]).map((s) => (
                <Button
                  key={s}
                  type="button"
                  variant={status === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatus(s)}
                >
                  {s === "booked" ? "Reservado" : "Fixo"}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Opcional..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          {isEdit && onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDeleteOpen(true)}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Remover
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!clientName.trim()}>
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja remover esta reserva? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onDelete?.(booking!.id);
              setConfirmDeleteOpen(false);
              onClose();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Sim, remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

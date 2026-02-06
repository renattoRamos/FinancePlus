import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ClayButton } from "@/components/ui/clay-button";
import { AlertTriangle } from "lucide-react";
import { Installment } from "@/types/installment";

interface DeleteInstallmentConfirmModalProps {
  open: boolean;
  installment: Installment | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteInstallmentConfirmModal = ({ open, installment, onConfirm, onCancel }: DeleteInstallmentConfirmModalProps) => {
  if (!installment) return null;

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Exclusão
          </DialogTitle>
          <DialogDescription>
            Confirmar exclusão desta cobrança.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja deletar o parcelamento <span className="font-medium text-foreground">{installment.name}</span>? Esta ação não pode ser desfeita.
          </p>

          <div className="flex gap-2">
            <ClayButton
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </ClayButton>

            <ClayButton
              variant="destructive"
              onClick={onConfirm}
              className="flex-1"
            >
              Deletar
            </ClayButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
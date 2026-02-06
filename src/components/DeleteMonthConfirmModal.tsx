import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ClayButton } from "@/components/ui/clay-button";
import { AlertTriangle } from "lucide-react";

interface DeleteMonthConfirmModalProps {
  open: boolean;
  monthKey: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteMonthConfirmModal = ({ open, monthKey, onConfirm, onCancel }: DeleteMonthConfirmModalProps) => {
  if (!monthKey) return null;

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Exclusão do Mês
          </DialogTitle>
          <DialogDescription>
            Confirmar exclusão de todos os dados deste mês.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja deletar o mês <span className="font-medium text-foreground">{monthKey}</span>? Todas as dívidas associadas a este mês serão permanentemente removidas. Esta ação não pode ser desfeita.
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
              Deletar Mês
            </ClayButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
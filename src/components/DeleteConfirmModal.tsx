import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ClayButton } from "@/components/ui/clay-button";
import { AlertTriangle, Repeat, Calendar } from "lucide-react";
import { Debt } from "@/types/debt";

interface DeleteConfirmModalProps {
  open: boolean;
  debt: Debt | null;
  onConfirm: (deleteAllMonths: boolean) => void;
  onCancel: () => void;
}

export const DeleteConfirmModal = ({ open, debt, onConfirm, onCancel }: DeleteConfirmModalProps) => {
  if (!debt) return null;

  const isRecurrent = debt.isRecurrent && debt.originalId;

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Exclusão
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja deletar esta dívida?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium">{debt.name}</h4>
              {isRecurrent && <Repeat className="h-4 w-4 text-muted-foreground" />}
            </div>
            <p className="text-sm text-muted-foreground">
              Valor: R$ {debt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            {debt.category && (
              <p className="text-sm text-muted-foreground">
                Categoria: {debt.category}
              </p>
            )}
          </div>

          {isRecurrent ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Repeat className="h-4 w-4" />
                Esta é uma dívida recorrente. Como deseja proceder?
              </p>

              <div className="grid grid-cols-2 gap-4">
                <ClayButton
                  variant="outline"
                  onClick={() => onConfirm(false)}
                  className="justify-start gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Deletar apenas deste mês
                </ClayButton>

                <ClayButton
                  variant="destructive"
                  onClick={() => onConfirm(true)}
                  className="justify-start gap-2"
                >
                  <Repeat className="h-4 w-4" />
                  Deletar de todos os meses
                </ClayButton>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Tem certeza que deseja deletar esta dívida? Esta ação não pode ser desfeita.
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
                  onClick={() => onConfirm(false)}
                  className="flex-1"
                >
                  Deletar
                </ClayButton>
              </div>
            </div>
          )}

          {isRecurrent && (
            <div className="flex justify-end">
              <ClayButton
                variant="outline"
                onClick={onCancel}
                className="w-24"
              >
                Cancelar
              </ClayButton>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
import { Edit2, Trash2, Calendar, DollarSign, CheckCircle, Clock, Tag, CreditCard } from "lucide-react";
import { ClayCard, ClayCardContent } from "@/components/ui/clay-card";
import { ClayButton } from "@/components/ui/clay-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Installment, InstallmentStatus } from "@/types/installment";
import { cn } from "@/lib/utils";
import { format, parseISO, isToday, isTomorrow, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ResponsiveInstallmentCardProps {
  installment: Installment;
  onEdit: (installment: Installment) => void;
  onDelete: (id: string) => void;
  onMarkAsPaid: (id: string, newPaidCount: number) => void;
}

export const ResponsiveInstallmentCard = ({ installment, onEdit, onDelete, onMarkAsPaid }: ResponsiveInstallmentCardProps) => {
  const isConcluded = installment.status === "Concluído";
  const isOverdue = installment.status === "Atrasado";
  const isCancelled = installment.status === "Cancelado";

  const progressValue = (installment.paidInstallments / installment.totalInstallments) * 100;
  const remainingAmount = (installment.totalInstallments - installment.paidInstallments) * installment.installmentAmount;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  const getStatusVariant = (): "default" | "destructive" | "outline" | "secondary" => {
    switch (installment.status) {
      case 'Ativo': return 'default';
      case 'Concluído': return 'secondary';
      case 'Atrasado': return 'destructive';
      case 'Cancelado': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: InstallmentStatus) => {
    switch (status) {
      case 'Ativo': return 'Ativo';
      case 'Concluído': return 'Concluído';
      case 'Atrasado': return 'Atrasado';
      case 'Cancelado': return 'Cancelado';
      default: return 'Desconhecido';
    }
  };

  const handleInstallmentClick = (installmentNumber: number) => {
    if (isCancelled) return;

    let newPaidCount;
    if (installmentNumber <= installment.paidInstallments) {
      newPaidCount = installmentNumber - 1;
    } else {
      newPaidCount = installmentNumber;
    }
    onMarkAsPaid(installment.id, newPaidCount);
  };

  return (
    <ClayCard className={cn(
      "transition-all duration-300 hover:shadow-clay-medium animate-slide-up",
      isConcluded && "bg-success/5 border-success/20",
      isOverdue && "bg-destructive/5 border-destructive/20",
      isCancelled && "bg-muted/50 border-muted/20 opacity-70"
    )}>
      <ClayCardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className={cn("font-semibold text-lg truncate", isConcluded && "line-through")}>
                  {installment.name}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {installment.category}
                  </Badge>
                  <Badge
                    variant={getStatusVariant()}
                    className={cn("text-xs", {
                      'bg-success text-success-foreground border-transparent hover:bg-success/80': installment.status === 'Concluído',
                      'bg-destructive text-destructive-foreground border-transparent hover:bg-destructive/80': installment.status === 'Atrasado',
                    })}
                  >
                    {getStatusText(installment.status)}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>
                  {formatCurrency(installment.installmentAmount)} / mês (Total: {formatCurrency(installment.totalAmount)})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span>{installment.paymentMethod} {installment.cardId ? `(final ${installment.cardId.slice(-4)})` : ''}</span>
              </div>
              {!isConcluded && !isCancelled && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className={cn({
                    'text-destructive font-medium': isOverdue,
                    'text-warning font-medium': !isOverdue && parseISO(installment.nextDueDate) <= addDays(new Date(), 3),
                  })}>
                    Próxima parcela: {formatDate(installment.nextDueDate)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex sm:flex-col items-end justify-between sm:items-end sm:justify-center gap-2">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Parcelas</p>
              <p className="text-lg font-bold text-primary">
                {installment.paidInstallments} / {installment.totalInstallments}
              </p>
              {!isConcluded && !isCancelled && (
                <p className="text-sm text-muted-foreground">
                  Restante: {formatCurrency(remainingAmount)}
                </p>
              )}
            </div>
            <div className="flex gap-2 sm:mt-2">
              <ClayButton variant="ghost" size="sm" onClick={() => onEdit(installment)} disabled={isCancelled}>
                <Edit2 className="h-4 w-4" />
              </ClayButton>
              <ClayButton variant="ghost" size="sm" onClick={() => onDelete(installment.id)} className="hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </ClayButton>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2 text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium text-foreground">
              {Math.round(progressValue)}%
            </span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        <div className="flex items-center gap-2 mt-4 flex-wrap justify-center sm:justify-start">
          {Array.from({ length: installment.totalInstallments }).map((_, index) => {
            const installmentNumber = index + 1;
            const isCurrentPaid = installmentNumber <= installment.paidInstallments;
            const isClickable = !isCancelled;

            return (
              <div
                key={index}
                className={cn(
                  "h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs font-semibold",
                  isCurrentPaid
                    ? "bg-success border-success text-success-foreground"
                    : "bg-background border-muted-foreground text-muted-foreground",
                  isClickable && "cursor-pointer hover:scale-110 transition-transform",
                  !isClickable && "opacity-50 cursor-not-allowed"
                )}
                onClick={isClickable ? () => handleInstallmentClick(installmentNumber) : undefined}
                title={isCurrentPaid ? `Parcela ${installmentNumber} paga` : `Parcela ${installmentNumber} pendente`}
              >
                {installmentNumber}
              </div>
            );
          })}
        </div>
      </ClayCardContent>
    </ClayCard>
  );
};
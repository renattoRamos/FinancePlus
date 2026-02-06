import { Check, Clock, Edit2, Trash2, Calendar, DollarSign, CheckCircle } from "lucide-react";
import { ClayCard, ClayCardContent } from "@/components/ui/clay-card";
import { ClayButton } from "@/components/ui/clay-button";
import { Badge } from "@/components/ui/badge";
import { Debt } from "@/types/debt";
import { formatBrazilDate } from "@/utils/date"; // Importando utilitário de data

interface ResponsiveDebtCardProps {
  debt: Debt;
  onToggleStatus: (id: string) => void;
  onEdit: (debt: Debt) => void;
  onDelete: (id: string) => void;
}

export const ResponsiveDebtCard = ({ debt, onToggleStatus, onEdit, onDelete }: ResponsiveDebtCardProps) => {
  const isPaid = debt.status === "Pago";
  const isOverdue = debt.dueDate && new Date(debt.dueDate) < new Date() && !isPaid;
  const isDueSoon = debt.dueDate && !isPaid && !isOverdue &&
    Math.ceil((new Date(debt.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) <= 3;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (dateString: string) => {
    return formatBrazilDate(dateString);
  };

  return (
    <ClayCard className={`
      transition-all duration-300 hover:shadow-clay-medium animate-slide-up
      ${isPaid ? 'bg-success/5 border-success/20' : ''}
      ${isOverdue ? 'bg-destructive/5 border-destructive/20' : ''}
      ${isDueSoon ? 'bg-warning/5 border-warning/20' : ''}
    `}>
      <ClayCardContent className="p-4">
        {/* Mobile Layout */}
        <div className="block sm:hidden space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-base truncate ${isPaid ? 'text-success line-through' : 'text-foreground'
                }`}>
                {debt.name}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={debt.category === "Moradia" ? "default" : "secondary"} className="text-xs">
                  {debt.category}
                </Badge>
                {debt.isRecurrent && (
                  <Badge variant="outline" className="text-xs">
                    Recorrente
                  </Badge>
                )}
              </div>
            </div>
            <ClayButton
              variant={isPaid ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleStatus(debt.id)}
              className={`ml-2 ${isPaid ? 'bg-success hover:bg-success/90' : ''}`}
            >
              {isPaid ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            </ClayButton>
          </div>

          {/* Amount */}
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className={`text-lg font-bold ${isPaid ? 'text-success' : 'text-primary'
              }`}>
              {formatCurrency(debt.amount)}
            </span>
          </div>

          {/* Date and Actions */}
          <div className="flex items-center justify-between">
            {isPaid && debt.paidDate ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm text-success font-medium">
                  Pago em {formatDate(debt.paidDate)}
                </span>
              </div>
            ) : debt.dueDate ? (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className={`text-sm ${isOverdue ? 'text-destructive font-medium' :
                    isDueSoon ? 'text-warning font-medium' :
                      'text-muted-foreground'
                  }`}>
                  {formatDate(debt.dueDate)}
                </span>
              </div>
            ) : (
              <div /> // Placeholder to keep alignment
            )}

            <div className="flex gap-2">
              <ClayButton
                variant="ghost"
                size="sm"
                onClick={() => onEdit(debt)}
                className="h-8 w-8 p-0"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </ClayButton>
              <ClayButton
                variant="ghost"
                size="sm"
                onClick={() => onDelete(debt.id)}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </ClayButton>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <ClayButton
              variant={isPaid ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleStatus(debt.id)}
              className={`shrink-0 ${isPaid ? 'bg-success hover:bg-success/90' : ''}`}
            >
              {isPaid ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            </ClayButton>

            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-lg truncate ${isPaid ? 'text-success line-through' : 'text-foreground'
                }`}>
                {debt.name}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={debt.category === "Moradia" ? "default" : "secondary"} className="text-xs">
                  {debt.category}
                </Badge>
                {debt.isRecurrent && (
                  <Badge variant="outline" className="text-xs">
                    Recorrente
                  </Badge>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className={`text-xl font-bold ${isPaid ? 'text-success' : 'text-primary'
                }`}>
                {formatCurrency(debt.amount)}
              </div>
              {isPaid && debt.paidDate ? (
                <div className="text-sm text-success flex items-center justify-end gap-2 font-medium">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Pago em {formatDate(debt.paidDate)}
                </div>
              ) : debt.dueDate ? (
                <div className={`text-sm ${isOverdue ? 'text-destructive font-medium' :
                    isDueSoon ? 'text-warning font-medium' :
                      'text-muted-foreground'
                  }`}>
                  {formatDate(debt.dueDate)}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex gap-2 ml-4">
            <ClayButton
              variant="ghost"
              size="sm"
              onClick={() => onEdit(debt)}
              className="hover:bg-secondary"
            >
              <Edit2 className="h-4 w-4" />
            </ClayButton>
            <ClayButton
              variant="ghost"
              size="sm"
              onClick={() => onDelete(debt.id)}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </ClayButton>
          </div>
        </div>
      </ClayCardContent>
    </ClayCard>
  );
};
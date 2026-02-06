import { useMemo } from "react";
import { Edit2, Trash2, CreditCard, Landmark, Shield, CircleDollarSign } from "lucide-react";
import { ClayCard, ClayCardContent } from "@/components/ui/clay-card";
import { ClayButton } from "@/components/ui/clay-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/types/card";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface ResponsiveCardCardProps {
  card: Card;
  onEdit: (card: Card) => void;
  onDelete: (id: string) => void;
}

export const ResponsiveCardCard = ({ card, onEdit, onDelete }: ResponsiveCardCardProps) => {
  const isInactive = card.status !== 'Ativo';

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStatusVariant = (): "default" | "destructive" | "outline" => {
    switch (card.status) {
      case 'Ativo': return 'default';
      case 'Bloqueado': return 'outline';
      default: return 'destructive';
    }
  };

  const progressValue = useMemo(() => {
    if (card.type === 'Crédito' && card.limit && card.limit > 0) {
      return ((card.usedAmount || 0) / card.limit) * 100;
    }
    if (card.type === 'Alimentação' && card.balance && card.balance > 0) {
      return ((card.usedAmount || 0) / card.balance) * 100;
    }
    return 0;
  }, [card]);

  return (
    <ClayCard className={cn(
      "transition-all duration-300 hover:shadow-clay-medium animate-slide-up",
      isInactive && "bg-muted/50 border-muted/20 opacity-70"
    )}>
      <ClayCardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className={cn("font-semibold text-lg truncate", isInactive && "line-through")}>
                  {card.name}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Final •••• {card.lastFourDigits}</span>
                </p>
              </div>
              <Badge variant={getStatusVariant()} className={cn("sm:hidden", {
                'bg-success text-success-foreground border-transparent hover:bg-success/80': card.status === 'Ativo',
                'bg-warning text-warning-foreground border-transparent hover:bg-warning/80': card.status === 'Bloqueado',
              })}>{card.status}</Badge>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Landmark className="h-4 w-4" /><span>{card.issuer}</span></div>
              <div className="flex items-center gap-2"><Shield className="h-4 w-4" /><span>{card.flag}</span></div>
              <div className="flex items-center gap-2"><CircleDollarSign className="h-4 w-4" /><span>{card.type}</span></div>
            </div>
          </div>

          <div className="flex sm:flex-col items-end justify-between sm:items-end sm:justify-center gap-2">
            <div className="text-right">
              {card.type === 'Crédito' && card.limit && (
                <>
                  <p className="text-xs text-muted-foreground">Limite</p>
                  <p className="text-lg font-bold text-primary">{formatCurrency(card.limit)}</p>
                </>
              )}
              {(card.type === 'Débito' || card.type === 'Alimentação') && card.balance !== undefined && (
                <>
                  <p className="text-xs text-muted-foreground">{card.type === 'Alimentação' ? 'Benefício' : 'Saldo'}</p>
                  <p className="text-lg font-bold text-primary">{formatCurrency(card.balance)}</p>
                </>
              )}
              <Badge variant={getStatusVariant()} className={cn("hidden sm:inline-flex mt-2", {
                'bg-success text-success-foreground border-transparent hover:bg-success/80': card.status === 'Ativo',
                'bg-warning text-warning-foreground border-transparent hover:bg-warning/80': card.status === 'Bloqueado',
              })}>{card.status}</Badge>
            </div>
            <div className="flex gap-2 sm:mt-2">
              <ClayButton variant="ghost" size="sm" onClick={() => onEdit(card)}><Edit2 className="h-4 w-4" /></ClayButton>
              <ClayButton variant="ghost" size="sm" onClick={() => onDelete(card.id)} className="hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></ClayButton>
            </div>
          </div>
        </div>
        {(card.type === 'Crédito' || card.type === 'Alimentação') && card.status === 'Ativo' && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-muted-foreground">
                {card.type === 'Crédito' ? 'Limite Utilizado' : 'Saldo Utilizado'}
              </span>
              <span className="font-medium text-foreground">
                {formatCurrency(card.usedAmount || 0)} / {formatCurrency(card.type === 'Crédito' ? card.limit || 0 : card.balance || 0)}
              </span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>
        )}
      </ClayCardContent>
    </ClayCard>
  );
};
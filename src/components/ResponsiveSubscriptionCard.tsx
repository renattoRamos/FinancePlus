import { Edit2, Trash2, Calendar, DollarSign, Repeat, CreditCard, Tag } from "lucide-react";
import { ClayCard, ClayCardContent } from "@/components/ui/clay-card";
import { ClayButton } from "@/components/ui/clay-button";
import { Badge } from "@/components/ui/badge";
import { Subscription } from "@/types/subscription";
import { cn } from "@/lib/utils";

interface ResponsiveSubscriptionCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
}

export const ResponsiveSubscriptionCard = ({ subscription, onEdit, onDelete }: ResponsiveSubscriptionCardProps) => {
  const isCancelled = subscription.status === "Cancelada";
  const isPaused = subscription.status === "Pausada";

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  const getStatusVariant = (): "default" | "destructive" | "outline" | "secondary" => {
    switch (subscription.status) {
      case 'Ativa': return 'default';
      case 'Pausada': return 'outline';
      case 'Cancelada': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <ClayCard className={cn(
      "transition-all duration-300 hover:shadow-clay-medium animate-slide-up",
      isCancelled && "bg-muted/50 border-muted/20 opacity-70",
      isPaused && "bg-warning/5 border-warning/20"
    )}>
      <ClayCardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className={cn("font-semibold text-lg truncate", isCancelled && "line-through")}>
                  {subscription.name}
                </h3>
                {subscription.plan && <p className="text-sm text-muted-foreground">{subscription.plan}</p>}
              </div>
              <Badge variant={getStatusVariant()} className={cn("sm:hidden", {
                'bg-success text-success-foreground border-transparent hover:bg-success/80': subscription.status === 'Ativa',
                'bg-warning text-warning-foreground border-transparent hover:bg-warning/80': subscription.status === 'Pausada',
              })}>{subscription.status}</Badge>
            </div>

            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span>{subscription.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span>{subscription.paymentMethod}</span>
              </div>
              <div className="flex items-center gap-2">
                <Repeat className="h-4 w-4" />
                <span>{subscription.billingCycle}</span>
              </div>
              {!isCancelled && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Próxima cobrança: {formatDate(subscription.nextBillingDate)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex sm:flex-col items-end justify-between sm:items-end sm:justify-center gap-2">
            <div className="text-right">
              <div className="text-xl font-bold text-primary">
                {formatCurrency(subscription.amount)}
              </div>
              <Badge variant={getStatusVariant()} className={cn("hidden sm:inline-flex mt-2", {
                'bg-success text-success-foreground border-transparent hover:bg-success/80': subscription.status === 'Ativa',
                'bg-warning text-warning-foreground border-transparent hover:bg-warning/80': subscription.status === 'Pausada',
              })}>{subscription.status}</Badge>
            </div>
            <div className="flex gap-2 sm:mt-2">
              <ClayButton variant="ghost" size="sm" onClick={() => onEdit(subscription)}>
                <Edit2 className="h-4 w-4" />
              </ClayButton>
              <ClayButton variant="ghost" size="sm" onClick={() => onDelete(subscription.id)} className="hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </ClayButton>
            </div>
          </div>
        </div>
      </ClayCardContent>
    </ClayCard>
  );
};
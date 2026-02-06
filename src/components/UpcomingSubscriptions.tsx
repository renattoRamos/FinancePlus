import { useMemo } from "react";
import { useSubscriptions } from "@/contexts/SubscriptionContext";
import { ClayCard, ClayCardHeader, ClayCardTitle, ClayCardContent } from "@/components/ui/clay-card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarClock } from "lucide-react";
import { Link } from "react-router-dom";
import { ClayButton } from "./ui/clay-button";

export const UpcomingSubscriptions = () => {
  const { subscriptions, isLoading } = useSubscriptions();

  const upcoming = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    return subscriptions
      .filter(sub => {
        if (sub.status !== 'Ativa') return false;
        const nextBillingDate = new Date(sub.nextBillingDate);
        return nextBillingDate >= today && nextBillingDate <= thirtyDaysFromNow;
      })
      .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime())
      .slice(0, 5); // Show up to 5
  }, [subscriptions]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <ClayCard>
      <ClayCardHeader className="flex flex-row items-center justify-between pb-4">
        <ClayCardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5" />
          Próximas Assinaturas
        </ClayCardTitle>
        <Link to="/subscriptions">
          <ClayButton variant="ghost" size="sm">Ver todas</ClayButton>
        </Link>
      </ClayCardHeader>
      <ClayCardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ) : upcoming.length > 0 ? (
          <ul className="space-y-4">
            {upcoming.map(sub => (
              <li key={sub.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div>
                  <p className="font-medium">{sub.name}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(sub.nextBillingDate)}</p>
                </div>
                <p className="font-semibold text-primary">{formatCurrency(sub.amount)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground py-4">Nenhuma assinatura com vencimento nos próximos 30 dias.</p>
        )}
      </ClayCardContent>
    </ClayCard>
  );
};
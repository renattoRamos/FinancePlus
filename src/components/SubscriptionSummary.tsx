import { useMemo } from 'react';
import { Subscription } from '@/types/subscription';
import { ClayCard, ClayCardContent, ClayCardHeader, ClayCardTitle } from '@/components/ui/clay-card';
import { DollarSign, CalendarClock, TrendingUp } from 'lucide-react';

interface SubscriptionSummaryProps {
  subscriptions: Subscription[];
}

export const SubscriptionSummary = ({ subscriptions }: SubscriptionSummaryProps) => {
  const { monthlyCost, dueSoonCount, dueSoonAmount } = useMemo(() => {
    const activeSubs = subscriptions.filter(s => s.status === 'Ativa');

    const monthlyCost = activeSubs.reduce((total, sub) => {
      switch (sub.billingCycle) {
        case 'Mensal': return total + sub.amount;
        case 'Trimestral': return total + sub.amount / 3;
        case 'Semestral': return total + sub.amount / 6;
        case 'Anual': return total + sub.amount / 12;
        default: return total;
      }
    }, 0);

    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const dueSoonSubs = activeSubs.filter(sub => {
      const nextBillingDate = new Date(sub.nextBillingDate);
      return nextBillingDate >= today && nextBillingDate <= sevenDaysFromNow;
    });

    const dueSoonCount = dueSoonSubs.length;
    const dueSoonAmount = dueSoonSubs.reduce((total, sub) => total + sub.amount, 0);

    return { monthlyCost, dueSoonCount, dueSoonAmount };
  }, [subscriptions]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <ClayCard className="bg-gradient-accent">
      <ClayCardHeader>
        <ClayCardTitle className="text-accent-foreground">Resumo das Assinaturas</ClayCardTitle>
      </ClayCardHeader>
      <ClayCardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-accent-foreground">
          <div className="flex items-center gap-4">
            <div className="bg-accent-foreground/10 p-4 rounded-xl">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-accent-foreground/80">Custo Mensal (est.)</p>
              <p className="text-xl font-bold">{formatCurrency(monthlyCost)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-accent-foreground/10 p-4 rounded-xl">
              <CalendarClock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-accent-foreground/80">Próximos 7 dias</p>
              <p className="text-xl font-bold">{dueSoonCount} cobrança{dueSoonCount !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-accent-foreground/10 p-4 rounded-xl">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-accent-foreground/80">Total Próx. 7 dias</p>
              <p className="text-xl font-bold">{formatCurrency(dueSoonAmount)}</p>
            </div>
          </div>
        </div>
      </ClayCardContent>
    </ClayCard>
  );
};
import { useState, useMemo, useEffect } from 'react';
import { useDebts } from '@/contexts/DebtContext';
import { useSubscriptions } from '@/contexts/SubscriptionContext';
import { useCards } from '@/contexts/CardContext';
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { AnnualSpendChart } from '@/components/charts/AnnualSpendChart';
import { CategoryBreakdownChart } from '@/components/charts/CategoryBreakdownChart';
import { DebtTrendChart } from '@/components/charts/DebtTrendChart';
import { SubscriptionCategoryChart } from '@/components/charts/SubscriptionCategoryChart';
import { CardUsageChart } from '@/components/charts/CardUsageChart';
import { CreditCardLimitUsageChart } from '@/components/charts/CreditCardLimitUsageChart';
import { ClayCard, ClayCardContent, ClayCardHeader, ClayCardTitle } from '@/components/ui/clay-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Analytics = () => {
  const { allDebts, isLoading: isDebtsLoading } = useDebts();
  const { subscriptions, isLoading: isSubsLoading } = useSubscriptions();
  const { cards, isLoading: isCardsLoading } = useCards();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const availableYears = useMemo(() => {
    const years = new Set(Object.keys(allDebts).map(key => key.split(" de ")[1]));
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [allDebts]);

  const [selectedYear, setSelectedYear] = useState<string>(() => availableYears[0] || new Date().getFullYear().toString());

  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    } else if (availableYears.length === 0) {
      setSelectedYear(new Date().getFullYear().toString());
    }
  }, [availableYears, selectedYear]);

  const { annualData, categoryData, totalSpent, trendData } = useMemo(() => {
    const monthsOrder = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const currentYear = selectedYear;

    const yearDebts = Object.entries(allDebts)
      .filter(([key]) => key.endsWith(` de ${currentYear}`))
      .flatMap(([, debts]) => debts);

    const annualData = monthsOrder.map(monthName => {
      const monthKey = `${monthName} de ${currentYear}`;
      const debts = allDebts[monthKey] || [];
      const total = debts.reduce((sum, debt) => sum + debt.amount, 0);
      const pago = debts.filter(d => d.status === 'Pago').reduce((sum, debt) => sum + debt.amount, 0);
      return { month: monthName.substring(0, 3), total: total - pago, pago };
    });

    const trendData = monthsOrder.map(monthName => {
      const monthKey = `${monthName} de ${currentYear}`;
      const debts = allDebts[monthKey] || [];
      const total = debts.reduce((sum, debt) => sum + debt.amount, 0);
      return { month: monthName.substring(0, 3), total };
    });

    const categoryData: { [key: string]: number } = {};
    let totalSpent = 0;

    yearDebts.forEach(debt => {
      const category = debt.category || 'Outros';
      if (!categoryData[category]) {
        categoryData[category] = 0;
      }
      categoryData[category] += debt.amount;
      totalSpent += debt.amount;
    });

    const formattedCategoryData = Object.entries(categoryData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { annualData, categoryData: formattedCategoryData, totalSpent, trendData };
  }, [allDebts, selectedYear]);

  const { subscriptionCategoryData } = useMemo(() => {
    const activeSubs = subscriptions.filter(s => s.status === 'Ativa');
    const categoryData: { [key: string]: number } = {};

    activeSubs.forEach(sub => {
      const category = sub.category || 'Outros';
      if (!categoryData[category]) {
        categoryData[category] = 0;
      }
      
      let annualCost = 0;
      switch (sub.billingCycle) {
        case 'Mensal': annualCost = sub.amount * 12; break;
        case 'Trimestral': annualCost = sub.amount * 4; break;
        case 'Semestral': annualCost = sub.amount * 2; break;
        case 'Anual': annualCost = sub.amount; break;
      }
      categoryData[category] += annualCost;
    });

    return {
      subscriptionCategoryData: Object.entries(categoryData)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    };
  }, [subscriptions]);

  const { cardUsageData, activeCreditCards } = useMemo(() => {
    const creditCards = cards.filter(c => c.type === 'Crédito');
    
    const yearDebts = Object.entries(allDebts)
      .filter(([key]) => key.endsWith(` de ${selectedYear}`))
      .flatMap(([, debts]) => debts);

    const usage: { [key: string]: number } = {};

    yearDebts.forEach(debt => {
      if (debt.category === 'Cartão de Crédito' && debt.cardId) {
        if (!usage[debt.cardId]) {
          usage[debt.cardId] = 0;
        }
        usage[debt.cardId] += debt.amount;
      }
    });

    const formattedData = Object.entries(usage)
      .map(([cardId, total]) => {
        const card = cards.find(c => c.id === cardId);
        return {
          name: card ? card.name : 'Desconhecido',
          total,
        };
      })
      .sort((a, b) => b.total - a.total);

    return { cardUsageData: formattedData, activeCreditCards: creditCards.filter(c => c.status === 'Ativo') };
  }, [allDebts, cards, selectedYear]);

  const isLoading = isDebtsLoading || isSubsLoading || isCardsLoading;

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          <Sidebar
            isOpen={isSidebarOpen}
            onOpenChange={setIsSidebarOpen}
          />
          
          <div className="lg:col-span-3 space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
              {!isLoading && availableYears.length > 0 && (
                <div className="w-[150px]">
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="bg-input shadow-clay-soft border-border/50 rounded-xl">
                      <SelectValue placeholder="Selecione o ano" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map(year => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            {isLoading ? (
              <>
                <ClayCard><ClayCardHeader><Skeleton className="h-6 w-32 rounded" /></ClayCardHeader><ClayCardContent><Skeleton className="h-9 w-48 rounded" /></ClayCardContent></ClayCard>
                <Skeleton className="h-[420px] w-full rounded-3xl" />
                <Skeleton className="h-[420px] w-full rounded-3xl" />
                <Skeleton className="h-[420px] w-full rounded-3xl" />
                <Skeleton className="h-[420px] w-full rounded-3xl" />
              </>
            ) : availableYears.length === 0 && subscriptions.length === 0 && cards.length === 0 ? (
              <ClayCard>
                <ClayCardContent className="p-6 text-center text-muted-foreground">
                  <p>Nenhum dado disponível para análise.</p>
                  <p className="text-sm mt-1">Adicione dívidas, assinaturas ou cartões para ver os gráficos.</p>
                </ClayCardContent>
              </ClayCard>
            ) : (
              <>
                <ClayCard>
                  <ClayCardHeader><ClayCardTitle>Total Gasto em Dívidas ({selectedYear})</ClayCardTitle></ClayCardHeader>
                  <ClayCardContent><p className="text-3xl font-bold text-primary">R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></ClayCardContent>
                </ClayCard>

                <DebtTrendChart data={trendData} year={selectedYear} />
                <AnnualSpendChart data={annualData} year={selectedYear} />
                <CategoryBreakdownChart data={categoryData} year={selectedYear} />
                {subscriptionCategoryData.length > 0 && (
                  <SubscriptionCategoryChart data={subscriptionCategoryData} />
                )}
                {cardUsageData.length > 0 && (
                  <CardUsageChart data={cardUsageData} year={selectedYear} />
                )}
                {activeCreditCards.length > 0 && (
                  <CreditCardLimitUsageChart data={activeCreditCards} />
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
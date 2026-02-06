import { useMemo } from 'react';
import { Installment } from '@/types/installment';
import { ClayCard, ClayCardContent, ClayCardHeader, ClayCardTitle } from '@/components/ui/clay-card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, CalendarClock, TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InstallmentSummaryCardProps {
  installments: Installment[];
  isLoading: boolean;
}

export const InstallmentSummaryCard = ({ installments, isLoading }: InstallmentSummaryCardProps) => {
  const { totalActive, totalPendingAmount, nextDueInstallment } = useMemo(() => {
    const activeInstallments = installments.filter(i => i.status === 'Ativo' || i.status === 'Atrasado');

    const totalActive = activeInstallments.length;
    const totalPendingAmount = activeInstallments.reduce((sum, inst) => {
      const remainingInstallments = inst.totalInstallments - inst.paidInstallments;
      return sum + (remainingInstallments * inst.installmentAmount);
    }, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = activeInstallments
      .filter(inst => parseISO(inst.nextDueDate) >= today)
      .sort((a, b) => parseISO(a.nextDueDate).getTime() - parseISO(b.nextDueDate).getTime());

    const nextDueInstallment = upcoming.length > 0 ? upcoming[0] : null;

    return { totalActive, totalPendingAmount, nextDueInstallment };
  }, [installments]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  if (isLoading) {
    return (
      <ClayCard>
        <ClayCardHeader className="pb-4">
          <Skeleton className="h-6 w-40 rounded" />
        </ClayCardHeader>
        <ClayCardContent className="pt-0 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-4 w-12 rounded mb-2" />
              <Skeleton className="h-8 w-32 rounded" />
            </div>
            <div>
              <Skeleton className="h-4 w-12 rounded mb-2" />
              <Skeleton className="h-8 w-32 rounded" />
            </div>
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
        </ClayCardContent>
      </ClayCard>
    );
  }

  return (
    <ClayCard className="bg-gradient-accent p-4">
      <ClayCardHeader className="pb-4">
        <ClayCardTitle className="flex items-center gap-2 text-base sm:text-lg text-accent-foreground">
          <CalendarClock className="h-5 w-5" />
          Resumo de Parcelamentos
        </ClayCardTitle>
      </ClayCardHeader>
      <ClayCardContent className="p-4 pt-0 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-accent-foreground/10 p-4 rounded-xl">
              <DollarSign className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-accent-foreground/80">Pendente Total</p>
              <p className="text-xl font-bold text-accent-foreground">{formatCurrency(totalPendingAmount)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-accent-foreground/10 p-4 rounded-xl">
              <CalendarClock className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-accent-foreground/80">Ativos</p>
              <p className="text-xl font-bold text-accent-foreground">{totalActive}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-accent-foreground/10 p-4 rounded-xl">
              <TrendingUp className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-accent-foreground/80">Próximo Venc.</p>
              <p className="text-xl font-bold text-accent-foreground">
                {nextDueInstallment ? formatDate(nextDueInstallment.nextDueDate) : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </ClayCardContent>
    </ClayCard>
  );
};
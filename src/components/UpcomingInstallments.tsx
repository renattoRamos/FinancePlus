import { useMemo } from "react";
import { useInstallments } from "@/contexts/InstallmentContext";
import { ClayCard, ClayCardHeader, ClayCardTitle, ClayCardContent } from "@/components/ui/clay-card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarClock } from "lucide-react";
import { Link } from "react-router-dom";
import { ClayButton } from "./ui/clay-button";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const UpcomingInstallments = () => {
  const { installments, isLoading } = useInstallments();

  const upcoming = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    thirtyDaysFromNow.setHours(23, 59, 59, 999); // Normalize to end of day

    const allActiveInstallments = installments.filter(inst => {
      if (inst.status === 'Concluído' || inst.status === 'Cancelado') return false;
      const nextDueDate = parseISO(inst.nextDueDate);
      nextDueDate.setHours(0, 0, 0, 0); // Normalize to start of day
      return nextDueDate >= today && nextDueDate <= thirtyDaysFromNow;
    });

    return allActiveInstallments
      .sort((a, b) => parseISO(a.nextDueDate).getTime() - parseISO(b.nextDueDate).getTime())
      .slice(0, 5); // Show up to 5
  }, [installments]);

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <ClayCard>
      <ClayCardHeader className="flex flex-row items-center justify-between">
        <ClayCardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5" />
          Próximos Parcelamentos
        </ClayCardTitle>
        <Link to="/installments">
          <ClayButton variant="ghost" size="sm">Ver todos</ClayButton>
        </Link>
      </ClayCardHeader>
      <ClayCardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ) : upcoming.length > 0 ? (
          <ul className="space-y-4">
            {upcoming.map(inst => (
              <li key={inst.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div>
                  <p className="font-medium">{inst.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {inst.paidInstallments}/{inst.totalInstallments} ({formatDate(inst.nextDueDate)})
                  </p>
                </div>
                <p className="font-semibold text-primary">{formatCurrency(inst.installmentAmount)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground py-4">Nenhum parcelamento próximo do vencimento nos próximos 30 dias.</p>
        )}
      </ClayCardContent>
    </ClayCard>
  );
};
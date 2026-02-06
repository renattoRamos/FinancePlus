import { useMemo } from "react";
import { useDebts } from "@/contexts/DebtContext";
import { ClayCard, ClayCardHeader, ClayCardTitle, ClayCardContent } from "@/components/ui/clay-card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarClock } from "lucide-react";
import { Link } from "react-router-dom";
import { ClayButton } from "./ui/clay-button";
import { getBrazilTime } from "@/utils/date"; // Importando getBrazilTime

export const UpcomingDebts = () => {
  const { allDebts, isLoading } = useDebts();

  const upcoming = useMemo(() => {
    // Usar a data de Brasília para definir o 'hoje'
    const today = getBrazilTime();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    thirtyDaysFromNow.setHours(23, 59, 59, 999); // Normalize to end of day

    const allPendingDebts = Object.values(allDebts)
      .flat()
      .filter(debt => {
        // Explicitly check for 'Pendente' status and a valid due date
        if (debt.status !== 'Pendente' || !debt.dueDate) {
          return false;
        }

        // Ao criar a data a partir da string YYYY-MM-DD, ela é tratada como UTC 00:00:00
        // O fuso horário local é aplicado, mas como estamos comparando apenas o dia,
        // e o DB salva o dia correto (graças ao getDbDateString), a comparação funciona.
        const dueDate = new Date(debt.dueDate);
        dueDate.setHours(0, 0, 0, 0); // Normalize to start of day

        // Check if the due date is within the next 30 days
        return dueDate >= today && dueDate <= thirtyDaysFromNow;
      });

    return allPendingDebts
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5); // Show up to 5
  }, [allDebts]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <ClayCard>
      <ClayCardHeader className="flex flex-row items-center justify-between">
        <ClayCardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5" />
          Próximas Dívidas
        </ClayCardTitle>
        <Link to="/fixed-debts">
          <ClayButton variant="ghost" size="sm">Ver todas</ClayButton>
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
            {upcoming.map(debt => (
              <li key={debt.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div>
                  <p className="font-medium">{debt.name}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(debt.dueDate!)}</p>
                </div>
                <p className="font-semibold text-destructive">{formatCurrency(debt.amount)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground py-4">Nenhuma dívida pendente nos próximos 30 dias.</p>
        )}
      </ClayCardContent>
    </ClayCard>
  );
};
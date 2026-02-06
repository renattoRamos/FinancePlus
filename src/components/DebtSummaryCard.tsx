import { useMemo } from "react";
import { ClayCard, ClayCardHeader, ClayCardTitle, ClayCardContent } from "@/components/ui/clay-card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle } from "lucide-react";
import { Debt } from "@/types/debt";

interface DebtSummaryCardProps {
  debts: Debt[];
  isLoading: boolean;
  selectedMonth: string;
}

export const DebtSummaryCard = ({ debts, isLoading, selectedMonth }: DebtSummaryCardProps) => {
  const { totalAmount, paidAmount, allDebtsPaid } = useMemo(() => {
    const total = debts.reduce((sum, debt) => sum + debt.amount, 0);
    const paid = debts.filter(debt => debt.status === "Pago").reduce((sum, debt) => sum + debt.amount, 0);
    const allPaid = debts.length > 0 && debts.every(debt => debt.status === "Pago");
    return { totalAmount: total, paidAmount: paid, allDebtsPaid: allPaid };
  }, [debts]);

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
    <ClayCard className={`p-4 ${allDebtsPaid ? "bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30 animate-bounce-in" : "bg-gradient-accent"}`}>
      <ClayCardHeader className="pb-2">
        <ClayCardTitle className={`flex items-center gap-2 text-base sm:text-lg ${allDebtsPaid ? "text-green-700 dark:text-green-300" : "text-accent-foreground"}`}>
          Resumo de {selectedMonth}
          {allDebtsPaid && <CheckCircle className="h-5 w-5" />}
        </ClayCardTitle>
      </ClayCardHeader>
      <ClayCardContent className="p-4 pt-0">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className={`text-xs sm:text-sm ${allDebtsPaid ? "text-green-600/80 dark:text-green-400/80" : "text-accent-foreground/80"}`}>Total</p>
            <p className={`text-xl sm:text-2xl font-bold ${allDebtsPaid ? "text-green-700 dark:text-green-300" : "text-accent-foreground"}`}>
              R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className={`text-xs sm:text-sm ${allDebtsPaid ? "text-green-600/80 dark:text-green-400/80" : "text-accent-foreground/80"}`}>Pago</p>
            <p className={`text-xl sm:text-2xl font-bold ${allDebtsPaid ? "text-green-700 dark:text-green-300" : "text-accent-foreground"}`}>
              R$ {paidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className={`mt-2 sm:mt-4 rounded-xl p-4 ${allDebtsPaid ? "bg-green-500/10" : "bg-accent-foreground/10"}`}>
          <div className="flex justify-between items-center">
            <span className={`text-xs sm:text-sm ${allDebtsPaid ? "text-green-600/80 dark:text-green-400/80" : "text-accent-foreground/80"}`}>Progresso</span>
            <span className={`text-xs sm:text-sm font-medium ${allDebtsPaid ? "text-green-700 dark:text-green-300" : "text-accent-foreground"}`}>
              {totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0}%
            </span>
          </div>
          <div className={`mt-2 rounded-full h-2 ${allDebtsPaid ? "bg-green-500/20" : "bg-accent-foreground/20"}`}>
            <div
              className={`rounded-full h-2 transition-all duration-500 ${allDebtsPaid ? "bg-green-500" : "bg-accent-foreground"}`}
              style={{ width: `${totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0}%` }}
            />
          </div>
        </div>
      </ClayCardContent>
    </ClayCard>
  );
};
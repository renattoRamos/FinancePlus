import { useState, useEffect, useMemo, useRef } from "react";
import { ClayButton } from "@/components/ui/clay-button";
import { Plus, Bell } from "lucide-react";
import { Debt } from "@/types/debt";
import { ResponsiveDebtCard } from "./ResponsiveDebtCard";
import { DebtForm } from "./DebtForm";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { useToast } from "@/hooks/use-toast";
import { DebtListControls } from "./DebtListControls";
import { useDebts } from "@/contexts/DebtContext";
import { DebtCardSkeleton } from "./DebtCardSkeleton";
import { useDebtFilters } from "@/hooks/useDebtFilters";
import { DebtSummaryCard } from "./DebtSummaryCard";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { addDays, differenceInCalendarDays } from "date-fns";
import { formatDebtReport } from "@/utils/reportUtils";
import { FileText } from "lucide-react";

interface DebtDashboardProps {
  selectedMonth: string;
  hasMonths: boolean;
  allAvailableMonths: string[];
}

export const DebtDashboard = ({ selectedMonth, hasMonths, allAvailableMonths }: DebtDashboardProps) => {
  const { allDebts, saveDebt, deleteDebt, toggleDebtStatus, isLoading } = useDebts();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | undefined>(undefined);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [debtToDelete, setDebtToDelete] = useState<Debt | null>(null);
  const { toast } = useToast();
  const { settings } = useNotificationSettings();
  const congratulationsShown = useRef(new Set<string>());
  const notificationsShown = useRef(new Set<string>());

  const debts = useMemo(() => allDebts[selectedMonth] || [], [allDebts, selectedMonth]);
  const filterControls = useDebtFilters(debts);
  const { displayedDebts } = filterControls;

  useEffect(() => {
    if (isLoading || !settings.debtDue.enabled || debts.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reminderLimitDate = addDays(today, settings.debtDue.days);

    debts.forEach(debt => {
      const notificationKey = `debt-due-${debt.id}`;
      if (debt.status === "Pendente" && debt.dueDate && !notificationsShown.current.has(notificationKey)) {
        const dueDate = new Date(debt.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate >= today && dueDate <= reminderLimitDate) {
          const diffDays = differenceInCalendarDays(dueDate, today);
          toast({
            title: "⚠️ Dívida próxima do vencimento",
            description: `${debt.name} vence ${diffDays === 0 ? "hoje" : `em ${diffDays} dia${diffDays > 1 ? "s" : ""}`}`,
            duration: 5000,
          });
          notificationsShown.current.add(notificationKey);
        }
      }
    });
  }, [debts, isLoading, settings.debtDue, toast]);

  const handleSaveDebt = async (debtData: Omit<Debt, "id" | "dueDate"> & { id?: string; dueDay?: string }) => {
    await saveDebt(debtData, allAvailableMonths);
    setIsFormOpen(false);
    setEditingDebt(undefined);
  };

  const handleToggleStatus = async (id: string) => {
    await toggleDebtStatus(id, selectedMonth);
  };

  const handleDeleteRequest = (id: string) => {
    const debt = debts.find(d => d.id === id);
    if (debt) {
      setDebtToDelete(debt);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async (deleteAllMonths: boolean) => {
    if (!debtToDelete) return;
    await deleteDebt(debtToDelete, deleteAllMonths, selectedMonth);
    setIsDeleteModalOpen(false);
    setDebtToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDebtToDelete(null);
  };

  const handleEditDebt = (debt: Debt) => {
    setEditingDebt(debt);
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingDebt(undefined);
  };

  const handleExportReport = async () => {
    const reportText = formatDebtReport(displayedDebts, selectedMonth, filterControls.filterStatus);

    try {
      // 1. Copy to clipboard first while the document has focus
      await navigator.clipboard.writeText(reportText);

      // 2. If sharing is supported AND it's a mobile device, try to share
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (navigator.share && isMobile) {
        try {
          await navigator.share({
            title: `Dívidas - ${selectedMonth}`,
            text: reportText,
          });
          // If shared successfully, we don't need the "copied" toast
          return;
        } catch (shareErr) {
          // If aborted, just return (text is already in clipboard)
          if ((shareErr as Error).name === 'AbortError') return;
          console.error("Erro ao compartilhar: ", shareErr);
        }
      }

      // 3. Show success toast if share wasn't used or failed (text is in clipboard)
      toast({
        title: "✅ Relatório copiado!",
        description: "O relatório foi copiado para a área de transferência.",
        variant: "success",
      });
    } catch (err) {
      console.error("Erro ao exportar relatório: ", err);
      toast({
        title: "❌ Erro ao exportar",
        description: "Não foi possível copiar ou compartilhar o relatório.",
        variant: "destructive",
      });
    }
  };

  const allDebtsPaid = debts.length > 0 && debts.every(debt => debt.status === "Pago");

  useEffect(() => {
    if (allDebtsPaid && !congratulationsShown.current.has(selectedMonth)) {
      toast({
        title: "🎉 Parabéns!",
        description: `Todas as dívidas de ${selectedMonth} foram pagas!`,
        variant: "success",
        duration: 6000,
      });
      congratulationsShown.current.add(selectedMonth);
    }
  }, [allDebtsPaid, selectedMonth, toast]);

  const dueSoonCount = useMemo(() => {
    if (!settings.debtDue.enabled) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reminderLimitDate = addDays(today, settings.debtDue.days);

    return debts.filter(debt => {
      if (!debt.dueDate || debt.status === "Pago") return false;
      const dueDate = new Date(debt.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= today && dueDate <= reminderLimitDate;
    }).length;
  }, [debts, settings.debtDue]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="order-1 sm:order-2">
        <DebtSummaryCard debts={debts} isLoading={isLoading} selectedMonth={selectedMonth} />
      </div>

      <div className="order-2 sm:order-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Dívidas Fixas de {selectedMonth}
          </h1>
          {dueSoonCount > 0 && !isLoading && (
            <div className="flex items-center gap-2 mt-2 text-orange-600 dark:text-orange-400">
              <Bell className="h-4 w-4" />
              <span className="text-sm">
                {dueSoonCount} dívida{dueSoonCount > 1 ? "s" : ""} próxima{dueSoonCount > 1 ? "s" : ""} do vencimento
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <ClayButton
            variant="outline"
            onClick={handleExportReport}
            className="gap-2 w-full sm:w-auto"
            size="sm"
            disabled={!hasMonths || displayedDebts.length === 0}
            aria-label="Exportar relatório como texto"
          >
            <FileText className="h-4 w-4" />
            Exportar
          </ClayButton>
          <ClayButton
            variant="default"
            onClick={() => setIsFormOpen(true)}
            className="gap-2 w-full sm:w-auto"
            size="sm"
            disabled={!hasMonths}
          >
            <Plus className="h-4 w-4" />
            Nova Dívida
          </ClayButton>
        </div>
      </div>

      {!hasMonths && !isLoading && (
        <div className="text-center py-4 text-muted-foreground bg-muted/50 rounded-xl border border-border/50 animate-fade-in">
          <p className="text-base">Nenhum mês disponível para adicionar dívidas.</p>
          <p className="text-sm mt-2">Por favor, adicione um mês usando o botão "Adicionar Mês" na barra lateral.</p>
        </div>
      )}

      {hasMonths && (
        <>
          <div className="order-3">
            <DebtListControls {...filterControls} />
          </div>

          <div className="order-4 space-y-4 sm:space-y-4">
            {isLoading ? (
              <>
                <DebtCardSkeleton />
                <DebtCardSkeleton />
                <DebtCardSkeleton />
              </>
            ) : displayedDebts.length > 0 ? (
              displayedDebts.map((debt, index) => (
                <div key={debt.id} style={{ animationDelay: `${index * 0.05}s` }} className="animate-slide-up">
                  <ResponsiveDebtCard
                    debt={debt}
                    onToggleStatus={handleToggleStatus}
                    onEdit={handleEditDebt}
                    onDelete={handleDeleteRequest}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-8 sm:py-12 text-muted-foreground animate-fade-in">
                <p className="text-base sm:text-lg">Nenhuma dívida encontrada.</p>
                <p className="text-sm mt-2">Tente ajustar seus filtros ou adicione uma nova dívida.</p>
              </div>
            )}
          </div>
        </>
      )}

      <DebtForm
        debt={editingDebt}
        onSave={handleSaveDebt}
        onCancel={handleCancelForm}
        open={isFormOpen}
        allAvailableMonths={allAvailableMonths}
        selectedMonth={selectedMonth}
      />

      <DeleteConfirmModal
        open={isDeleteModalOpen}
        debt={debtToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};
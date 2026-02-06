import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { useInstallments } from "@/contexts/InstallmentContext";
import { ClayButton } from "@/components/ui/clay-button";
import { Plus } from "lucide-react";
import { InstallmentSummaryCard } from "@/components/InstallmentSummaryCard";
import { InstallmentListControls } from "@/components/InstallmentListControls";
import { ResponsiveInstallmentCard } from "@/components/ResponsiveInstallmentCard";
import { InstallmentForm } from "@/components/InstallmentForm";
import { DeleteInstallmentConfirmModal } from "@/components/DeleteInstallmentConfirmModal";
import { InstallmentCardSkeleton } from "@/components/InstallmentCardSkeleton";
import { useInstallmentFilters } from "@/hooks/useInstallmentFilters";
import { Installment } from "@/types/installment";
import { useToast } from "@/hooks/use-toast";
import { parseISO, addDays, differenceInCalendarDays } from "date-fns";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";

const NOTIFICATIONS_STORAGE_KEY = 'installment-notifications-shown';

const Installments = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { installments, isLoading, saveInstallment, deleteInstallment, markInstallmentAsPaid } = useInstallments();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInstallment, setEditingInstallment] = useState<Installment | undefined>(undefined);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [installmentToDelete, setInstallmentToDelete] = useState<Installment | null>(null);
  const { toast } = useToast();
  const { settings } = useNotificationSettings();

  const [notificationsShown, setNotificationsShown] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(Array.from(notificationsShown)));
    }
  }, [notificationsShown]);

  const filterControls = useInstallmentFilters(installments);
  const { displayedInstallments } = filterControls;

  useEffect(() => {
    if (isLoading || installments.length === 0 || !settings.installmentDue.enabled) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    installments.forEach(inst => {
      if (inst.status === 'Ativo') {
        const notificationKey = `due-soon-${inst.id}-${inst.nextDueDate}`;
        if (!notificationsShown.has(notificationKey)) {
          const nextDueDate = parseISO(inst.nextDueDate);
          nextDueDate.setHours(0, 0, 0, 0);
          const reminderLimitDate = addDays(today, settings.installmentDue.days);

          if (nextDueDate >= today && nextDueDate <= reminderLimitDate) {
            const diffDays = differenceInCalendarDays(nextDueDate, today);
            toast({
              title: "🔔 Lembrete de Parcela",
              description: `A próxima parcela de "${inst.name}" vence ${diffDays === 0 ? "hoje" : `em ${diffDays} dia(s)`}.`,
              duration: 6000,
            });
            setNotificationsShown(prev => new Set(prev).add(notificationKey));
          }
        }
      }
    });
  }, [installments, isLoading, toast, notificationsShown, settings]);

  const handleOpenForm = (installment?: Installment) => {
    setEditingInstallment(installment);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingInstallment(undefined);
  };

  const handleSave = async (installmentData: Omit<Installment, "id" | "installmentAmount" | "nextDueDate" | "paidInstallments" | "status"> & { id?: string }) => {
    await saveInstallment(installmentData);
    toast({
      title: "✅ Parcelamento Salvo!",
      description: `O parcelamento "${installmentData.name}" foi salvo com sucesso.`,
    });
    handleCloseForm();
  };

  const handleDeleteRequest = (id: string) => {
    const inst = installments.find(i => i.id === id);
    if (inst) {
      setInstallmentToDelete(inst);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!installmentToDelete) return;
    await deleteInstallment(installmentToDelete.id);
    toast({
      title: "🗑️ Parcelamento Deletado",
      description: `O parcelamento "${installmentToDelete.name}" foi removido.`,
    });
    setIsDeleteModalOpen(false);
    setInstallmentToDelete(null);
  };

  const handleMarkAsPaid = async (id: string, newPaidCount: number) => {
    await markInstallmentAsPaid(id, newPaidCount);
  };

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-2xl font-bold text-foreground">
                Meus Parcelamentos
              </h1>
              <ClayButton
                variant="default"
                onClick={() => handleOpenForm()}
                className="gap-2 w-full sm:w-auto"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Novo Parcelamento
              </ClayButton>
            </div>

            <InstallmentSummaryCard installments={installments} isLoading={isLoading} />

            <InstallmentListControls {...filterControls} />

            <div className="space-y-4">
              {isLoading ? (
                <>
                  <InstallmentCardSkeleton />
                  <InstallmentCardSkeleton />
                  <InstallmentCardSkeleton />
                </>
              ) : displayedInstallments.length > 0 ? (
                displayedInstallments.map((inst, index) => (
                  <div key={inst.id} style={{ animationDelay: `${index * 0.05}s` }} className="animate-slide-up">
                    <ResponsiveInstallmentCard
                      installment={inst}
                      onEdit={handleOpenForm}
                      onDelete={handleDeleteRequest}
                      onMarkAsPaid={handleMarkAsPaid}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg">Nenhum parcelamento encontrado.</p>
                  <p className="text-sm mt-1">Tente ajustar seus filtros ou adicione um novo parcelamento.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <InstallmentForm
        open={isFormOpen}
        onCancel={handleCloseForm}
        onSave={handleSave}
        installment={editingInstallment}
      />

      <DeleteInstallmentConfirmModal
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        installment={installmentToDelete}
      />
    </div>
  );
};

export default Installments;
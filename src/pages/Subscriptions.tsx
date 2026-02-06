import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { useSubscriptions } from "@/contexts/SubscriptionContext";
import { ClayButton } from "@/components/ui/clay-button";
import { Plus } from "lucide-react";
import { ResponsiveSubscriptionCard } from "@/components/ResponsiveSubscriptionCard";
import { Subscription } from "@/types/subscription";
import { Skeleton } from "@/components/ui/skeleton";
import { SubscriptionForm } from "@/components/SubscriptionForm";
import { DeleteSubscriptionConfirmModal } from "@/components/DeleteSubscriptionConfirmModal";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionFilters } from "@/hooks/useSubscriptionFilters";
import { SubscriptionSummary } from "@/components/SubscriptionSummary";
import { SubscriptionListControls } from "@/components/SubscriptionListControls";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { addDays, differenceInCalendarDays } from "date-fns";

const Subscriptions = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { subscriptions, isLoading, saveSubscription, deleteSubscription } = useSubscriptions();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | undefined>(undefined);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<Subscription | null>(null);
  const { toast } = useToast();
  const { settings } = useNotificationSettings();
  const notificationsShown = useRef(new Set<string>());

  const filterControls = useSubscriptionFilters(subscriptions);
  const { displayedSubscriptions } = filterControls;

  useEffect(() => {
    if (isLoading || !settings.subscriptionDue.enabled || subscriptions.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reminderLimitDate = addDays(today, settings.subscriptionDue.days);

    subscriptions.forEach(sub => {
      const notificationKey = `sub-due-${sub.id}`;
      if (sub.status === 'Ativa' && !notificationsShown.current.has(notificationKey)) {
        const nextBillingDate = new Date(sub.nextBillingDate);
        nextBillingDate.setHours(0, 0, 0, 0);

        if (nextBillingDate >= today && nextBillingDate <= reminderLimitDate) {
          const diffDays = differenceInCalendarDays(nextBillingDate, today);
          toast({
            title: "🔔 Lembrete de Assinatura",
            description: `Sua assinatura "${sub.name}" será cobrada ${diffDays === 0 ? "hoje" : `em ${diffDays} dia(s)`}.`,
            duration: 6000,
          });
          notificationsShown.current.add(notificationKey);
        }
      }
    });
  }, [subscriptions, isLoading, toast, settings.subscriptionDue]);

  const handleOpenForm = (subscription?: Subscription) => {
    setEditingSubscription(subscription);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSubscription(undefined);
  };

  const handleSave = async (subscriptionData: Omit<Subscription, "id"> & { id?: string }) => {
    await saveSubscription(subscriptionData);
    toast({
      title: "✅ Assinatura Salva!",
      description: `A assinatura "${subscriptionData.name}" foi salva com sucesso.`,
    });
    handleCloseForm();
  };

  const handleDeleteRequest = (id: string) => {
    const sub = subscriptions.find(s => s.id === id);
    if (sub) {
      setSubscriptionToDelete(sub);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!subscriptionToDelete) return;
    await deleteSubscription(subscriptionToDelete.id);
    toast({
      title: "🗑️ Assinatura Deletada",
      description: `A assinatura "${subscriptionToDelete.name}" foi removida.`,
    });
    setIsDeleteModalOpen(false);
    setSubscriptionToDelete(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />

      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 sm:gap-6">
          <Sidebar
            isOpen={isSidebarOpen}
            onOpenChange={setIsSidebarOpen}
          />

          <div className="lg:col-span-3 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <h1 className="text-2xl font-bold text-foreground">
                Minhas Assinaturas
              </h1>
              <ClayButton
                variant="default"
                onClick={() => handleOpenForm()}
                className="gap-4 w-full sm:w-auto"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Nova Assinatura
              </ClayButton>
            </div>

            {isLoading ? (
              <Skeleton className="h-[140px] w-full rounded-3xl" />
            ) : (
              <SubscriptionSummary subscriptions={subscriptions} />
            )}

            <SubscriptionListControls {...filterControls} />

            <div className="space-y-5">
              {isLoading ? (
                <>
                  <Skeleton className="h-40 w-full rounded-3xl" />
                  <Skeleton className="h-40 w-full rounded-3xl" />
                  <Skeleton className="h-40 w-full rounded-3xl" />
                </>
              ) : displayedSubscriptions.length > 0 ? (
                displayedSubscriptions.map((sub) => (
                  <ResponsiveSubscriptionCard
                    key={sub.id}
                    subscription={sub}
                    onEdit={handleOpenForm}
                    onDelete={handleDeleteRequest}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg">Nenhuma assinatura encontrada.</p>
                  <p className="text-sm mt-2">Tente ajustar seus filtros ou adicione uma nova assinatura.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <SubscriptionForm
        open={isFormOpen}
        onCancel={handleCloseForm}
        onSave={handleSave}
        subscription={editingSubscription}
      />

      <DeleteSubscriptionConfirmModal
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        subscription={subscriptionToDelete}
      />
    </div>
  );
};

export default Subscriptions;
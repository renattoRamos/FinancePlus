import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { useCards } from "@/contexts/CardContext";
import { ClayButton } from "@/components/ui/clay-button";
import { Plus } from "lucide-react";
import { ResponsiveCardCard } from "@/components/ResponsiveCardCard";
import { Card } from "@/types/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CardForm } from "@/components/CardForm";
import { DeleteCardConfirmModal } from "@/components/DeleteCardConfirmModal";
import { useToast } from "@/hooks/use-toast";

const Cards = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { cards, isLoading, saveCard, deleteCard } = useCards();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | undefined>(undefined);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<Card | null>(null);
  const { toast } = useToast();

  const handleOpenForm = (card?: Card) => {
    setEditingCard(card);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCard(undefined);
  };

  const handleSave = async (cardData: Omit<Card, "id"> & { id?: string }) => {
    await saveCard(cardData);
    toast({
      title: "✅ Cartão Salvo!",
      description: `O cartão "${cardData.name}" foi salvo com sucesso.`,
    });
    handleCloseForm();
  };

  const handleDeleteRequest = (id: string) => {
    const card = cards.find(c => c.id === id);
    if (card) {
      setCardToDelete(card);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!cardToDelete) return;
    await deleteCard(cardToDelete.id);
    toast({
      title: "🗑️ Cartão Deletado",
      description: `O cartão "${cardToDelete.name}" foi removido.`,
    });
    setIsDeleteModalOpen(false);
    setCardToDelete(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />

      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          <Sidebar isOpen={isSidebarOpen} onOpenChange={setIsSidebarOpen} />

          <div className="lg:col-span-3 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-2xl font-bold text-foreground">Meus Cartões</h1>
              <ClayButton
                variant="default"
                onClick={() => handleOpenForm()}
                className="gap-2 w-full sm:w-auto"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Novo Cartão
              </ClayButton>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-32 w-full rounded-3xl" />
                  <Skeleton className="h-32 w-full rounded-3xl" />
                  <Skeleton className="h-32 w-full rounded-3xl" />
                </>
              ) : cards.length > 0 ? (
                cards.map((card) => (
                  <ResponsiveCardCard
                    key={card.id}
                    card={card}
                    onEdit={handleOpenForm}
                    onDelete={handleDeleteRequest}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg">Nenhum cartão cadastrado.</p>
                  <p className="text-sm mt-1">Adicione seu primeiro cartão para começar.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <CardForm
        open={isFormOpen}
        onCancel={handleCloseForm}
        onSave={handleSave}
        card={editingCard}
      />

      <DeleteCardConfirmModal
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        card={cardToDelete}
      />
    </div>
  );
};

export default Cards;
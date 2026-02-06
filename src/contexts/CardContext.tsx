import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Card } from '@/types/card';
import { supabase } from '@/integrations/supabase/client';

interface CardContextType {
  cards: Card[];
  isLoading: boolean;
  saveCard: (cardData: Omit<Card, "id"> & { id?: string }) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  clearAllCards: () => Promise<void>;
}

const CardContext = createContext<CardContextType | undefined>(undefined);

export const CardProvider = ({ children }: { children: ReactNode }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching cards:", error);
        // Fallback to initial data or empty array if Supabase fails
        setCards([]);
      } else {
        // Map snake_case from DB to camelCase for client-side
        const formattedCards = (data as any[]).map(dbCard => ({
          id: dbCard.id,
          name: dbCard.name,
          lastFourDigits: dbCard.last_four_digits || '',
          flag: dbCard.flag,
          type: dbCard.type,
          issuer: dbCard.issuer,
          limit: dbCard.limit,
          balance: dbCard.balance,
          usedAmount: dbCard.used_amount,
          closingDay: dbCard.closing_day,
          dueDate: dbCard.due_date,
          status: dbCard.status,
        }));
        setCards(formattedCards as Card[]);
      }
      setIsLoading(false);
    };

    fetchCards();
  }, []);

  const saveCard = async (cardData: Omit<Card, "id"> & { id?: string }) => {
    const cardToSave = {
      name: cardData.name,
      last_four_digits: cardData.lastFourDigits, // Mapeado para snake_case
      flag: cardData.flag,
      type: cardData.type,
      issuer: cardData.issuer,
      limit: cardData.limit,
      balance: cardData.balance,
      used_amount: cardData.usedAmount, // Mapeado para snake_case
      closing_day: cardData.closingDay, // Mapeado para snake_case
      due_date: cardData.dueDate, // Mapeado para snake_case
      status: cardData.status,
    };

    if (cardData.id) {
      // Update existing card
      const { error } = await supabase
        .from('cards')
        .update(cardToSave)
        .eq('id', cardData.id);

      if (error) {
        console.error("Error updating card:", error);
      } else {
        setCards(prevCards => prevCards.map(card => card.id === cardData.id ? { ...card, ...cardData } as Card : card));
      }
    } else {
      // Insert new card
      const { data, error } = await supabase
        .from('cards')
        .insert(cardToSave)
        .select();

      if (error) {
        console.error("Error inserting card:", error);
      } else if (data && data.length > 0) {
        const newCard = data[0];
        setCards(prevCards => [...prevCards, {
          ...newCard,
          lastFourDigits: newCard.last_four_digits,
          usedAmount: newCard.used_amount,
          closingDay: newCard.closing_day,
          dueDate: newCard.due_date,
        } as Card]);
      }
    }
  };

  const deleteCard = async (cardId: string) => {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId);

    if (error) {
      console.error("Error deleting card:", error);
    } else {
      setCards(prevCards => prevCards.filter(card => card.id !== cardId));
    }
  };

  const clearAllCards = async () => {
    const { error } = await supabase.from('cards').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) console.error("Error clearing cards:", error);
    setCards([]);
  };

  const value = { cards, isLoading, saveCard, deleteCard, clearAllCards };

  return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
};

export const useCards = () => {
  const context = useContext(CardContext);
  if (context === undefined) {
    throw new Error('useCards must be used within a CardProvider');
  }
  return context;
};
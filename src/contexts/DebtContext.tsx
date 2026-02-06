import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Debt } from '@/types/debt';
import { supabase } from '@/integrations/supabase/client';
import { getDbDateString, getBrazilTime } from '@/utils/date'; // Importando utilitário de data
import { format } from 'date-fns'; // <-- Importação adicionada

interface DebtContextType {
  allDebts: Record<string, Debt[]>;
  isLoading: boolean;
  saveDebt: (debtData: Omit<Debt, "id" | "dueDate"> & { id?: string; dueDay?: string }, allMonthKeys: string[]) => Promise<void>;
  deleteDebt: (debtToDelete: Debt, deleteAllMonths: boolean, selectedMonth: string) => Promise<void>;
  toggleDebtStatus: (debtId: string, selectedMonth: string) => Promise<void>;
  addMonths: (monthKeys: string[]) => Promise<void>;
  deleteMonth: (monthKey: string) => Promise<void>;
  clearAllDebts: () => Promise<void>;
}

const DebtContext = createContext<DebtContextType | undefined>(undefined);

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const mapDbDebtToAppDebt = (dbDebt: any): Debt => ({
  id: dbDebt.id,
  name: dbDebt.name,
  amount: dbDebt.amount,
  status: dbDebt.status,
  dueDate: dbDebt.due_date,
  category: dbDebt.category,
  paidDate: dbDebt.paid_date,
  isRecurrent: dbDebt.is_recurrent,
  originalId: dbDebt.original_id,
  cardId: dbDebt.card_id,
  monthKey: dbDebt.month_key,
  recurrence: {
    type: dbDebt.recurrence_type,
    startMonth: dbDebt.recurrence_start_month,
    endMonth: dbDebt.recurrence_end_month,
  },
});

export const DebtProvider = ({ children }: { children: ReactNode }) => {
  const [allDebts, setAllDebts] = useState<Record<string, Debt[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllData = async () => {
    setIsLoading(true);
    
    const { data: monthsData, error: monthsError } = await supabase
      .from('months')
      .select('month_key');

    if (monthsError) console.error("Error fetching months:", monthsError);

    const initialMonths = monthsData ? monthsData.map(m => m.month_key) : [];
    const groupedDebts: Record<string, Debt[]> = {};
    initialMonths.forEach(key => { groupedDebts[key] = []; });

    const { data: debtsData, error: debtsError } = await supabase.from('debts').select('*');

    if (debtsError) {
      console.error("Error fetching debts:", debtsError);
    } else {
      (debtsData as any[]).forEach(dbDebt => {
        if (!groupedDebts[dbDebt.month_key]) groupedDebts[dbDebt.month_key] = [];
        groupedDebts[dbDebt.month_key].push(mapDbDebtToAppDebt(dbDebt));
      });
    }
    
    setAllDebts(groupedDebts);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const saveDebt = async (debtData: Omit<Debt, "id" | "dueDate"> & { id?: string; dueDay?: string }, allMonthKeys: string[]) => {
    if (debtData.id) { // Handle UPDATE
      const dueDate = getDbDateString(debtData.monthKey, debtData.dueDay!);
      const debtToUpdate = {
        name: debtData.name,
        amount: debtData.amount,
        status: debtData.status,
        due_date: dueDate,
        category: debtData.category,
        card_id: debtData.cardId,
      };
      const { error } = await supabase.from('debts').update(debtToUpdate).eq('id', debtData.id);
      if (error) console.error("Error updating debt:", error);
    } else { // Handle INSERT
      const isRecurrent = debtData.recurrence?.type === 'fixed' || debtData.recurrence?.type === 'ranged';
      let targetMonths: string[] = [];

      if (debtData.recurrence?.type === 'fixed') {
        targetMonths = allMonthKeys;
      } else if (debtData.recurrence?.type === 'ranged' && debtData.recurrence.startMonth && debtData.recurrence.endMonth) {
        const startIndex = allMonthKeys.indexOf(debtData.recurrence.startMonth);
        const endIndex = allMonthKeys.indexOf(debtData.recurrence.endMonth);
        if (startIndex > -1 && endIndex > -1 && startIndex <= endIndex) {
          targetMonths = allMonthKeys.slice(startIndex, endIndex + 1);
        }
      } else {
        targetMonths = [debtData.monthKey];
      }

      if (targetMonths.length === 0) return;

      const baseDebtPayload = {
        name: debtData.name,
        amount: debtData.amount,
        status: "Pendente",
        category: debtData.category,
        is_recurrent: isRecurrent,
        card_id: debtData.cardId,
        recurrence_type: debtData.recurrence?.type,
        recurrence_start_month: debtData.recurrence?.startMonth,
        recurrence_end_month: debtData.recurrence?.endMonth,
      };

      const { data: firstInsertData, error: firstInsertError } = await supabase
        .from('debts').insert({ ...baseDebtPayload, month_key: targetMonths[0], due_date: getDbDateString(targetMonths[0], debtData.dueDay!) }).select('id').single();

      if (firstInsertError || !firstInsertData) {
        console.error("Error inserting debt:", firstInsertError);
        return;
      }

      const originalId = firstInsertData.id;

      if (isRecurrent) {
        await supabase.from('debts').update({ original_id: originalId }).eq('id', originalId);
        const remainingDebtsPayload = targetMonths.slice(1).map(monthKey => ({ ...baseDebtPayload, month_key: monthKey, due_date: getDbDateString(monthKey, debtData.dueDay!), original_id: originalId }));
        if (remainingDebtsPayload.length > 0) {
          const { error: bulkInsertError } = await supabase.from('debts').insert(remainingDebtsPayload);
          if (bulkInsertError) console.error("Error inserting recurring debts:", bulkInsertError);
        }
      }
    }
    await fetchAllData();
  };

  const deleteDebt = async (debtToDelete: Debt, deleteAllMonths: boolean, selectedMonth: string) => {
    const originalId = debtToDelete.originalId || debtToDelete.id;
    if (deleteAllMonths && debtToDelete.isRecurrent) {
      const { error } = await supabase.from('debts').delete().or(`id.eq.${originalId},original_id.eq.${originalId}`);
      if (error) console.error("Error deleting recurring debts:", error);
    } else {
      const { error } = await supabase.from('debts').delete().eq('id', debtToDelete.id);
      if (error) console.error("Error deleting debt:", error);
    }
    await fetchAllData();
  };

  const toggleDebtStatus = async (debtId: string, selectedMonth: string) => {
    const originalDebts = { ...allDebts };
    const currentDebt = allDebts[selectedMonth]?.find(d => d.id === debtId);
    if (!currentDebt) return;

    const newStatus: Debt['status'] = currentDebt.status === "Pago" ? "Pendente" : "Pago";
    
    // Usar a data/hora de Brasília para o paidDate
    const newPaidDate = newStatus === "Pago" ? format(getBrazilTime(), 'yyyy-MM-dd') : null;

    // Optimistic update
    const updatedDebts = {
      ...allDebts,
      [selectedMonth]: allDebts[selectedMonth].map(d => 
        d.id === debtId ? { ...d, status: newStatus, paidDate: newPaidDate } : d
      ),
    };
    setAllDebts(updatedDebts);

    // Update Supabase in the background
    const { error } = await supabase
      .from('debts')
      .update({ status: newStatus, paid_date: newPaidDate })
      .eq('id', debtId);

    if (error) {
      console.error("Error toggling debt status:", error);
      // Revert on error
      setAllDebts(originalDebts);
      // Optionally, show a toast message to the user
    }
  };

  const addMonths = async (monthKeys: string[]) => {
    const newMonths = monthKeys.filter(key => !allDebts[key]);
    if (newMonths.length === 0) return;
    const { error } = await supabase.from('months').insert(newMonths.map(key => ({ month_key: key })));
    if (error) console.error("Error adding months:", error);
    else await fetchAllData();
  };

  const deleteMonth = async (monthKey: string) => {
    await supabase.from('debts').delete().eq('month_key', monthKey);
    await supabase.from('months').delete().eq('month_key', monthKey);
    await fetchAllData();
  };

  const clearAllDebts = async () => {
    const { error: debtsError } = await supabase.from('debts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (debtsError) console.error("Error clearing debts:", debtsError);
    
    const { error: monthsError } = await supabase.from('months').delete().neq('month_key', 'non-existent-key');
    if (monthsError) console.error("Error clearing months:", monthsError);

    setAllDebts({});
  };

  const value = { allDebts, isLoading, saveDebt, deleteDebt, toggleDebtStatus, addMonths, deleteMonth, clearAllDebts };

  return <DebtContext.Provider value={value}>{children}</DebtContext.Provider>;
};

export const useDebts = () => {
  const context = useContext(DebtContext);
  if (context === undefined) {
    throw new Error('useDebts must be used within a DebtProvider');
  }
  return context;
};
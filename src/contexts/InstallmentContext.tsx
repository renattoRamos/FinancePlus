import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Installment, InstallmentStatus } from '@/types/installment';
import { addMonths, isBefore, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { getBrazilTime } from '@/utils/date'; // Importando getBrazilTime

interface InstallmentContextType {
  installments: Installment[];
  isLoading: boolean;
  saveInstallment: (installmentData: Omit<Installment, "id" | "installmentAmount" | "nextDueDate" | "paidInstallments" | "status"> & { id?: string }) => Promise<void>;
  deleteInstallment: (installmentId: string) => Promise<void>;
  markInstallmentAsPaid: (installmentId: string, newPaidCount: number) => Promise<void>;
  clearAllInstallments: () => Promise<void>;
}

const InstallmentContext = createContext<InstallmentContextType | undefined>(undefined);

const calculateNextDueDate = (firstDueDate: string, paidInstallments: number): string => {
  const firstDate = parseISO(firstDueDate);
  const nextDate = addMonths(firstDate, paidInstallments);
  // Garantir que a data seja formatada como YYYY-MM-DD
  return format(nextDate, 'yyyy-MM-dd', { locale: ptBR });
};

const getInstallmentStatus = (installment: Installment): InstallmentStatus => {
  if (installment.paidInstallments >= installment.totalInstallments) {
    return 'Concluído';
  }
  
  // Usar a hora de Brasília para determinar o 'hoje'
  const today = getBrazilTime();
  today.setHours(0, 0, 0, 0); 
  
  const nextDue = parseISO(installment.nextDueDate);
  nextDue.setHours(0, 0, 0, 0);

  if (isBefore(nextDue, today)) {
    return 'Atrasado';
  }
  return 'Ativo';
};

export const InstallmentProvider = ({ children }: { children: ReactNode }) => {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInstallments = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('installments')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching installments:", error);
        setInstallments([]);
      } else {
        // Recalculate status and nextDueDate on load to ensure accuracy
        const updatedOnLoad = (data as any[]).map(dbInst => {
          const newNextDueDate = calculateNextDueDate(dbInst.first_due_date, dbInst.paid_installments);
          const tempInst = { 
            ...dbInst, 
            firstDueDate: dbInst.first_due_date,
            nextDueDate: newNextDueDate, 
            paidInstallments: dbInst.paid_installments,
            totalInstallments: dbInst.total_installments,
            totalAmount: dbInst.total_amount,
            installmentAmount: dbInst.installment_amount,
            paymentMethod: dbInst.payment_method,
            status: dbInst.status
          } as Installment;
          
          const newStatus = getInstallmentStatus(tempInst);

          return { 
            ...dbInst, 
            firstDueDate: dbInst.first_due_date, 
            nextDueDate: newNextDueDate, 
            paidInstallments: dbInst.paid_installments,
            totalInstallments: dbInst.total_installments,
            totalAmount: dbInst.total_amount,
            installmentAmount: dbInst.installment_amount,
            paymentMethod: dbInst.payment_method,
            status: newStatus 
          } as Installment;
        });
        setInstallments(updatedOnLoad);
      }
      setIsLoading(false);
    };

    fetchInstallments();
  }, []);

  const saveInstallment = async (installmentData: Omit<Installment, "id" | "installmentAmount" | "nextDueDate" | "paidInstallments" | "status"> & { id?: string }) => {
    const installmentAmount = parseFloat((installmentData.totalAmount / installmentData.totalInstallments).toFixed(2));
    const newNextDueDate = calculateNextDueDate(installmentData.firstDueDate, 0); // For new installments, 0 paid

    const baseInstallment = {
      name: installmentData.name,
      total_amount: installmentData.totalAmount,
      installment_amount: installmentAmount,
      total_installments: installmentData.totalInstallments,
      paid_installments: 0, // Always 0 for new or when editing base details
      first_due_date: installmentData.firstDueDate,
      next_due_date: newNextDueDate,
      category: installmentData.category,
      payment_method: installmentData.paymentMethod,
      status: getInstallmentStatus({ ...installmentData, paidInstallments: 0, installmentAmount, nextDueDate: newNextDueDate } as Installment),
      description: installmentData.description,
      card_id: installmentData.cardId,
    };

    if (installmentData.id) {
      // Update existing installment
      const { error } = await supabase
        .from('installments')
        .update(baseInstallment)
        .eq('id', installmentData.id);

      if (error) {
        console.error("Error updating installment:", error);
      } else {
        setInstallments(prevInstallments => prevInstallments.map(inst => {
          if (inst.id === installmentData.id) {
            const updatedInst = {
              ...inst,
              ...installmentData,
              installmentAmount: installmentAmount,
              nextDueDate: calculateNextDueDate(installmentData.firstDueDate, inst.paidInstallments),
            };
            return { ...updatedInst, status: getInstallmentStatus(updatedInst) };
          }
          return inst;
        }));
      }
    } else {
      // Insert new installment
      const { data, error } = await supabase
        .from('installments')
        .insert(baseInstallment)
        .select();

      if (error) {
        console.error("Error inserting installment:", error);
      } else if (data && data.length > 0) {
        const newInst = data[0];
        setInstallments(prevInstallments => [...prevInstallments, {
          ...newInst,
          firstDueDate: newInst.first_due_date,
          nextDueDate: newInst.next_due_date,
          paidInstallments: newInst.paid_installments,
          totalInstallments: newInst.total_installments,
          totalAmount: newInst.total_amount,
          installmentAmount: newInst.installment_amount,
          paymentMethod: newInst.payment_method,
        } as Installment]);
      }
    }
  };

  const deleteInstallment = async (installmentId: string) => {
    const { error } = await supabase
      .from('installments')
      .delete()
      .eq('id', installmentId);

    if (error) {
      console.error("Error deleting installment:", error);
    } else {
      setInstallments(prevInstallments => prevInstallments.filter(inst => inst.id !== installmentId));
    }
  };

  const markInstallmentAsPaid = async (installmentId: string, newPaidCount: number) => {
    const existingInst = installments.find(inst => inst.id === installmentId);
    if (!existingInst) return;

    const updatedPaidInstallments = Math.max(0, Math.min(newPaidCount, existingInst.totalInstallments));
    const newNextDueDate = calculateNextDueDate(existingInst.firstDueDate, updatedPaidInstallments);
    const newStatus = getInstallmentStatus({ ...existingInst, paidInstallments: updatedPaidInstallments, nextDueDate: newNextDueDate });

    const { error } = await supabase
      .from('installments')
      .update({ 
        paid_installments: updatedPaidInstallments, 
        next_due_date: newNextDueDate, 
        status: newStatus 
      })
      .eq('id', installmentId);

    if (error) {
      console.error("Error marking installment as paid:", error);
    } else {
      setInstallments(prevInstallments => prevInstallments.map(inst => {
        if (inst.id === installmentId) {
          return {
            ...inst,
            paidInstallments: updatedPaidInstallments,
            nextDueDate: newNextDueDate,
            status: newStatus,
          };
        }
        return inst;
      }));
    }
  };

  const clearAllInstallments = async () => {
    const { error } = await supabase.from('installments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) console.error("Error clearing installments:", error);
    setInstallments([]);
  };

  const value = { installments, isLoading, saveInstallment, deleteInstallment, markInstallmentAsPaid, clearAllInstallments };

  return <InstallmentContext.Provider value={value}>{children}</InstallmentContext.Provider>;
};

export const useInstallments = () => {
  const context = useContext(InstallmentContext);
  if (context === undefined) {
    throw new Error('useInstallments must be used within an InstallmentProvider');
  }
  return context;
};
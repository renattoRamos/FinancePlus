export type DebtCategory = "Moradia" | "Cartão de Crédito" | "Empréstimos" | "Boletos" | "Outros";
export type RecurrenceType = "none" | "fixed" | "ranged";

export interface Debt {
  id: string;
  name: string;
  amount: number;
  status: "Pago" | "Pendente";
  dueDate?: string; // Corresponds to due_date in DB
  category?: DebtCategory;
  recurrence?: {
    type: RecurrenceType; // Corresponds to recurrence_type in DB
    startMonth?: string; // Corresponds to recurrence_start_month in DB
    endMonth?: string; // Corresponds to recurrence_end_month in DB
  };
  paidDate?: string; // Corresponds to paid_date in DB
  isRecurrent?: boolean; // Corresponds to is_recurrent in DB
  originalId?: string; // Corresponds to original_id in DB
  cardId?: string; // Corresponds to card_id in DB
  monthKey: string; // Corresponds to month_key in DB
}
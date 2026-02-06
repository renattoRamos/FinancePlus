export type InstallmentCategory = "Compras" | "Serviços" | "Contratos" | "Educação" | "Saúde" | "Veículo" | "Outros";
export type InstallmentPaymentMethod = "Cartão de Crédito" | "Boleto" | "Débito Automático" | "Pix" | "Outro";
export type InstallmentStatus = "Ativo" | "Concluído" | "Atrasado" | "Cancelado";

export interface Installment {
  id: string;
  name: string;
  totalAmount: number; // Corresponds to total_amount in DB
  installmentAmount: number; // Corresponds to installment_amount in DB
  totalInstallments: number; // Corresponds to total_installments in DB
  paidInstallments: number; // Corresponds to paid_installments in DB
  firstDueDate: string; // Corresponds to first_due_date in DB
  nextDueDate: string; // Corresponds to next_due_date in DB
  category: InstallmentCategory;
  paymentMethod: InstallmentPaymentMethod; // Corresponds to payment_method in DB
  status: InstallmentStatus;
  description?: string;
  cardId?: string; // Corresponds to card_id in DB
}
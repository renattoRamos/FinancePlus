export type SubscriptionCategory = "Streaming" | "Software" | "Academia" | "Educação" | "Notícias" | "Outros";
export type BillingCycle = "Mensal" | "Trimestral" | "Semestral" | "Anual";
export type PaymentMethod = "Cartão de Crédito" | "Débito Automático" | "Boleto";
export type SubscriptionStatus = "Ativa" | "Pausada" | "Cancelada";

export interface Subscription {
  id: string;
  name: string;
  plan?: string;
  amount: number;
  category: SubscriptionCategory;
  billingCycle: BillingCycle; // Corresponds to billing_cycle in DB
  paymentMethod: PaymentMethod; // Corresponds to payment_method in DB
  status: SubscriptionStatus;
  nextBillingDate: string; // Corresponds to next_billing_date in DB
  startDate: string; // Corresponds to start_date in DB
}
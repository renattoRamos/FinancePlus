export type CardType = "Crédito" | "Débito" | "Alimentação" | "Outro";
export type CardFlag = "Visa" | "Mastercard" | "Elo" | "American Express" | "Hipercard" | "Outra";
export type CardStatus = "Ativo" | "Bloqueado" | "Expirado" | "Cancelado";

export interface Card {
  id: string;
  name: string; // Apelido do cartão
  lastFourDigits: string; // Corresponds to last_four_digits in DB
  flag: CardFlag;
  type: CardType;
  issuer: string; // Banco ou instituição financeira
  limit?: number; // Corresponds to "limit" in DB
  balance?: number;
  usedAmount?: number; // Corresponds to used_amount in DB
  closingDay?: number; // Corresponds to closing_day in DB
  dueDate?: number; // Corresponds to due_date in DB
  status: CardStatus;
}
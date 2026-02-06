import * as XLSX from 'xlsx';
import { Debt } from '@/types/debt';
import { Subscription } from '@/types/subscription';
import { Card } from '@/types/card';
import { Installment } from '@/types/installment';
import { format, parseISO } from 'date-fns';

interface ExportData {
  allDebts: Record<string, Debt[]>;
  subscriptions: Subscription[];
  cards: Card[];
  installments: Installment[];
}

export const exportToXLSX = ({ allDebts, subscriptions, cards, installments }: ExportData) => {
  const wb = XLSX.utils.book_new();

  // Helper function to format date or return empty string
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch (e) {
      console.error("Failed to parse date:", dateString, e);
      return dateString; // Return original if parsing fails
    }
  };

  // 1. Dívidas
  const allDebtsFlat = Object.entries(allDebts).flatMap(([month, debts]) => 
    debts.map(debt => ({
      Mês: month,
      Nome: debt.name,
      Valor: debt.amount,
      Status: debt.status,
      Categoria: debt.category || '',
      'Data de Vencimento': formatDate(debt.dueDate),
      'Data de Pagamento': formatDate(debt.paidDate),
      Recorrente: debt.isRecurrent ? 'Sim' : 'Não',
      'ID Original': debt.originalId || '',
      'ID Cartão': debt.cardId || '',
      'Tipo Recorrência': debt.recurrence?.type || '',
      'Mês Início Recorrência': debt.recurrence?.startMonth || '',
      'Mês Fim Recorrência': debt.recurrence?.endMonth || '',
    }))
  );
  if (allDebtsFlat.length > 0) {
    const wsDebts = XLSX.utils.json_to_sheet(allDebtsFlat);
    XLSX.utils.book_append_sheet(wb, wsDebts, "Dívidas");
  }

  // 2. Assinaturas
  const subscriptionsFormatted = subscriptions.map(sub => ({
    Nome: sub.name,
    Plano: sub.plan || '',
    Valor: sub.amount,
    Categoria: sub.category,
    'Ciclo de Cobrança': sub.billingCycle,
    'Método de Pagamento': sub.paymentMethod,
    Status: sub.status,
    'Próxima Cobrança': formatDate(sub.nextBillingDate),
    'Data de Início': formatDate(sub.startDate),
  }));
  if (subscriptionsFormatted.length > 0) {
    const wsSubscriptions = XLSX.utils.json_to_sheet(subscriptionsFormatted);
    XLSX.utils.book_append_sheet(wb, wsSubscriptions, "Assinaturas");
  }

  // 3. Cartões
  const cardsFormatted = cards.map(card => ({
    Apelido: card.name,
    'Últimos 4 Dígitos': card.lastFourDigits,
    Emissor: card.issuer,
    Tipo: card.type,
    Bandeira: card.flag,
    Status: card.status,
    Limite: card.limit || '',
    Saldo: card.balance || '',
    'Valor Utilizado': card.usedAmount || '',
    'Dia Fechamento': card.closingDay || '',
    'Dia Vencimento': card.dueDate || '',
  }));
  if (cardsFormatted.length > 0) {
    const wsCards = XLSX.utils.json_to_sheet(cardsFormatted);
    XLSX.utils.book_append_sheet(wb, wsCards, "Cartões");
  }

  // 4. Parcelamentos
  const installmentsFormatted = installments.map(inst => ({
    Nome: inst.name,
    'Valor Total': inst.totalAmount,
    'Valor Parcela': inst.installmentAmount,
    'Total Parcelas': inst.totalInstallments,
    'Parcelas Pagas': inst.paidInstallments,
    'Primeiro Vencimento': formatDate(inst.firstDueDate),
    'Próximo Vencimento': formatDate(inst.nextDueDate),
    Categoria: inst.category,
    'Método de Pagamento': inst.paymentMethod,
    Status: inst.status,
    Descrição: inst.description || '',
    'ID Cartão': inst.cardId || '',
  }));
  if (installmentsFormatted.length > 0) {
    const wsInstallments = XLSX.utils.json_to_sheet(installmentsFormatted);
    XLSX.utils.book_append_sheet(wb, wsInstallments, "Parcelamentos");
  }

  if (wb.SheetNames.length === 0) {
    const wsEmpty = XLSX.utils.json_to_sheet([{ Mensagem: "Nenhum dado disponível para exportação." }]);
    XLSX.utils.book_append_sheet(wb, wsEmpty, "Dados Vazios");
  }

  XLSX.writeFile(wb, "financas_backup.xlsx");
};
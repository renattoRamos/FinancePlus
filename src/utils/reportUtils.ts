import { Debt } from "@/types/debt";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export const formatDebtReport = (
    debts: Debt[],
    month: string,
    filterStatus: string
): string => {
    const statusLabel = filterStatus === "all" ? "Todas" : filterStatus;

    const totalAmount = debts.reduce((sum, debt) => sum + debt.amount, 0);
    const paidAmount = debts
        .filter((debt) => debt.status === "Pago")
        .reduce((sum, debt) => sum + debt.amount, 0);
    const pendingAmount = totalAmount - paidAmount;

    const header = `*DÍVIDAS - ${month.toUpperCase()}*\n\n`;
    const filterInfo = `Status: ${statusLabel}\n\n`;

    const debtLines = debts
        .map((debt) => {
            const dateStr = debt.dueDate
                ? format(parseISO(debt.dueDate), "dd/MM/yyyy")
                : "--/--/----";
            const statusIcon = debt.status === "Pago" ? "✅" : "❌";
            const amountStr = debt.amount.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });

            return `* ${dateStr} - ${debt.name}: ${amountStr} ${statusIcon}`;
        })
        .join("\n");

    const summary = `\n\nTotal de Dívidas Listadas: ${totalAmount.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
    })}\nTotal Pago: ${paidAmount.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
    })}\nTotal Devedor: ${pendingAmount.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
    })}`;

    return `${header}${filterInfo}${debtLines}${summary}`;
};

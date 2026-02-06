import { useState, useEffect } from "react";
import { ClayButton } from "@/components/ui/clay-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Debt, DebtCategory, RecurrenceType } from "@/types/debt";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useCards } from "@/contexts/CardContext";

const DEBT_CATEGORIES: DebtCategory[] = [
  "Moradia",
  "Cartão de Crédito",
  "Empréstimos",
  "Boletos",
  "Outros"
];

interface DebtFormProps {
  debt?: Debt;
  onSave: (debt: Omit<Debt, "id" | "dueDate"> & { id?: string; dueDay?: string }) => void;
  onCancel: () => void;
  open: boolean;
  allAvailableMonths: string[];
  selectedMonth: string;
}

export const DebtForm = ({ debt, onSave, onCancel, open, allAvailableMonths, selectedMonth }: DebtFormProps) => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [category, setCategory] = useState<DebtCategory>("Outros");
  const [debtType, setDebtType] = useState<"single" | "fixed" | "ranged">("single");
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [cardId, setCardId] = useState<string>("none"); // Inicializado como "none" para evitar string vazia
  const [errors, setErrors] = useState<{ name?: string; amount?: string; recurrence?: string; dueDay?: string }>({});
  const { toast } = useToast();
  const { cards } = useCards();

  const creditCards = cards.filter(c => c.type === "Crédito" && c.status === "Ativo");

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers === '') return '';
    const amountValue = parseInt(numbers);
    return (amountValue / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  useEffect(() => {
    if (open) {
      const isEditing = !!debt;
      setName(debt?.name || "");
      setAmount(debt?.amount ? debt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : "");
      setDueDay(debt?.dueDate ? new Date(debt.dueDate + 'T00:00:00').getUTCDate().toString() : "");
      setCategory(debt?.category || "Outros");
      // Se houver um cardId, use-o. Caso contrário, use "none".
      setCardId(debt?.cardId || "none");

      // When editing, we can only edit a single instance, so type is always 'single'
      setDebtType(isEditing ? "single" : "single");
      setStartMonth(isEditing ? "" : selectedMonth);
      setEndMonth(isEditing ? "" : selectedMonth);

      setErrors({});
    }
  }, [open, debt, selectedMonth]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatCurrency(inputValue);
    setAmount(formatted);
  };

  const validateForm = () => {
    const newErrors: { name?: string; amount?: string; recurrence?: string; dueDay?: string } = {};

    if (!name.trim()) newErrors.name = "O nome da dívida é obrigatório.";
    const numericAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.')) || 0;
    if (numericAmount <= 0) newErrors.amount = "O valor deve ser maior que zero.";
    if (!dueDay) newErrors.dueDay = "O dia do vencimento é obrigatório.";
    const day = parseInt(dueDay);
    if (isNaN(day) || day < 1 || day > 31) newErrors.dueDay = "O dia deve ser entre 1 e 31.";

    if (debtType === "ranged") {
      if (!startMonth || !endMonth) {
        newErrors.recurrence = "Selecione o mês inicial e final.";
      } else {
        const startIndex = allAvailableMonths.indexOf(startMonth);
        const endIndex = allAvailableMonths.indexOf(endMonth);
        if (startIndex > endIndex) {
          newErrors.recurrence = "O mês final não pode ser anterior ao mês inicial.";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        title: "Formulário Inválido",
        description: "Por favor, corrija os erros antes de salvar.",
        variant: "destructive",
      });
      return;
    }

    const numericAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.')) || 0;
    const isRecurrent = debtType === 'fixed' || debtType === 'ranged';

    // Se cardId for "none", ele deve ser salvo como undefined/null no DB
    const finalCardId = cardId === "none" ? undefined : cardId;

    onSave({
      ...(debt?.id && { id: debt.id }),
      name: name.trim(),
      amount: numericAmount,
      status: debt?.status || "Pendente",
      category,
      isRecurrent,
      recurrence: {
        type: isRecurrent ? debtType : 'none',
        ...(debtType === "ranged" && { startMonth, endMonth })
      },
      dueDay,
      ...(category === "Cartão de Crédito" && finalCardId && { cardId: finalCardId }),
      monthKey: selectedMonth,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{debt ? "Editar Dívida" : "Nova Dívida"}</DialogTitle>
          <DialogDescription>
            {debt ? "Edite os detalhes da sua dívida." : "Preencha as informações para adicionar uma nova dívida."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto p-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da dívida</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={17} />
            {errors.name && <p className="text-sm text-destructive mt-2">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (BRL)</Label>
              <Input id="amount" value={amount} onChange={handleAmountChange} placeholder="R$ 0,00" />
              {errors.amount && <p className="text-sm text-destructive mt-2">{errors.amount}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDay">Dia do Vencimento</Label>
              <Select value={dueDay} onValueChange={setDueDay}>
                <SelectTrigger><SelectValue placeholder="Dia" /></SelectTrigger>
                ...
                {errors.dueDay && <p className="text-sm text-destructive mt-2">{errors.dueDay}</p>}
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.dueDay && <p className="text-sm text-destructive mt-2">{errors.dueDay}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={(value: DebtCategory) => setCategory(value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DEBT_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {category === "Cartão de Crédito" && creditCards.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="card">Cartão de Crédito</Label>
              <Select value={cardId} onValueChange={setCardId}>
                <SelectTrigger><SelectValue placeholder="Selecione o cartão" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {creditCards.map(card => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.name} (final {card.lastFourDigits})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {!debt && (
            <div className="space-y-2">
              <Label htmlFor="debtType">Tipo da Dívida</Label>
              <Select value={debtType} onValueChange={(v: "single" | "fixed" | "ranged") => setDebtType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Dívida Única (apenas neste mês)</SelectItem>
                  <SelectItem value="fixed">Fixa (em todos os meses existentes)</SelectItem>
                  <SelectItem value="ranged">Prazo Determinado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {debtType === "ranged" && !debt && (
            <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="startMonth">Mês Inicial</Label>
                <Select value={startMonth} onValueChange={setStartMonth}>
                  <SelectTrigger><SelectValue placeholder="Selecione o mês" /></SelectTrigger>
                  <SelectContent>{allAvailableMonths.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endMonth">Mês Final</Label>
                <Select value={endMonth} onValueChange={setEndMonth}>
                  <SelectTrigger><SelectValue placeholder="Selecione o mês" /></SelectTrigger>
                  <SelectContent>{allAvailableMonths.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {errors.recurrence && <p className="text-sm text-destructive mt-2">{errors.recurrence}</p>}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <ClayButton type="button" variant="outline" onClick={onCancel} className="flex-1">Cancelar</ClayButton>
            <ClayButton type="submit" variant="default" className="flex-1">{debt ? "Salvar" : "Adicionar"}</ClayButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
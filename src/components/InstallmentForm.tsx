import { useState, useEffect } from "react";
import { ClayButton } from "@/components/ui/clay-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Installment, InstallmentCategory, InstallmentPaymentMethod } from "@/types/installment";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useCards } from "@/contexts/CardContext";
import { format } from "date-fns";

const CATEGORIES: InstallmentCategory[] = ["Compras", "Serviços", "Contratos", "Educação", "Saúde", "Veículo", "Outros"];
const PAYMENT_METHODS: InstallmentPaymentMethod[] = ["Cartão de Crédito", "Boleto", "Débito Automático", "Pix", "Outro"];

interface InstallmentFormProps {
  installment?: Installment;
  onSave: (installment: Omit<Installment, "id" | "installmentAmount" | "nextDueDate" | "paidInstallments" | "status"> & { id?: string }) => void;
  onCancel: () => void;
  open: boolean;
}

export const InstallmentForm = ({ installment, onSave, onCancel, open }: InstallmentFormProps) => {
  const [name, setName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [totalInstallments, setTotalInstallments] = useState("");
  const [firstDueDate, setFirstDueDate] = useState("");
  const [category, setCategory] = useState<InstallmentCategory>("Outros");
  const [paymentMethod, setPaymentMethod] = useState<InstallmentPaymentMethod>("Outro");
  const [cardId, setCardId] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ name?: string; totalAmount?: string; totalInstallments?: string; firstDueDate?: string }>({});
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
      setName(installment?.name || "");
      setTotalAmount(installment?.totalAmount ? installment.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : "");
      setTotalInstallments(installment?.totalInstallments.toString() || "");
      setFirstDueDate(installment?.firstDueDate || format(new Date(), 'yyyy-MM-dd'));
      setCategory(installment?.category || "Outros");
      setPaymentMethod(installment?.paymentMethod || "Outro");
      setCardId(installment?.cardId || undefined);
      setDescription(installment?.description || "");
      setErrors({});
    }
  }, [open, installment]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatCurrency(inputValue);
    setTotalAmount(formatted);
  };

  const validateForm = () => {
    const newErrors: { name?: string; totalAmount?: string; totalInstallments?: string; firstDueDate?: string } = {};
    if (!name.trim()) newErrors.name = "O nome é obrigatório.";
    const numericTotalAmount = parseFloat(totalAmount.replace(/\./g, '').replace(',', '.')) || 0;
    if (numericTotalAmount <= 0) newErrors.totalAmount = "O valor total deve ser maior que zero.";
    const numInstallments = parseInt(totalInstallments);
    if (isNaN(numInstallments) || numInstallments <= 0) newErrors.totalInstallments = "O número de parcelas deve ser maior que zero.";
    if (!firstDueDate) newErrors.firstDueDate = "A data da primeira parcela é obrigatória.";
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

    const numericTotalAmount = parseFloat(totalAmount.replace(/\./g, '').replace(',', '.')) || 0;
    const numInstallments = parseInt(totalInstallments);

    onSave({
      ...(installment?.id && { id: installment.id }),
      name: name.trim(),
      totalAmount: numericTotalAmount,
      totalInstallments: numInstallments,
      firstDueDate,
      category,
      paymentMethod,
      ...(paymentMethod === "Cartão de Crédito" && cardId && { cardId }),
      description: description.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{installment ? "Editar Parcelamento" : "Novo Parcelamento"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto p-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Parcelamento</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: TV Samsung, Curso de Inglês" />
            {errors.name && <p className="text-sm text-destructive mt-2">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalAmount">Valor Total (BRL)</Label>
            <Input id="totalAmount" value={totalAmount} onChange={handleAmountChange} placeholder="0,00" />
            {errors.totalAmount && <p className="text-sm text-destructive mt-2">{errors.totalAmount}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalInstallments">Número de Parcelas</Label>
            <Input id="totalInstallments" type="number" value={totalInstallments} onChange={(e) => setTotalInstallments(e.target.value)} placeholder="Ex: 12" />
            {errors.totalInstallments && <p className="text-sm text-destructive mt-2">{errors.totalInstallments}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstDueDate">Data da Primeira Parcela</Label>
            <Input id="firstDueDate" type="date" value={firstDueDate} onChange={(e) => setFirstDueDate(e.target.value)} />
            {errors.firstDueDate && <p className="text-sm text-destructive mt-2">{errors.firstDueDate}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={(v: InstallmentCategory) => setCategory(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
            <Select value={paymentMethod} onValueChange={(v: InstallmentPaymentMethod) => setPaymentMethod(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {paymentMethod === "Cartão de Crédito" && creditCards.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="card">Cartão de Crédito</Label>
              <Select value={cardId} onValueChange={setCardId}>
                <SelectTrigger className="bg-input shadow-clay-soft border-border/50 rounded-xl">
                  <SelectValue placeholder="Selecione o cartão" />
                </SelectTrigger>
                <SelectContent>
                  {creditCards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.name} (final {card.lastFourDigits})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes adicionais" />
          </div>
          <div className="flex gap-2 pt-4">
            <ClayButton type="button" variant="outline" onClick={onCancel} className="flex-1">Cancelar</ClayButton>
            <ClayButton type="submit" className="flex-1">{installment ? "Salvar" : "Adicionar"}</ClayButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
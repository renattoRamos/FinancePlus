import { useState, useEffect } from "react";
import { ClayButton } from "@/components/ui/clay-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Subscription, SubscriptionCategory, BillingCycle, PaymentMethod, SubscriptionStatus } from "@/types/subscription";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"; // Import DialogDescription
import { useToast } from "@/hooks/use-toast";

const CATEGORIES: SubscriptionCategory[] = ["Streaming", "Software", "Academia", "Educação", "Notícias", "Outros"];
const BILLING_CYCLES: BillingCycle[] = ["Mensal", "Trimestral", "Semestral", "Anual"];
const PAYMENT_METHODS: PaymentMethod[] = ["Cartão de Crédito", "Débito Automático", "Boleto"];
const STATUSES: SubscriptionStatus[] = ["Ativa", "Pausada", "Cancelada"];

interface SubscriptionFormProps {
  subscription?: Subscription;
  onSave: (subscription: Omit<Subscription, "id"> & { id?: string }) => void;
  onCancel: () => void;
  open: boolean;
}

export const SubscriptionForm = ({ subscription, onSave, onCancel, open }: SubscriptionFormProps) => {
  const [name, setName] = useState("");
  const [plan, setPlan] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<SubscriptionCategory>("Outros");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("Mensal");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cartão de Crédito");
  const [status, setStatus] = useState<SubscriptionStatus>("Ativa");
  const [nextBillingDate, setNextBillingDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [errors, setErrors] = useState<{ name?: string; amount?: string; nextBillingDate?: string; startDate?: string }>({});
  const { toast } = useToast();

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
      setName(subscription?.name || "");
      setPlan(subscription?.plan || "");
      setAmount(subscription?.amount ? subscription.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : "");
      setCategory(subscription?.category || "Outros");
      setBillingCycle(subscription?.billingCycle || "Mensal");
      setPaymentMethod(subscription?.paymentMethod || "Cartão de Crédito");
      setStatus(subscription?.status || "Ativa");
      setNextBillingDate(subscription?.nextBillingDate || "");
      setStartDate(subscription?.startDate || "");
      setErrors({});
    }
  }, [open, subscription]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatCurrency(inputValue);
    setAmount(formatted);
  };

  const validateForm = () => {
    const newErrors: { name?: string; amount?: string; nextBillingDate?: string; startDate?: string } = {};
    if (!name.trim()) newErrors.name = "O nome é obrigatório.";
    const numericAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.')) || 0;
    if (numericAmount <= 0) newErrors.amount = "O valor deve ser maior que zero.";
    if (!nextBillingDate) newErrors.nextBillingDate = "A próxima data de cobrança é obrigatória.";
    if (!startDate) newErrors.startDate = "A data de início é obrigatória.";
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

    onSave({
      ...(subscription?.id && { id: subscription.id }),
      name: name.trim(),
      plan: plan.trim(),
      amount: numericAmount,
      category,
      billingCycle,
      paymentMethod,
      status,
      nextBillingDate,
      startDate,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{subscription ? "Editar Assinatura" : "Nova Assinatura"}</DialogTitle>
          <DialogDescription>
            {subscription ? "Edite os detalhes da sua assinatura." : "Adicione uma nova assinatura para acompanhar seus gastos recorrentes."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto p-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Assinatura</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Netflix" />
            {errors.name && <p className="text-sm text-destructive mt-2">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan">Plano (opcional)</Label>
            <Input id="plan" value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="Ex: Premium" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (BRL)</Label>
            <Input id="amount" value={amount} onChange={handleAmountChange} placeholder="0,00" />
            {errors.amount && <p className="text-sm text-destructive mt-2">{errors.amount}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={(v: SubscriptionCategory) => setCategory(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="billingCycle">Ciclo de Cobrança</Label>
            <Select value={billingCycle} onValueChange={(v: BillingCycle) => setBillingCycle(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{BILLING_CYCLES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
            <Select value={paymentMethod} onValueChange={(v: PaymentMethod) => setPaymentMethod(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(v: SubscriptionStatus) => setStatus(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">Data de Início</Label>
            <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            {errors.startDate && <p className="text-sm text-destructive mt-2">{errors.startDate}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="nextBillingDate">Próxima Cobrança</Label>
            <Input id="nextBillingDate" type="date" value={nextBillingDate} onChange={(e) => setNextBillingDate(e.target.value)} />
            {errors.nextBillingDate && <p className="text-sm text-destructive mt-2">{errors.nextBillingDate}</p>}
          </div>
          <div className="flex gap-2 pt-4">
            <ClayButton type="button" variant="outline" onClick={onCancel} className="flex-1">Cancelar</ClayButton>
            <ClayButton type="submit" className="flex-1">{subscription ? "Salvar" : "Adicionar"}</ClayButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
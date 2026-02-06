import { useState, useEffect } from "react";
import { ClayButton } from "@/components/ui/clay-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardType, CardFlag, CardStatus } from "@/types/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const TYPES: CardType[] = ["Crédito", "Débito", "Alimentação", "Outro"];
const FLAGS: CardFlag[] = ["Visa", "Mastercard", "Elo", "American Express", "Hipercard", "Outra"];
const STATUSES: CardStatus[] = ["Ativo", "Bloqueado", "Expirado", "Cancelado"];

interface CardFormProps {
  card?: Card;
  onSave: (card: Omit<Card, "id"> & { id?: string }) => void;
  onCancel: () => void;
  open: boolean;
}

export const CardForm = ({ card, onSave, onCancel, open }: CardFormProps) => {
  const [name, setName] = useState("");
  const [lastFourDigits, setLastFourDigits] = useState("");
  const [issuer, setIssuer] = useState("");
  const [type, setType] = useState<CardType>("Crédito");
  const [flag, setFlag] = useState<CardFlag>("Mastercard");
  const [status, setStatus] = useState<CardStatus>("Ativo");
  const [limit, setLimit] = useState("");
  const [balance, setBalance] = useState("");
  const [usedAmount, setUsedAmount] = useState("");
  const [closingDay, setClosingDay] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [errors, setErrors] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setName(card?.name || "");
      setLastFourDigits(card?.lastFourDigits || "");
      setIssuer(card?.issuer || "");
      setType(card?.type || "Crédito");
      setFlag(card?.flag || "Mastercard");
      setStatus(card?.status || "Ativo");
      setLimit(card?.limit?.toString() || "");
      setBalance(card?.balance?.toString() || "");
      setUsedAmount(card?.usedAmount?.toString() || "");
      setClosingDay(card?.closingDay?.toString() || "");
      setDueDate(card?.dueDate?.toString() || "");
      setErrors({});
    }
  }, [open, card]);

  const validateForm = () => {
    const newErrors: any = {};
    if (!name.trim()) newErrors.name = "O apelido é obrigatório.";
    if (!lastFourDigits.match(/^\d{4}$/)) newErrors.lastFourDigits = "Deve conter 4 dígitos.";
    if (!issuer.trim()) newErrors.issuer = "O emissor é obrigatório.";
    if (type === 'Crédito' && (!limit || +limit <= 0)) newErrors.limit = "Limite deve ser positivo.";
    if ((type === 'Débito' || type === 'Alimentação') && !balance) newErrors.balance = "Saldo é obrigatório.";
    if (closingDay && (+closingDay < 1 || +closingDay > 31)) newErrors.closingDay = "Dia inválido.";
    if (dueDate && (+dueDate < 1 || +dueDate > 31)) newErrors.dueDate = "Dia inválido.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({ title: "Formulário Inválido", description: "Corrija os erros.", variant: "destructive" });
      return;
    }
    onSave({
      ...(card?.id && { id: card.id }),
      name: name.trim(),
      lastFourDigits,
      issuer: issuer.trim(),
      type,
      flag,
      status,
      ...(type === 'Crédito' && { limit: +limit }),
      ...((type === 'Débito' || type === 'Alimentação') && { balance: +balance }),
      ...((type === 'Crédito' || type === 'Alimentação') && { usedAmount: +usedAmount || 0 }),
      ...(closingDay && { closingDay: +closingDay }),
      ...(dueDate && { dueDate: +dueDate }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{card ? "Editar Cartão" : "Novo Cartão"}</DialogTitle>
          <DialogDescription>
            {card ? "Edite os detalhes do seu cartão." : "Adicione um novo cartão para gerenciar suas finanças."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto p-2">
          <div className="space-y-2">
            <Label htmlFor="name">Apelido do Cartão</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastFourDigits">Últimos 4 dígitos</Label>
              <Input id="lastFourDigits" value={lastFourDigits} onChange={e => setLastFourDigits(e.target.value)} />
              {errors.lastFourDigits && <p className="text-sm text-destructive">{errors.lastFourDigits}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="issuer">Emissor (Banco)</Label>
              <Input id="issuer" value={issuer} onChange={e => setIssuer(e.target.value)} />
              {errors.issuer && <p className="text-sm text-destructive">{errors.issuer}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v: CardType) => setType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Bandeira</Label>
              <Select value={flag} onValueChange={(v: CardFlag) => setFlag(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FLAGS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          {type === 'Crédito' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="limit">Limite Total</Label>
                  <Input id="limit" type="number" value={limit} onChange={e => setLimit(e.target.value)} />
                  {errors.limit && <p className="text-sm text-destructive">{errors.limit}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usedAmount">Valor Utilizado</Label>
                  <Input id="usedAmount" type="number" value={usedAmount} onChange={e => setUsedAmount(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="closingDay">Fechamento (dia)</Label>
                  <Input id="closingDay" type="number" value={closingDay} onChange={e => setClosingDay(e.target.value)} />
                  {errors.closingDay && <p className="text-sm text-destructive">{errors.closingDay}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Vencimento (dia)</Label>
                  <Input id="dueDate" type="number" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                  {errors.dueDate && <p className="text-sm text-destructive">{errors.dueDate}</p>}
                </div>
              </div>
            </>
          )}
          {(type === 'Débito' || type === 'Alimentação') && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="balance">{type === 'Alimentação' ? 'Benefício Mensal' : 'Saldo Atual'}</Label>
                <Input id="balance" type="number" value={balance} onChange={e => setBalance(e.target.value)} />
                {errors.balance && <p className="text-sm text-destructive">{errors.balance}</p>}
              </div>
              {type === 'Alimentação' && (
                <div className="space-y-2">
                  <Label htmlFor="usedAmount">Valor Utilizado</Label>
                  <Input id="usedAmount" type="number" value={usedAmount} onChange={e => setUsedAmount(e.target.value)} />
                </div>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v: CardStatus) => setStatus(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-4">
            <ClayButton type="button" variant="outline" onClick={onCancel} className="flex-1">Cancelar</ClayButton>
            <ClayButton type="submit" className="flex-1">{card ? "Salvar" : "Adicionar"}</ClayButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
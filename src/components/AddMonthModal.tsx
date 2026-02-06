import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClayButton } from "@/components/ui/clay-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

interface AddMonthModalProps {
  open: boolean;
  onClose: () => void;
  onAddMonths: (monthKeys: string[]) => void;
  existingMonths: string[];
}

export const AddMonthModal = ({ open, onClose, onAddMonths, existingMonths }: AddMonthModalProps) => {
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [addYear, setAddYear] = useState(false);
  const { toast } = useToast();

  const handleAdd = () => {
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || year.length !== 4) {
      toast({
        title: "Ano Inválido",
        description: "Por favor, insira um ano válido com 4 dígitos.",
        variant: "destructive",
      });
      return;
    }

    const monthsToAdd: string[] = [];
    if (addYear) {
      for (let i = 0; i < 12; i++) {
        const monthIndex = (MONTHS.indexOf(selectedMonth) + i) % 12;
        const currentYear = yearNum + Math.floor((MONTHS.indexOf(selectedMonth) + i) / 12);
        const monthKey = `${MONTHS[monthIndex]} de ${currentYear}`;
        if (!existingMonths.includes(monthKey)) {
          monthsToAdd.push(monthKey);
        }
      }
    } else {
      const monthKey = `${selectedMonth} de ${year}`;
      if (existingMonths.includes(monthKey)) {
        toast({
          title: "Mês já existe",
          description: `O mês "${monthKey}" já está na sua lista.`,
          variant: "default",
        });
        return;
      }
      monthsToAdd.push(monthKey);
    }

    if (monthsToAdd.length === 0) {
      toast({
        title: "Nenhum mês novo",
        description: "Todos os meses selecionados já existem.",
        variant: "default",
      });
      return;
    }

    onAddMonths(monthsToAdd);
    toast({
      title: "Sucesso!",
      description: `${monthsToAdd.length} mês(es) adicionado(s).`,
      variant: "success",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Novo(s) Mês(es)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="month">Mês inicial</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger id="month" className="bg-input shadow-clay-soft border-border/50 rounded-xl">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Ano inicial</Label>
            <Input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Ex: 2026"
              className="bg-input shadow-clay-soft border-border/50 rounded-xl"
            />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox id="add-year" checked={addYear} onCheckedChange={(checked) => setAddYear(checked as boolean)} />
            <Label htmlFor="add-year" className="cursor-pointer">Adicionar o ano inteiro (12 meses)</Label>
          </div>
        </div>
        <div className="flex gap-2 pt-4">
          <ClayButton type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </ClayButton>
          <ClayButton type="button" onClick={handleAdd} className="flex-1">
            Adicionar
          </ClayButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};
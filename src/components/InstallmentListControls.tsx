import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClayButton } from "@/components/ui/clay-button";
import { Search, ArrowUp, ArrowDown } from "lucide-react";
import { InstallmentCategory, InstallmentStatus } from "@/types/installment";

const CATEGORIES: InstallmentCategory[] = ["Compras", "Serviços", "Contratos", "Educação", "Saúde", "Veículo", "Outros"];
const STATUSES: InstallmentStatus[] = ["Ativo", "Concluído", "Atrasado", "Cancelado"];

interface InstallmentListControlsProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterCategory: string;
  onFilterCategoryChange: (category: string) => void;
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  sortKey: string;
  onSortKeyChange: (key: string) => void;
  sortDirection: "asc" | "desc";
  onSortDirectionChange: () => void;
}

export const InstallmentListControls = ({
  searchTerm,
  onSearchChange,
  filterCategory,
  onFilterCategoryChange,
  filterStatus,
  onFilterStatusChange,
  sortKey,
  onSortKeyChange,
  sortDirection,
  onSortDirectionChange,
}: InstallmentListControlsProps) => {
  return (
    <div className="bg-gradient-clay p-4 rounded-3xl shadow-clay-medium border border-border/30 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-input shadow-clay-soft border-border/50 rounded-xl"
          />
        </div>

        <Select value={filterCategory} onValueChange={onFilterCategoryChange}>
          <SelectTrigger className="bg-input shadow-clay-soft border-border/50 rounded-xl">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={onFilterStatusChange}>
          <SelectTrigger className="bg-input shadow-clay-soft border-border/50 rounded-xl">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            {STATUSES.map(stat => <SelectItem key={stat} value={stat}>{stat}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Select value={sortKey} onValueChange={onSortKeyChange}>
            <SelectTrigger className="flex-1 bg-input shadow-clay-soft border-border/50 rounded-xl">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nextDueDate">Próxima Parcela</SelectItem>
              <SelectItem value="name">Nome</SelectItem>
              <SelectItem value="totalAmount">Valor Total</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
          <ClayButton variant="outline" size="icon" onClick={onSortDirectionChange} className="shrink-0">
            {sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          </ClayButton>
        </div>
      </div>
    </div>
  );
};
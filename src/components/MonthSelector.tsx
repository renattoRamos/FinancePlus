import { useState, useMemo, useEffect } from "react";
import { ClayButton } from "@/components/ui/clay-button";
import { cn } from "@/lib/utils";
import { Calendar, CheckCircle, Plus, ChevronLeft, ChevronRight, Search, X, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddMonthModal } from "./AddMonthModal";
import { useDebts } from "@/contexts/DebtContext";
import { Input } from "@/components/ui/input";
import { DeleteMonthConfirmModal } from "./DeleteMonthConfirmModal";

interface MonthSelectorProps {
  selectedMonth: string;
  onMonthSelect: (month: string) => void;
  getMonthStatus?: (month: string) => boolean;
  months: string[];
  filter: string;
  onFilterChange: (filter: string) => void;
}

export const MonthSelector = ({ selectedMonth, onMonthSelect, getMonthStatus, months, filter, onFilterChange }: MonthSelectorProps) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [monthToDelete, setMonthToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { addMonths, deleteMonth, allDebts } = useDebts();
  const [searchTerm, setSearchTerm] = useState("");

  const MONTHS_PER_PAGE = filter === "currentYear" ? 12 : 6;

  const searchedMonths = useMemo(() => {
    if (!searchTerm) {
      return months;
    }
    return months.filter(month =>
      month.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [months, searchTerm]);

  const totalPages = Math.ceil(searchedMonths.length / MONTHS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchedMonths.length]);

  const paginatedMonths = useMemo(() => {
    const startIndex = (currentPage - 1) * MONTHS_PER_PAGE;
    return searchedMonths.slice(startIndex, startIndex + MONTHS_PER_PAGE);
  }, [searchedMonths, currentPage, MONTHS_PER_PAGE]);

  const handleAddMonths = async (monthKeys: string[]) => {
    await addMonths(monthKeys);
    setIsAddModalOpen(false);
    if (monthKeys.length > 0) {
      onMonthSelect(monthKeys[0]);
      const newMonthIndex = months.length;
      const newTotalPages = Math.ceil((newMonthIndex + monthKeys.length) / MONTHS_PER_PAGE);
      setCurrentPage(newTotalPages);
    }
  };

  const handleDeleteRequest = (month: string) => {
    setMonthToDelete(month);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!monthToDelete) return;
    await deleteMonth(monthToDelete);
    setIsDeleteModalOpen(false);
    setMonthToDelete(null);
    
    const remainingMonths = Object.keys(allDebts).filter(m => m !== monthToDelete);
    if (selectedMonth === monthToDelete && remainingMonths.length > 0) {
      onMonthSelect(remainingMonths[0]);
    } else if (remainingMonths.length === 0) {
      onMonthSelect("");
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setMonthToDelete(null);
  };

  return (
    <>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Período
        </h2>
        <Select value={filter} onValueChange={onFilterChange}>
          <SelectTrigger className="bg-input shadow-clay-soft border-border/50 rounded-xl">
            <SelectValue placeholder="Filtrar período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="next12">Próximos 12 meses</SelectItem>
            <SelectItem value="currentYear">Ano Atual</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4 relative">
        {searchTerm ? (
          <X
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer"
            onClick={() => setSearchTerm("")}
          />
        ) : (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
        <Input
          type="text"
          placeholder="Buscar mês..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 bg-input shadow-clay-soft border-border/50 rounded-xl"
        />
      </div>
      
      <div className="space-y-2 min-h-[300px]">
        {paginatedMonths.length > 0 ? (
          paginatedMonths.map((month) => {
            const isAllPaid = getMonthStatus?.(month) || false;
            return (
              <div key={month} className="flex items-center gap-2">
                <ClayButton
                  variant={selectedMonth === month ? "pressed" : "ghost"}
                  className={cn(
                    "flex-1 justify-between font-medium transition-clay text-left",
                    selectedMonth === month && "bg-primary/10 text-primary shadow-clay-inset",
                    isAllPaid && "border-green-500/30 bg-green-500/5"
                  )}
                  onClick={() => onMonthSelect(month)}
                >
                  <span>{month}</span>
                  {isAllPaid && <CheckCircle className="h-4 w-4 text-green-500" />}
                </ClayButton>
                <ClayButton
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteRequest(month)}
                  className="shrink-0 hover:bg-destructive/10 hover:text-destructive"
                  title={`Deletar mês ${month}`}
                >
                  <Trash2 className="h-4 w-4" />
                </ClayButton>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Nenhum mês encontrado.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <ClayButton variant="outline" size="icon" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4" />
          </ClayButton>
          <span className="text-sm font-medium text-muted-foreground">
            {currentPage} / {totalPages}
          </span>
          <ClayButton variant="outline" size="icon" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>
            <ChevronRight className="h-4 w-4" />
          </ClayButton>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border/50">
        <ClayButton
          variant="outline"
          className="w-full justify-center gap-2"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Adicionar Mês
        </ClayButton>
      </div>

      <AddMonthModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddMonths={handleAddMonths}
        existingMonths={months}
      />

      <DeleteMonthConfirmModal
        open={isDeleteModalOpen}
        monthKey={monthToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};
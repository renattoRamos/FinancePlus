import { useState, useMemo } from "react";
import { Debt } from "@/types/debt";

export const useDebtFilters = (debts: Debt[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortKey, setSortKey] = useState("dueDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const displayedDebts = useMemo(() => {
    let processedDebts = [...debts];

    if (searchTerm) {
      processedDebts = processedDebts.filter(debt =>
        debt.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterCategory !== "all") {
      processedDebts = processedDebts.filter(debt => debt.category === filterCategory);
    }
    if (filterStatus !== "all") {
      processedDebts = processedDebts.filter(debt => debt.status === filterStatus);
    }

    processedDebts.sort((a, b) => {
      let valA: any, valB: any;
      switch (sortKey) {
        case 'name': valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); break;
        case 'amount': valA = a.amount; valB = b.amount; break;
        case 'dueDate': valA = a.dueDate ? new Date(a.dueDate).getTime() : 0; valB = b.dueDate ? new Date(b.dueDate).getTime() : 0; break;
        case 'status': valA = a.status === 'Pendente' ? 0 : 1; valB = b.status === 'Pendente' ? 0 : 1; break;
        default: return 0;
      }
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return processedDebts;
  }, [debts, searchTerm, filterCategory, filterStatus, sortKey, sortDirection]);

  const handleToggleSortDirection = () => {
    setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  return {
    displayedDebts,
    searchTerm,
    onSearchChange: setSearchTerm,
    filterCategory,
    onFilterCategoryChange: setFilterCategory,
    filterStatus,
    onFilterStatusChange: setFilterStatus,
    sortKey,
    onSortKeyChange: setSortKey,
    sortDirection,
    onSortDirectionChange: handleToggleSortDirection,
  };
};
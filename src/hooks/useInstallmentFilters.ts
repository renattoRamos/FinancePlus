import { useState, useMemo } from "react";
import { Installment } from "@/types/installment";
import { parseISO } from "date-fns";

export const useInstallmentFilters = (installments: Installment[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortKey, setSortKey] = useState("nextDueDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const displayedInstallments = useMemo(() => {
    let processedInstallments = [...installments];

    if (searchTerm) {
      processedInstallments = processedInstallments.filter(installment =>
        installment.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterCategory !== "all") {
      processedInstallments = processedInstallments.filter(installment => installment.category === filterCategory);
    }
    if (filterStatus !== "all") {
      processedInstallments = processedInstallments.filter(installment => installment.status === filterStatus);
    }

    processedInstallments.sort((a, b) => {
      let valA: any, valB: any;
      switch (sortKey) {
        case 'name': valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); break;
        case 'totalAmount': valA = a.totalAmount; valB = b.totalAmount; break;
        case 'nextDueDate': 
          valA = a.nextDueDate ? parseISO(a.nextDueDate).getTime() : 0; 
          valB = b.nextDueDate ? parseISO(b.nextDueDate).getTime() : 0; 
          break;
        case 'status': 
          const statusOrder = { 'Atrasado': 0, 'Ativo': 1, 'Concluído': 2, 'Cancelado': 3 };
          valA = statusOrder[a.status];
          valB = statusOrder[b.status];
          break;
        default: return 0;
      }
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return processedInstallments;
  }, [installments, searchTerm, filterCategory, filterStatus, sortKey, sortDirection]);

  const handleToggleSortDirection = () => {
    setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  return {
    displayedInstallments,
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
import { useState, useMemo } from "react";
import { Subscription } from "@/types/subscription";

export const useSubscriptionFilters = (subscriptions: Subscription[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortKey, setSortKey] = useState("nextBillingDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const displayedSubscriptions = useMemo(() => {
    let processedSubs = [...subscriptions];

    if (searchTerm) {
      processedSubs = processedSubs.filter(sub =>
        sub.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterCategory !== "all") {
      processedSubs = processedSubs.filter(sub => sub.category === filterCategory);
    }
    if (filterStatus !== "all") {
      processedSubs = processedSubs.filter(sub => sub.status === filterStatus);
    }

    processedSubs.sort((a, b) => {
      let valA: any, valB: any;
      switch (sortKey) {
        case 'name': valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); break;
        case 'amount': valA = a.amount; valB = b.amount; break;
        case 'nextBillingDate': 
          valA = new Date(a.nextBillingDate).getTime(); 
          valB = new Date(b.nextBillingDate).getTime(); 
          break;
        default: return 0;
      }
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return processedSubs;
  }, [subscriptions, searchTerm, filterCategory, filterStatus, sortKey, sortDirection]);

  const handleToggleSortDirection = () => {
    setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  return {
    displayedSubscriptions,
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
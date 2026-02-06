import { useState, useEffect, useMemo } from "react";
import { DebtDashboard } from "@/components/DebtDashboard";
import { usePWA } from "@/hooks/usePWA";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { useDebts } from "@/contexts/DebtContext";

const FixedDebts = () => {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [monthFilter, setMonthFilter] = useState("next12");
  const { requestNotificationPermission } = usePWA();
  const { allDebts } = useDebts();

  useEffect(() => {
    const hasRequestedPermission = localStorage.getItem('notification-permission-requested');
    if (!hasRequestedPermission) {
      setTimeout(() => {
        requestNotificationPermission();
        localStorage.setItem('notification-permission-requested', 'true');
      }, 5000);
    }
  }, [requestNotificationPermission]);

  const getMonthStatus = (month: string) => {
    const monthDebts = allDebts[month] || [];
    return monthDebts.length > 0 && monthDebts.every(debt => debt.status === "Pago");
  };

  const allAvailableMonths = useMemo(() => {
    const monthOrder = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    return Object.keys(allDebts).sort((a, b) => {
      const [monthA, yearA] = a.split(" de ");
      const [monthB, yearB] = b.split(" de ");
      if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
      return monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB);
    });
  }, [allDebts]);

  const filteredMonths = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear().toString();

    switch (monthFilter) {
      case 'currentYear':
        return allAvailableMonths.filter(month => month.includes(currentYear));
      case 'all':
        return allAvailableMonths;
      case 'next12':
      default:
        const currentMonthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(now);
        const currentMonthKey = `${currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1)} de ${currentYear}`;
        
        const startIndex = allAvailableMonths.findIndex(month => month === currentMonthKey);
        
        if (startIndex !== -1) {
          return allAvailableMonths.slice(startIndex, startIndex + 12);
        }
        return allAvailableMonths.slice(0, 12);
    }
  }, [allAvailableMonths, monthFilter]);

  useEffect(() => {
    if (filteredMonths.length > 0 && !filteredMonths.includes(selectedMonth)) {
      setSelectedMonth(filteredMonths[0]);
    } else if (filteredMonths.length === 0 && selectedMonth !== "") {
      setSelectedMonth("");
    } else if (filteredMonths.length > 0 && selectedMonth === "") {
      setSelectedMonth(filteredMonths[0]);
    }
  }, [filteredMonths, selectedMonth]);

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          <Sidebar
            isOpen={isSidebarOpen}
            onOpenChange={setIsSidebarOpen}
            selectedMonth={selectedMonth}
            onMonthSelect={setSelectedMonth}
            getMonthStatus={getMonthStatus}
            months={filteredMonths}
            monthFilter={monthFilter}
            onMonthFilterChange={setMonthFilter}
          />
          
          <div className="lg:col-span-3">
            <DebtDashboard 
              selectedMonth={selectedMonth}
              allAvailableMonths={allAvailableMonths}
              hasMonths={allAvailableMonths.length > 0}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default FixedDebts;
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { MonthSelector } from "./MonthSelector";
import { Link, useLocation } from "react-router-dom";
import { Home, LayoutDashboard, BarChart2, Repeat, Settings, CreditCard, ListChecks } from "lucide-react";
import { ClayButton } from "@/components/ui/clay-button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedMonth?: string;
  onMonthSelect?: (month: string) => void;
  getMonthStatus?: (month: string) => boolean;
  months?: string[];
  monthFilter?: string;
  onMonthFilterChange?: (filter: string) => void;
}

export const Sidebar = ({
  isOpen,
  onOpenChange,
  selectedMonth,
  onMonthSelect,
  getMonthStatus,
  months,
  monthFilter,
  onMonthFilterChange,
}: SidebarProps) => {
  const location = useLocation();
  const pathname = location.pathname;

  const handleMonthSelectForMobile = (month: string) => {
    onMonthSelect?.(month);
    onOpenChange(false);
  };

  const navLinks = [
    { href: "/", label: "Visão Geral", icon: Home },
    { href: "/fixed-debts", label: "Dívidas Fixas", icon: LayoutDashboard },
    { href: "/subscriptions", label: "Assinaturas", icon: Repeat },
    { href: "/installments", label: "Parcelamentos", icon: ListChecks },
    { href: "/cards", label: "Cartões", icon: CreditCard },
    { href: "/analytics", label: "Analytics", icon: BarChart2 },
    { href: "/settings", label: "Configurações", icon: Settings },
  ];

  const navContent = (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Navegação</h2>
      <div className="space-y-2">
        {navLinks.map(link => (
          <Link to={link.href} key={link.href} onClick={() => onOpenChange(false)}>
            <ClayButton
              variant={pathname === link.href ? "pressed" : "ghost"}
              className={cn(
                "w-full justify-start gap-4 font-medium transition-clay",
                pathname === link.href && "bg-primary/10 text-primary shadow-clay-inset"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </ClayButton>
          </Link>
        ))}
      </div>
    </div>
  );

  const monthSelectorContent = (onSelect: (month: string) => void) => (
    pathname === '/fixed-debts' && onMonthSelect && selectedMonth !== undefined && months && monthFilter && onMonthFilterChange ? (
      <div className="p-6 pt-0 lg:pt-6 flex-1 overflow-y-auto">
        <MonthSelector
          selectedMonth={selectedMonth}
          onMonthSelect={onSelect}
          getMonthStatus={getMonthStatus}
          months={months}
          filter={monthFilter}
          onFilterChange={onMonthFilterChange}
        />
      </div>
    ) : null
  );

  return (
    <>
      <div className="hidden lg:block lg:col-span-1">
        <div className="bg-gradient-clay rounded-3xl shadow-clay-medium border border-border/30 h-fit flex flex-col">
          {navContent}
          {monthSelectorContent(onMonthSelect!)}
        </div>
      </div>

      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-[304px] sm:w-[336px] bg-background p-0 border-r-0 flex flex-col">
          <SheetHeader className="p-6 pb-0 sr-only">
            <SheetTitle>Menu Principal</SheetTitle>
            <SheetDescription>Navegue pelas diferentes seções do aplicativo de finanças.</SheetDescription>
          </SheetHeader>
          <div className="pt-8 h-full flex flex-col">
            {navContent}
            {monthSelectorContent(handleMonthSelectForMobile)}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
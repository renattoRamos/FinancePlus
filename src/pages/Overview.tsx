import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { useDebts } from "@/contexts/DebtContext";
import { DebtSummaryCard } from "@/components/DebtSummaryCard";
import { UpcomingSubscriptions } from "@/components/UpcomingSubscriptions";
import { UpcomingDebts } from "@/components/UpcomingDebts";
import { UpcomingInstallments } from "@/components/UpcomingInstallments";
import { ClayButton } from "@/components/ui/clay-button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { ClayCard, ClayCardHeader, ClayCardTitle, ClayCardContent } from "@/components/ui/clay-card";

const getCurrentMonthKey = () => {
  const now = new Date();
  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(now);
  const year = now.getFullYear();
  return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${year}`;
};

const Overview = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { allDebts, isLoading: isDebtsLoading } = useDebts();

  const currentMonthKey = useMemo(() => getCurrentMonthKey(), []);
  const currentMonthDebts = useMemo(() => allDebts[currentMonthKey] || [], [allDebts, currentMonthKey]);

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />

      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          <Sidebar
            isOpen={isSidebarOpen}
            onOpenChange={setIsSidebarOpen}
          />

          <div className="lg:col-span-3 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-2xl font-bold text-foreground">
                Visão Geral
              </h1>
              <div className="flex gap-2 flex-wrap justify-end">
                <Link to="/fixed-debts">
                  <ClayButton
                    variant="default"
                    className="gap-2 w-full sm:w-auto"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                    Nova Dívida
                  </ClayButton>
                </Link>
                <Link to="/subscriptions">
                  <ClayButton
                    variant="outline"
                    className="gap-2 w-full sm:w-auto"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                    Nova Assinatura
                  </ClayButton>
                </Link>
                <Link to="/installments">
                  <ClayButton
                    variant="outline"
                    className="gap-2 w-full sm:w-auto"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                    Novo Parcelamento
                  </ClayButton>
                </Link>
                <Link to="/cards">
                  <ClayButton
                    variant="outline"
                    className="gap-2 w-full sm:w-auto"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                    Novo Cartão
                  </ClayButton>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DebtSummaryCard
                debts={currentMonthDebts}
                isLoading={isDebtsLoading}
                selectedMonth={currentMonthKey}
              />
              <UpcomingDebts />
              <UpcomingSubscriptions />
              <UpcomingInstallments />
            </div>

            <div className="pt-4">
              <h2 className="text-xl font-bold text-foreground mb-4">Acesso Rápido</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link to="/fixed-debts">
                  <ClayCard className="hover:shadow-clay-medium transition-shadow">
                    <ClayCardHeader>
                      <ClayCardTitle>Gerenciar Dívidas</ClayCardTitle>
                    </ClayCardHeader>
                    <ClayCardContent>
                      <p className="text-muted-foreground text-sm">Veja, adicione e edite suas dívidas mensais.</p>
                    </ClayCardContent>
                  </ClayCard>
                </Link>
                <Link to="/subscriptions">
                  <ClayCard className="hover:shadow-clay-medium transition-shadow">
                    <ClayCardHeader>
                      <ClayCardTitle>Gerenciar Assinaturas</ClayCardTitle>
                    </ClayCardHeader>
                    <ClayCardContent>
                      <p className="text-muted-foreground text-sm">Controle seus gastos recorrentes com assinaturas.</p>
                    </ClayCardContent>
                  </ClayCard>
                </Link>
                <Link to="/installments">
                  <ClayCard className="hover:shadow-clay-medium transition-shadow">
                    <ClayCardHeader>
                      <ClayCardTitle>Gerenciar Parcelamentos</ClayCardTitle>
                    </ClayCardHeader>
                    <ClayCardContent>
                      <p className="text-muted-foreground text-sm">Acompanhe suas compras e contratos parcelados.</p>
                    </ClayCardContent>
                  </ClayCard>
                </Link>
                <Link to="/cards">
                  <ClayCard className="hover:shadow-clay-medium transition-shadow">
                    <ClayCardHeader>
                      <ClayCardTitle>Gerenciar Cartões</ClayCardTitle>
                    </ClayCardHeader>
                    <ClayCardContent>
                      <p className="text-muted-foreground text-sm">Adicione e organize seus cartões de crédito e débito.</p>
                    </ClayCardContent>
                  </ClayCard>
                </Link>
                <Link to="/analytics">
                  <ClayCard className="hover:shadow-clay-medium transition-shadow">
                    <ClayCardHeader>
                      <ClayCardTitle>Ver Analytics</ClayCardTitle>
                    </ClayCardHeader>
                    <ClayCardContent>
                      <p className="text-muted-foreground text-sm">Analise seus gastos com gráficos detalhados.</p>
                    </ClayCardContent>
                  </ClayCard>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Overview;
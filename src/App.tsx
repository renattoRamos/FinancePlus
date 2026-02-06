import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Overview from "./pages/Overview";
import FixedDebts from "./pages/FixedDebts";
import NotFound from "./pages/NotFound";
import Analytics from "./pages/Analytics";
import Subscriptions from "./pages/Subscriptions";
import Settings from "./pages/Settings";
import Cards from "./pages/Cards";
import Installments from "./pages/Installments";
import { DebtProvider } from "./contexts/DebtContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { CardProvider } from "./contexts/CardContext";
import { InstallmentProvider } from "./contexts/InstallmentContext";
import { ScrollToTopButton } from "./components/ScrollToTopButton";
import { ThemeProvider } from "./components/ThemeProvider";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt"; // Import PWAInstallPrompt

const queryClient = new QueryClient();

const AppRoutes = () => {
  return (
    <DebtProvider>
      <SubscriptionProvider>
        <CardProvider>
          <InstallmentProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                  <Route path="/" element={<Overview />} />
                  <Route path="/fixed-debts" element={<FixedDebts />} />
                  <Route path="/subscriptions" element={<Subscriptions />} />
                  <Route path="/cards" element={<Cards />} />
                  <Route path="/installments" element={<Installments />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <ScrollToTopButton />
              </BrowserRouter>
            </TooltipProvider>
          </InstallmentProvider>
        </CardProvider>
      </SubscriptionProvider>
    </DebtProvider>
  );
};

const App = () => (
  <ThemeProvider defaultTheme="system" storageKey="financas-theme" attribute="class" enableSystem>
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
      <PWAInstallPrompt /> {/* PWAInstallPrompt moved here */}
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
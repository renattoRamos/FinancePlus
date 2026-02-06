import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ClayCard, ClayCardContent, ClayCardHeader, ClayCardTitle } from "@/components/ui/clay-card";
import { ClayButton } from "@/components/ui/clay-button";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop, Trash2, AlertTriangle, Download, ShieldCheck, Info, Bell } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useDebts } from "@/contexts/DebtContext";
import { useSubscriptions } from "@/contexts/SubscriptionContext";
import { useCards } from "@/contexts/CardContext";
import { useInstallments } from "@/contexts/InstallmentContext";
import { exportToXLSX } from "@/utils/exportData";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";

const Settings = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { setTheme } = useTheme();
  const { toast } = useToast();
  const { settings, updateSettings } = useNotificationSettings();

  const { allDebts, clearAllDebts } = useDebts();
  const { subscriptions, clearAllSubscriptions } = useSubscriptions();
  const { cards, clearAllCards } = useCards();
  const { installments, clearAllInstallments } = useInstallments();

  const [clearSupabaseData, setClearSupabaseData] = useState(false);
  const [password, setPassword] = useState("");
  const [isPasswordIncorrect, setIsPasswordIncorrect] = useState(false);

  const handleExportAllData = () => {
    if (Object.keys(allDebts).length === 0 && subscriptions.length === 0 && cards.length === 0 && installments.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Adicione dados antes de exportar.",
        variant: "destructive",
      });
      return;
    }
    exportToXLSX({ allDebts, subscriptions, cards, installments });
    toast({
      title: "✅ Backup Concluído",
      description: "Seus dados foram exportados para um arquivo XLSX.",
    });
  };

  const handleConfirmClearData = async () => {
    if (clearSupabaseData) {
      if (password !== "Positivo1") {
        setIsPasswordIncorrect(true);
        toast({
          title: "Senha Incorreta",
          description: "A senha para apagar os dados do banco de dados está incorreta.",
          variant: "destructive",
        });
        return;
      }

      await clearAllDebts();
      await clearAllSubscriptions();
      await clearAllCards();
      await clearAllInstallments();

      toast({
        title: "💥 Dados Removidos!",
        description: "Todos os dados do banco de dados foram apagados permanentemente.",
        variant: "destructive",
      });
    }

    localStorage.clear();
    toast({
      title: "✅ Dados Locais Apagados",
      description: "Configurações e cache do navegador foram removidos.",
    });

    setClearSupabaseData(false);
    setPassword("");
    setIsPasswordIncorrect(false);
    setTimeout(() => window.location.reload(), 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />

      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          <Sidebar isOpen={isSidebarOpen} onOpenChange={setIsSidebarOpen} />

          <div className="lg:col-span-3 space-y-6">
            <h1 className="text-2xl font-bold text-foreground">Configurações</h1>

            <ClayCard>
              <ClayCardHeader>
                <ClayCardTitle>Aparência</ClayCardTitle>
                <p className="text-sm text-muted-foreground pt-2">
                  Escolha como o aplicativo deve se parecer.
                </p>
              </ClayCardHeader>
              <ClayCardContent>
                <div className="flex flex-col sm:flex-row gap-2">
                  <ClayButton variant="outline" onClick={() => setTheme("light")} className="flex-1 gap-2">
                    <Sun className="h-4 w-4" /> Claro
                  </ClayButton>
                  <ClayButton variant="outline" onClick={() => setTheme("dark")} className="flex-1 gap-2">
                    <Moon className="h-4 w-4" /> Escuro
                  </ClayButton>
                  <ClayButton variant="outline" onClick={() => setTheme("system")} className="flex-1 gap-2">
                    <Laptop className="h-4 w-4" /> Sistema
                  </ClayButton>
                </div>
              </ClayCardContent>
            </ClayCard>

            <ClayCard>
              <ClayCardHeader>
                <ClayCardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Controle de Notificações</ClayCardTitle>
                <p className="text-sm text-muted-foreground pt-2">
                  Gerencie os lembretes e alertas que você recebe.
                </p>
              </ClayCardHeader>
              <ClayCardContent className="space-y-4">
                {/* Dívidas */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="debt-due-switch">Lembrete de Dívidas</Label>
                    <p className="text-xs text-muted-foreground">Avisar sobre dívidas próximas do vencimento.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {settings.debtDue.enabled && (
                      <Select
                        value={String(settings.debtDue.days)}
                        onValueChange={(value) => updateSettings({ debtDue: { ...settings.debtDue, days: Number(value) } })}
                      >
                        <SelectTrigger className="w-[140px] text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 dia antes</SelectItem>
                          <SelectItem value="3">3 dias antes</SelectItem>
                          <SelectItem value="5">5 dias antes</SelectItem>
                          <SelectItem value="7">7 dias antes</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <Switch id="debt-due-switch" checked={settings.debtDue.enabled} onCheckedChange={(checked) => updateSettings({ debtDue: { ...settings.debtDue, enabled: checked } })} />
                  </div>
                </div>
                {/* Assinaturas */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sub-due-switch">Lembrete de Assinaturas</Label>
                    <p className="text-sm mt-2">Avisar sobre cobranças de assinaturas.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {settings.subscriptionDue.enabled && (
                      <Select
                        value={String(settings.subscriptionDue.days)}
                        onValueChange={(value) => updateSettings({ subscriptionDue: { ...settings.subscriptionDue, days: Number(value) } })}
                      >
                        <SelectTrigger className="w-[140px] text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 dia antes</SelectItem>
                          <SelectItem value="3">3 dias antes</SelectItem>
                          <SelectItem value="5">5 dias antes</SelectItem>
                          <SelectItem value="7">7 dias antes</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <Switch id="sub-due-switch" checked={settings.subscriptionDue.enabled} onCheckedChange={(checked) => updateSettings({ subscriptionDue: { ...settings.subscriptionDue, enabled: checked } })} />
                  </div>
                </div>
                {/* Parcelamentos */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="inst-due-switch">Lembrete de Parcelas</Label>
                    <p className="text-sm mt-2">Avisar sobre parcelas próximas do vencimento.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {settings.installmentDue.enabled && (
                      <Select
                        value={String(settings.installmentDue.days)}
                        onValueChange={(value) => updateSettings({ installmentDue: { ...settings.installmentDue, days: Number(value) } })}
                      >
                        <SelectTrigger className="w-[140px] text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 dia antes</SelectItem>
                          <SelectItem value="3">3 dias antes</SelectItem>
                          <SelectItem value="5">5 dias antes</SelectItem>
                          <SelectItem value="7">7 dias antes</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <Switch id="inst-due-switch" checked={settings.installmentDue.enabled} onCheckedChange={(checked) => updateSettings({ installmentDue: { ...settings.installmentDue, enabled: checked } })} />
                  </div>
                </div>
              </ClayCardContent>
            </ClayCard>

            <ClayCard>
              <ClayCardHeader>
                <ClayCardTitle>Backup de Dados</ClayCardTitle>
                <p className="text-sm text-muted-foreground pt-2">
                  Exporte todos os seus dados para um arquivo XLSX.
                </p>
              </ClayCardHeader>
              <ClayCardContent>
                <ClayButton variant="outline" onClick={handleExportAllData} className="gap-2">
                  <Download className="h-4 w-4" />
                  Fazer Backup Completo
                </ClayButton>
              </ClayCardContent>
            </ClayCard>

            <ClayCard className="border-destructive/50">
              <ClayCardHeader>
                <ClayCardTitle className="text-destructive">Zona de Perigo</ClayCardTitle>
                <p className="text-sm text-muted-foreground pt-2">
                  Ações nesta seção são permanentes e não podem ser desfeitas.
                </p>
              </ClayCardHeader>
              <ClayCardContent>
                <AlertDialog onOpenChange={() => { setClearSupabaseData(false); setPassword(""); setIsPasswordIncorrect(false); }}>
                  <AlertDialogTrigger asChild>
                    <ClayButton variant="destructive" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Limpeza de Dados
                    </ClayButton>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Você tem certeza absoluta?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação pode ser irreversível. Por favor, leia as opções com atenção. Fazer um backup antes é recomendado.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-4 py-2">
                      <div className="flex items-start space-x-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                        <Checkbox
                          id="clear-supabase"
                          checked={clearSupabaseData}
                          onCheckedChange={(checked) => setClearSupabaseData(checked as boolean)}
                          className="mt-2"
                        />
                        <div className="grid gap-2 leading-none">
                          <label htmlFor="clear-supabase" className="font-medium text-destructive cursor-pointer">
                            Apagar permanentemente todos os dados do banco de dados.
                          </label>
                          <p className="text-xs text-destructive/80">
                            Isso inclui todas as dívidas, assinaturas, cartões e parcelamentos. Esta ação é final e não pode ser desfeita.
                          </p>
                        </div>
                      </div>

                      {!clearSupabaseData && (
                        <div className="p-4 border rounded-lg bg-muted/50 text-sm text-muted-foreground animate-fade-in">
                          <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            O que será apagado?
                          </p>
                          <p>
                            Ao continuar, você irá limpar apenas os dados salvos no seu navegador:
                          </p>
                          <ul className="list-disc list-inside mt-2 space-y-2">
                            <li>Cache do aplicativo e arquivos temporários.</li>
                            <li>Suas configurações de tema (claro/escuro).</li>
                            <li>Dados que permitem o funcionamento offline.</li>
                          </ul>
                          <p className="mt-4 font-medium text-foreground">
                            Suas dívidas, assinaturas e cartões <span className="underline">não</span> serão afetados.
                          </p>
                        </div>
                      )}

                      {clearSupabaseData && (
                        <div className="space-y-2 animate-fade-in">
                          <Label htmlFor="password">
                            Para confirmar, digite a senha: <span className="font-mono text-primary">Positivo1</span>
                          </Label>
                          <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setIsPasswordIncorrect(false); }}
                            className={isPasswordIncorrect ? "border-destructive ring-destructive" : ""}
                          />
                          {isPasswordIncorrect && <p className="text-sm text-destructive">Senha incorreta.</p>}
                        </div>
                      )}
                    </div>

                    <AlertDialogFooter>
                      <AlertDialogCancel asChild>
                        <ClayButton variant="outline">Cancelar</ClayButton>
                      </AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <ClayButton variant="destructive" onClick={handleConfirmClearData}>
                          <ShieldCheck className="h-4 w-4 mr-2" />
                          Confirmar e Apagar
                        </ClayButton>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </ClayCardContent>
            </ClayCard>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
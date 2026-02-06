import { useState } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { ClayCard, ClayCardContent } from '@/components/ui/clay-card';
import { ClayButton } from '@/components/ui/clay-button';
import { usePWA } from '@/hooks/usePWA';

export const PWAInstallPrompt = () => {
  const [isDismissed, setIsDismissed] = useState(false);
  const { isInstallable, installApp, isMobile } = usePWA();

  if (!isInstallable || !isMobile || isDismissed) {
    return null;
  }

  const handleInstall = () => {
    installApp();
    setIsDismissed(true);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80 animate-fade-in">
      <ClayCard className="bg-gradient-primary border-primary/20 shadow-clay-strong">
        <ClayCardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 rounded-full p-2 shrink-0">
              <Smartphone className="h-5 w-5 text-primary-foreground" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-primary-foreground text-sm mb-2">
                Instalar Sistema de Finanças
              </h3>
              <p className="text-primary-foreground/90 text-xs mb-4 leading-relaxed">
                Instale em seu dispositivo para acesso rápido e uma experiência completa do aplicativo nativo.
              </p>

              <div className="flex gap-2">
                <ClayButton
                  variant="secondary"
                  size="sm"
                  onClick={handleInstall}
                  className="flex-1 gap-1.5 text-xs h-8 bg-white/20 hover:bg-white/30 text-primary-foreground border-white/30"
                >
                  <Download className="h-3.5 w-3.5" />
                  Instalar
                </ClayButton>

                <ClayButton
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-8 w-8 p-0 text-primary-foreground/70 hover:bg-white/10"
                >
                  <X className="h-3.5 w-3.5" />
                </ClayButton>
              </div>
            </div>
          </div>
        </ClayCardContent>
      </ClayCard>
    </div>
  );
};
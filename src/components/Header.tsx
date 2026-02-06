import { ClayButton } from "@/components/ui/clay-button";
import { Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <header className="lg:hidden flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <h1 className="text-lg font-bold text-primary">Finanças</h1>
      <ClayButton variant="ghost" size="icon" onClick={onMenuClick}>
        <Menu className="h-6 w-6" />
      </ClayButton>
    </header>
  );
};
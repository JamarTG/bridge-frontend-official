import type { ReactNode } from "react";
import { Users, SettingsIcon, LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface NavbarLayoutProps {
  children: ReactNode;
}

const NavbarLayout = ({ children }: NavbarLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">B</span>
          </div>
          <h1 className="text-xl font-bold">Bridge</h1>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 cursor-default">
            <Users className="w-3" />
            <span className="sm:text-md text-xs">3</span>
          </Badge>
          <Button
            className="cursor-pointer"
            variant="ghost"
            onClick={() => navigate("/settings")}
          >
            <SettingsIcon className="w-4 h-4" /> Settings
          </Button>
          <Button
            className="cursor-pointer"
            variant="ghost"
            onClick={() => navigate("/login")}
          >
            <LogOutIcon className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
};

export default NavbarLayout;

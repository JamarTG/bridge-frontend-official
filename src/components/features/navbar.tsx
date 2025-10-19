import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import NavUser from "./nav-user";
import { Skeleton } from "@/components/ui/skeleton";
import Logo from "../logo";

interface NavbarLayoutProps {
  children: ReactNode;
}

const NavbarLayout = ({ children }: NavbarLayoutProps) => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("authToken");
      console.log("Fetching user profile...");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/profiles/me", {
          headers: {
            Authorization: `Basic ${token}`,
          },
        });
        const result = await response.json();
        if (response.ok) {
          setUser({
            name: `${result.firstName ?? ""} ${result.lastName ?? ""}`.trim(),
            email: result.email,
          });
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <Logo />
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-2 w-12" />
              </div>
            </div>
          ) : (
            user && <NavUser user={{ name: user.name }} />
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
};

export default NavbarLayout;

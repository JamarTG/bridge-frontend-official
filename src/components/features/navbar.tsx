import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import NavUser from "./nav-user";
import { Skeleton } from "@/components/ui/skeleton";

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
        <div className="flex justify-center items-center gap-1">
          <svg
            viewBox="0 0 24 24"
            width={35}
            xmlns="http://www.w3.org/2000/svg"
            fill="#000000"
          >
            <defs>
              <style>{`.cls-1{fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.5px;}`}</style>
            </defs>
            <g id="ic-places-bridge">
              <line className="cls-1" x1="2" y1="15" x2="22" y2="15" />
              <path className="cls-1" d="M4,18V6H4A9.39,9.39,0,0,0,20,6h0V18" />
              <line className="cls-1" x1="8" y1="9.59" x2="8" y2="15" />
              <line className="cls-1" x1="16" y1="9.59" x2="16" y2="15" />
              <line className="cls-1" x1="12" y1="10.47" x2="12" y2="15" />
            </g>
          </svg>
          <h2 className="font-bold text-xl">Bridge</h2>
        </div>

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

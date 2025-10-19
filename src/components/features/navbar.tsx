import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavUser from "./nav-user";

interface NavbarLayoutProps {
  children: ReactNode;
}

const NavbarLayout = ({ children }: NavbarLayoutProps) => {
  const navigate = useNavigate();
  const [_user, setUser] = useState<{ name: string; email: string }>({
    email:"demo",
    name:"demo"
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("authToken");
      console.log("Fetching user profile...");
      if (!token) return;

      try {
        const response = await fetch("/api/profiles/me", {
          headers: {
            "Authorization": `Basic ${token}`,
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
      }
    };

    fetchUser();
  }, []);


  return (
    <div className="min-h-screen bg-background flex flex-col">
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
         
          <NavUser user={{
            name: "Jamari McFarlane"
          }} />
        
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
};

export default NavbarLayout;

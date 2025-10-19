import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavUser from "./nav-user";

interface NavbarLayoutProps {
  children: ReactNode;
}

const NavbarLayout = ({ children }: NavbarLayoutProps) => {

  const [user, setUser] = useState<{ name: string; email: string }>({
    email: "demo",
    name: "demo"
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
        <div className="flex justify-center items-center gap-1"> 
          <svg viewBox="0 0 24 24" width={35} xmlns="http://www.w3.org/2000/svg" fill="#000000">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
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
            </g>
          </svg>
          <h2 className="font-bold text-xl">Bridge</h2>
          
        </div>


        <div className="flex items-center gap-2">

          <NavUser user={{
            name: user.name
          }} />

        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
};

export default NavbarLayout;

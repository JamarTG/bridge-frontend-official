import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { LogOut, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface User {
  name: string;
}

interface NavUserProps {
  user: User;
}

const LANGUAGES = [
  { code: "en", label: "English", flag: "https://flagcdn.com/w20/us.png" },
  { code: "es", label: "Español", flag: "https://flagcdn.com/w20/es.png" },
  { code: "fr", label: "Français", flag: "https://flagcdn.com/w20/fr.png" },
  { code: "de", label: "Deutsch", flag: "https://flagcdn.com/w20/de.png" },
  { code: "hi", label: "हिन्दी (Hindi)", flag: "https://flagcdn.com/w20/in.png" },
];

const NavUser: React.FC<NavUserProps> = ({ user }) => {
  const { logout } = useAuth();

  const tag =
    (user.name.split(" ")[0] && user.name.split(" ")[0][0]) ||
    ("D" + ((user.name.split(" ")[1] && user.name.split(" ")[1][0]) || "U"));

  const [language, setLanguage] = useState<string>(() => {
    return localStorage.getItem("lang") ?? "en";
  });

  useEffect(() => {
    localStorage.setItem("lang", language);
    window.dispatchEvent(new CustomEvent("languageChanged", { detail: language }));
  }, [language]);

  const currentLang = LANGUAGES.find((l) => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="flex data-[state=open]:bg-gray-100 hover:bg-gray-100 active:bg-gray-200 px-2 py-6 items-center gap-2 bg-white">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-white bg-black">{tag}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 text-left">
            <span className="truncate text-base text-gray-700 font-medium">{user.name}</span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {currentLang && (
                <>
                  <img
                    src={currentLang.flag}
                    alt={currentLang.label}
                    className="w-4 h-3 rounded-xs object-cover"
                  />
                  {currentLang.label}
                </>
              )}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-56 rounded" align="end" sideOffset={4}>
        <DropdownMenuLabel className="text-gray-500 text-xs px-3">Language</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {LANGUAGES.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => setLanguage(l.code)}
            className={`flex items-center gap-2 text-sm ${
              language === l.code ? "bg-gray-100 font-medium" : ""
            }`}
          >
            <img src={l.flag} alt={l.label} className="w-4 h-3 rounded-xs object-cover" />
            <span>{l.label}</span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-red-500 focus:text-red-600">
          <LogOut className="mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavUser;

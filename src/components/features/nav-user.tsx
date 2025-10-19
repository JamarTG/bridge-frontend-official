import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import { Button } from "../ui/button";
import { UserCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface User {
  name: string;
  email: string;
}


interface NavUserProps {
  user: User
}

const NavUser: React.FC<NavUserProps> = ({ user }) => {

  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="flex data-[state=open]:bg-gray-100 hover:bg-gray-100 active:bg-gray-200 px-2 py-6 items-center gap-2 bg-white">
          <div className="flex items-center gap-2 px-1 py-1 text-left text-sm">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-white bg-black">CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 text-left">
              <span className="truncate text-base text-gray-700 font-medium">{user.name}</span>
              <span className="truncate text-xs text-gray-500">{user.email}</span>
            </div>
          </div>

        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-56 rounded"
        align="end"
        sideOffset={4}
      >

        <DropdownMenuItem onClick={() => navigate('/settings')} className="bg-white hover:bg-transparent hover:text-inherit">
          <UserCircle className="mr-2" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => navigate('/login')} className="bg-white hover:bg-transparent hover:text-inherit">
          <LogOut className="mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NavUser;

import { CircleUser } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { useControlDropdown } from "@/utils/hooks/use-control-dropdown";
import { useUserSession } from "@/utils/hooks/use-user-session";

interface AccountInterface {
  toggleAuthModal: (flag?: string) => void;
  handleLogout: () => Promise<void>;
}

export function Account({ toggleAuthModal, handleLogout }: AccountInterface) {
  const { activeUser } = useUserSession();

  const { isOpen, toggleDropdown } = useControlDropdown();

  if (!activeUser) return <></>;

  return (
    <div className="absolute right-8 top-8">
      <DropdownMenu open={isOpen}>
        <DropdownMenuTrigger asChild>
          <div
            className="flex flex-col justify-center items-center space-y-4"
            role="button"
          >
            <CircleUser
              onClick={toggleDropdown}
              className="
                h-10 w-10 rounded-full
                bg-primary text-white
                shadow-md
            "
            />
            <Button
              variant="outline"
              className="w-full px-6"
              onClick={toggleDropdown}
            >
              {activeUser.username}
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            {"Usuario SIEM:"}
            <strong>{activeUser.username}</strong>
          </DropdownMenuItem>
          <DropdownMenuItem>
            {"Contraseña SIEM:"}
            <strong>{activeUser.password}</strong>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="hover:cursor-pointer focus:ring-0 focus:outline-none hover:outline-none hover:ring-0 w-full justify-start"
            onClick={() => {
              toggleDropdown();
              toggleAuthModal("UPDATE_CREDENTIALS");
            }}
          >
            {"Actualizar credenciales SIEM"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="hover:cursor-pointer focus:ring-0 focus:outline-none hover:outline-none hover:ring-0 w-full justify-start"
          >
            {"Cerrar sesión"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

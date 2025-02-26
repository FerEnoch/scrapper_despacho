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
import { useState } from "react";

interface AccountInterface {
  toggleAuthModal: (flag?: string) => void;
  handleLogout: () => Promise<void>;
}

export function Account({ toggleAuthModal, handleLogout }: AccountInterface) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
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
        <DropdownMenuContent className="w-[20rem]">
          <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="h-10">
            <div className="flex items-center justify-between w-full pe-2">
              <p className="shrink-0">{"Usuario SIEM:"}</p>
              <strong className="flex-1 ps-4">{activeUser.username}</strong>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem className="h-10">
            <div className="flex items-center justify-between w-full pe-2">
              <p className="shrink-0">{"Contraseña SIEM:"}</p>
              <strong
                className="flex-1 ps-4"
                onMouseLeave={() => setIsPasswordVisible(false)}
                onMouseEnter={() => setIsPasswordVisible(true)}
              >
                {isPasswordVisible ? (
                  activeUser.password
                ) : (
                  <span className="relative top-1">{"**********"}</span>
                )}
              </strong>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="h-10 hover:cursor-pointer focus:ring-0 focus:outline-none hover:outline-none hover:ring-0 w-full justify-start"
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
            className="h-10 hover:cursor-pointer focus:ring-0 focus:outline-none hover:outline-none hover:ring-0 w-full justify-start"
          >
            {"Cerrar sesión"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

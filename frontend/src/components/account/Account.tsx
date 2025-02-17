import { authApi } from "@/api/authApi";
import { Badge } from "@/components/ui/badge";
import {
  ActiveUser,
  ApiResponse,
  NewUserCredentials,
  UserSession,
} from "@/types";
import { CircleUser } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { lazy, useState } from "react";

const AuthModal = lazy(() =>
  import("../modals/AuthModal").then((module) => ({
    default: module.AuthModal,
  }))
);

interface AccountInterface {
  activeUser: ActiveUser;
  handleLogout: (apiResponse: ApiResponse<UserSession>) => void;
  handleChangeCredentials: (apiResponse: ApiResponse<UserSession>) => void;
}

export function Account({
  activeUser,
  handleLogout,
  handleChangeCredentials,
}: AccountInterface) {
  const [isOpen, setIsOpen] = useState(false);

  const logOut = async () => {
    const apiResponse = await authApi.logout();
    handleLogout(apiResponse);
  };

  const toggleAlertDialog = () => {
    setIsOpen((open) => !open);
  };

  const changeCredentials = async (
    userData: UserSession | NewUserCredentials = {
      newUser: "",
      newPass: "",
    }
  ) => {
    if (!("newUser" in userData && "newPass" in userData)) return;

    const { newUser, newPass } = userData;
    const apiResponse = await authApi.changeCredentials(activeUser.userId, {
      user: newUser,
      pass: newPass,
    });
    handleChangeCredentials(apiResponse);
  };

  return (
    <div className="absolute right-8 top-8 space-y-4 flex flex-col justify-center items-center">
      <AuthModal
        dialogTitle="Cambiar credenciales SIEM"
        actionButton="Actualizar"
        isOpen={isOpen}
        toggleAlertDialog={toggleAlertDialog}
        handleSubmit={changeCredentials}
      />
      <CircleUser
        className="
          h-10 w-10 rounded-full
          bg-primary text-white
          shadow-md
          "
      />
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Badge className="py-2 px-4" variant="outline">
            {activeUser.username}
          </Badge>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            {"Usuario SIEM:"} {activeUser.username}
          </DropdownMenuItem>
          <DropdownMenuItem>
            {"Contraseña SIEM:"} {activeUser.password}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="hover:cursor-pointer"
            onClick={toggleAlertDialog}
          >
            {"Actualizar credenciales SIEM"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="hover:cursor-pointer" onClick={logOut}>
            {"Cerrar sesión"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

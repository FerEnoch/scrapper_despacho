import {
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ModalDialog } from "@/components/ui/modal-dialog";
import { LoginForm } from "../login/LoginForm";
import { useState } from "react";
import { ApiResponse, UserSession } from "@/types";
import { AUTH_API_ERRORS, AUTH_API_MESSAGES } from "@/types/enums";
import { useToast } from "@/lib/hooks/use-toast";
import { UI_TOAST_MESSAGES } from "@/i18n/constants";

interface LoginAuthModalProps {
  dialogTitle: string;
  actionButton: string;
  isOpen: boolean;
  toggleAlertDialog: () => void;
  handleLogin: (userData: UserSession) => void;
}

export function LoginAuthModal({
  dialogTitle,
  actionButton,
  isOpen,
  toggleAlertDialog,
  handleLogin,
}: LoginAuthModalProps) {
  const [isSuccessLogin, setIsSuccessLogin] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const { toast } = useToast();

  const handleResponseMessages = (message: string) => {
    switch (message) {
      case AUTH_API_MESSAGES.USER_LOGGED_IN:
      case AUTH_API_MESSAGES.USER_REGISTERED:
        setIsSuccessLogin(true);
        setIsError(false);
        toast({
          title: UI_TOAST_MESSAGES.LOGGIN_SUCCESS.title,
          description: UI_TOAST_MESSAGES.LOGGIN_SUCCESS.description,
          variant: "success",
        });
        toggleAlertDialog();
        break;
      case AUTH_API_ERRORS.INVALID_CREDENTIALS:
        setIsSuccessLogin(false);
        setIsError(true);
        break;
      case AUTH_API_ERRORS.GENERIC_ERROR:
        setIsSuccessLogin(false);
        setIsError(true);
        toggleAlertDialog();
        toast({
          title: UI_TOAST_MESSAGES.GENERIC_ERROR.title,
          description: UI_TOAST_MESSAGES.GENERIC_ERROR.description,
          variant: "destructive",
        });
        break;
      default:
        setIsSuccessLogin(false);
        setIsError(true);
        toggleAlertDialog();
        toast({
          title: UI_TOAST_MESSAGES.GENERIC_ERROR.title,
          description: UI_TOAST_MESSAGES.GENERIC_ERROR.description,
          variant: "destructive",
        });
        break;
    }
  };

  const handleLoginCredentials = async (apiResponseData: ApiResponse<UserSession>) => {
    // console.log("🚀 ~ handleLogin ~ apiResponseData:", apiResponseData);
    const { message, data } = apiResponseData;
    handleResponseMessages(message);

    console.log("🚀 ~ handleLogin ~ data:", data);
    if (!data || data?.length === 0) return;
    const [userData] = data;
    handleLogin(userData);
  };

  return (
    <ModalDialog isOpen={isOpen}>
      <AlertDialogHeader
        className="
        flex flex-col align-center justify-between gap-4
        max-h-96
        "
      >
        <AlertDialogTitle className="text-gray-700">
          {dialogTitle}
        </AlertDialogTitle>
      </AlertDialogHeader>

      <AlertDialogDescription className="h-full w-full mt-2">
        <LoginForm
          actionButton={actionButton}
          toggleAlertDialog={toggleAlertDialog}
          handleLoginCredentials={handleLoginCredentials}
          isError={isError}
          isSuccessLogin={isSuccessLogin}
        />
      </AlertDialogDescription>
    </ModalDialog>
  );
}

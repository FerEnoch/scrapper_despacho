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
import { useToast } from "@/utils/hooks/use-toast";
import { UI_TOAST_MESSAGES } from "@/i18n/constants";

interface LoginAuthModalProps {
  dialogTitle: string;
  actionButton: string;
  isOpen: boolean;
  toggleAlertDialog: () => void;
  handleSubmit: (userData: UserSession) => Promise<void>;
}

export function AuthModal({
  dialogTitle,
  actionButton,
  isOpen,
  toggleAlertDialog,
  handleSubmit,
}: LoginAuthModalProps) {
  const [isError, setIsError] = useState<boolean>(false);
  const { toast } = useToast();

  const handleResponseMessages = (
    apiResponseData: ApiResponse<UserSession>
  ): UserSession | null => {
    const { message, data } = apiResponseData;
    const userData: UserSession | null = data?.[0] ?? null;

    switch (message) {
      case AUTH_API_MESSAGES.USER_CREDENTIALS_UPDATED:
        setIsError(false);
        toast({
          title: UI_TOAST_MESSAGES.CREDENTIALS_UPDATED_SUCCESS.title,
          description:
            UI_TOAST_MESSAGES.CREDENTIALS_UPDATED_SUCCESS.description,
          variant: "success",
        });
        return userData;
      case AUTH_API_MESSAGES.USER_LOGGED_IN:
      case AUTH_API_MESSAGES.USER_REGISTERED:
        setIsError(false);
        toast({
          title: UI_TOAST_MESSAGES.LOGIN_SUCCESS.title,
          description: UI_TOAST_MESSAGES.LOGIN_SUCCESS.description,
          variant: "success",
        });
        toggleAlertDialog();
        return userData;
      case AUTH_API_ERRORS.INVALID_CREDENTIALS:
        setIsError(true);
        return null;
      case AUTH_API_ERRORS.GENERIC_ERROR:
        setIsError(true);
        toggleAlertDialog();
        toast({
          title: UI_TOAST_MESSAGES.GENERIC_ERROR.title,
          description: UI_TOAST_MESSAGES.GENERIC_ERROR.description,
          variant: "destructive",
        });
        return null;
      default:
        setIsError(true);
        toggleAlertDialog();
        toast({
          title: UI_TOAST_MESSAGES.GENERIC_ERROR.title,
          description: UI_TOAST_MESSAGES.GENERIC_ERROR.description,
          variant: "destructive",
        });
        return null;
    }
  };

  const handleLoginCredentials = async (
    apiResponseData: ApiResponse<UserSession>
  ) => {
    console.log("🚀 ~ handleLogin ~ apiResponseData:", apiResponseData);
    const userData = handleResponseMessages(apiResponseData);
    if (!userData) return;
    await handleSubmit(userData);
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
        />
      </AlertDialogDescription>
    </ModalDialog>
  );
}

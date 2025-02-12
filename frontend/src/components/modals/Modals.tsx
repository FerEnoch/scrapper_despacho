import { UI_MODAL_MESSAGES } from "@/i18n/constants";
import { FilesErrorModal } from "./FilesErrorModal";
import { AuthModalError } from "./AuthModalError";
import { LoginAuthModal } from "./LoginAuthModal";
import { RawFile, UserSession } from "@/types";

interface ModalsProps {
  modalMsg: string;
  isError: boolean;
  errorFiles: RawFile[];
  openAuthModal: boolean;
  openLoginModal: boolean;
  toggleErrorModal: () => void;
  toggleAuthModal: () => void;
  toggleLoginModal: () => void;
  handleLogin: (userData: UserSession) => void;
}

export function Modals({
  modalMsg,
  isError,
  errorFiles,
  openAuthModal,
  openLoginModal,
  toggleErrorModal,
  toggleAuthModal,
  toggleLoginModal,
  handleLogin,
}: ModalsProps) {
  return (
    <>
      <FilesErrorModal
        dialogTitle={UI_MODAL_MESSAGES.ERROR_MODAL.FILES_ERROR.dialogTitle}
        actionButton={UI_MODAL_MESSAGES.ERROR_MODAL.FILES_ERROR.actionButton}
        dialogDescription={modalMsg}
        errorFiles={errorFiles}
        isOpen={isError}
        toggleAlertDialog={toggleErrorModal}
      />
      <AuthModalError
        dialogTitle={UI_MODAL_MESSAGES.ERROR_MODAL.AUTH_ERROR.dialogTitle}
        actionButton={UI_MODAL_MESSAGES.ERROR_MODAL.AUTH_ERROR.actionButton}
        dialogDescription={modalMsg}
        isOpen={openAuthModal}
        toggleAlertDialog={toggleAuthModal}
        toggleLoginModal={toggleLoginModal}
      />
      <LoginAuthModal
        dialogTitle={UI_MODAL_MESSAGES.LOGIN.dialogTitle}
        actionButton={UI_MODAL_MESSAGES.LOGIN.actionButton}
        isOpen={openLoginModal}
        toggleAlertDialog={toggleLoginModal}
        handleLogin={handleLogin}
      />
    </>
  );
}

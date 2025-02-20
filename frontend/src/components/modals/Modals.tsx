import { UI_MODAL_MESSAGES } from "@/i18n/constants";
import { FilesErrorModal } from "./FilesErrorModal";
import { AuthModalError } from "./AuthModalError";
import { RawFile } from "@/types";
import { AuthModal } from "./AuthModal";
import { FormDataSubmit } from "@/schemas/forms";

interface ModalsProps {
  modalMsg: string;
  authModalTitle: string;
  authModalActionButton: string;
  filesError: boolean;
  errorFiles: RawFile[];
  openAuthModal: boolean;
  authError: boolean;
  isOpenAuthErrorModal: boolean;
  toggleAuthErrorModal: () => void;
  errorFilesActionHandler: (flag?: string) => void
  toggleAuthModal: (flag?: string) => void;
  handleSubmit: (userData: FormDataSubmit) => Promise<void>;
}

export function Modals({
  modalMsg,
  authModalTitle,
  authModalActionButton,
  filesError,
  errorFiles,
  openAuthModal,
  authError,
  isOpenAuthErrorModal,
  toggleAuthErrorModal,
  errorFilesActionHandler,
  toggleAuthModal,
  handleSubmit,
}: ModalsProps) {
  return (
    <>
      <FilesErrorModal
        dialogTitle={UI_MODAL_MESSAGES.ERROR_MODAL.FILES_ERROR.dialogTitle}
        actionButton={UI_MODAL_MESSAGES.ERROR_MODAL.FILES_ERROR.actionButton}
        dialogDescription={modalMsg}
        errorFiles={errorFiles}
        isOpen={filesError}
        errorFilesActionHandler={errorFilesActionHandler}
      />
      <AuthModalError
        dialogTitle={UI_MODAL_MESSAGES.ERROR_MODAL.AUTH_ERROR.dialogTitle}
        actionButton={UI_MODAL_MESSAGES.ERROR_MODAL.AUTH_ERROR.actionButton}
        dialogDescription={modalMsg}
        isOpen={isOpenAuthErrorModal}
        toggleAlertDialog={toggleAuthErrorModal}
        toggleAuthModal={toggleAuthModal}
      />
      <AuthModal
        dialogTitle={authModalTitle}
        actionButton={authModalActionButton}
        isOpen={openAuthModal}
        toggleAuthModal={toggleAuthModal}
        authError={authError}
        handleSubmit={handleSubmit}
      />
    </>
  );
}

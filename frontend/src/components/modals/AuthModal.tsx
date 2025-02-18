import {
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ModalDialog } from "@/components/ui/modal-dialog";
import { AuthForm } from "./AuthForm";
import { FormDataSubmit } from "@/schemas/forms";

interface LoginAuthModalProps {
  dialogTitle: string;
  actionButton: string;
  isOpen: boolean;
  authError: boolean;
  toggleAuthModal: (flag?: string) => void;
  handleSubmit: (userData: FormDataSubmit) => Promise<void>;
}

export function AuthModal({
  dialogTitle,
  actionButton,
  isOpen,
  authError,
  toggleAuthModal,
  handleSubmit,
}: LoginAuthModalProps) {
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
        <AuthForm
          actionButton={actionButton}
          toggleAuthModal={toggleAuthModal}
          handleSubmit={handleSubmit}
          authError={authError}
        />
      </AlertDialogDescription>
    </ModalDialog>
  );
}

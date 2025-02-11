import {
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ModalDialog } from "@/components/ui/modal-dialog";
import { LoginForm } from "../login/LoginForm";

interface LoginAuthModalProps {
  dialogTitle: string;
  actionButton: string;
  isOpen: boolean;
  toggleAlertDialog: () => void;
}

/**
 *  TODO -> Now it's just a copy of AuthModalError -> make login

 */
export function LoginAuthModal({
  dialogTitle,
  actionButton,
  isOpen,
  toggleAlertDialog,
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
        <LoginForm
          actionButton={actionButton}
          toggleAlertDialog={toggleAlertDialog}
        />
      </AlertDialogDescription>
    </ModalDialog>
  );
}

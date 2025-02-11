import {
  AlertDialogAction,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ModalDialog } from "../ui/modal-dialog";

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
        <AlertDialogDescription className="leading-6">
          {""}
        </AlertDialogDescription>
        <AlertDialogDescription className="h-full w-full mt-2">
          {""}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="mt-4">
        <AlertDialogAction onClick={() => toggleAlertDialog()}>
          {actionButton}
        </AlertDialogAction>
      </AlertDialogFooter>
    </ModalDialog>
  );
}

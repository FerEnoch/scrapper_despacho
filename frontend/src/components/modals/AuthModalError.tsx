import {
  AlertDialogAction,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ModalDialog } from "../ui/modal-dialog";

interface AuthModalErrorProps {
  dialogTitle: string;
  dialogDescription: string;
  actionButton: string;
  isOpen: boolean;
  toggleAlertDialog: () => void;
  toggleLoginModal: () => void;
}
export function AuthModalError({
  dialogTitle,
  dialogDescription,
  actionButton,
  isOpen,
  toggleAlertDialog,
  toggleLoginModal,
}: AuthModalErrorProps) {
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
          {dialogDescription}
        </AlertDialogDescription>
        <AlertDialogDescription className="h-full w-full mt-2">
          {""}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="mt-4">
        <AlertDialogAction
          className="bg-transparent hover:text-red-400 shadow-none"
          onClick={() => toggleAlertDialog()}
        >
          {"Cancelar"}
        </AlertDialogAction>
        <AlertDialogAction
          onClick={() => {
            toggleAlertDialog();
            toggleLoginModal();
          }}
        >
          {actionButton}
        </AlertDialogAction>
      </AlertDialogFooter>
    </ModalDialog>
  );
}

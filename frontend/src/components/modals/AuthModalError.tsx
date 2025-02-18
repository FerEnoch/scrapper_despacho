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
  toggleAuthModal: (flag?: string) => void;
}
export function AuthModalError({
  dialogTitle,
  dialogDescription,
  actionButton,
  isOpen,
  toggleAlertDialog,
  toggleAuthModal,
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
            toggleAuthModal("LOGIN");
          }}
        >
          {actionButton}
        </AlertDialogAction>
      </AlertDialogFooter>
    </ModalDialog>
  );
}

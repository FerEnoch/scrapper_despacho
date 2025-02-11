import { AlertDialogDescription } from "@/components/ui/alert-dialog";
import { ModalDialog } from "../ui/modal-dialog";

interface AuthModalProps {
  dialogTitle: string;
  dialogDescription: string;
  actionButton: string;
  isOpen: boolean;
  toggleAlertDialog: () => void;
}
export function AuthModal({
  dialogTitle,
  dialogDescription,
  actionButton,
  isOpen,
  toggleAlertDialog,
}: AuthModalProps) {
  return (
    <ModalDialog
      dialogTitle={dialogTitle}
      dialogDescription={dialogDescription}
      actionButton={actionButton}
      isOpen={isOpen}
      toggleAlertDialog={toggleAlertDialog}
    >
      <AlertDialogDescription className="h-full w-full mt-2">{""}</AlertDialogDescription>
    </ModalDialog>
  );
}

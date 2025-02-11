import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FilesStatsFetchingErrorProps {
  dialogTitle: string;
  dialogDescription: string;
  actionButton: string;
  toggleAlertDialog: () => void;
  isOpen: boolean;
  children: React.ReactNode;
}

export function ModalDialog({
  dialogTitle,
  dialogDescription,
  actionButton,
  isOpen,
  children,
  toggleAlertDialog,
}: FilesStatsFetchingErrorProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="min-w-[50%]">
        <AlertDialogHeader
          className="
        flex flex-col align-center justify-between gap-4
        max-h-96
        "
        >
          <AlertDialogTitle className="text-gray-700">
            <h2>{dialogTitle}</h2>
          </AlertDialogTitle>
          <AlertDialogDescription className="leading-6">
            {dialogDescription}
          </AlertDialogDescription>
          {children}
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogAction onClick={() => toggleAlertDialog()}>
            {actionButton}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

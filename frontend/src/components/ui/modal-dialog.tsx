import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";

interface FilesStatsFetchingErrorProps {
  isOpen: boolean;
  children: React.ReactNode;
}

export function ModalDialog({
  isOpen,
  children,
}: FilesStatsFetchingErrorProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="min-w-[50%]">
        {children}
      </AlertDialogContent>
    </AlertDialog>
  );
}

import { AlertDialogDescription } from "@/components/ui/alert-dialog";
import { ModalDialog } from "../ui/modal-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RawFile } from "@/types";

interface ErrorModalProps {
  errorFiles: RawFile[] | null;
  dialogTitle: string;
  dialogDescription: string;
  actionButton: string;
  isOpen: boolean;
  toggleAlertDialog: () => void;
}

export function ErrorModal({
  errorFiles,
  dialogTitle,
  dialogDescription,
  actionButton,
  isOpen,
  toggleAlertDialog,
}: ErrorModalProps) {
  return (
    <ModalDialog
      dialogTitle={dialogTitle}
      dialogDescription={dialogDescription}
      actionButton={actionButton}
      isOpen={isOpen}
      toggleAlertDialog={toggleAlertDialog}
    >
      <AlertDialogDescription
        className="
                h-full w-full
                mt-2
                overflow-x-hidden overflow-y-scroll 
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-track]:bg-gray-300
                [&::-webkit-scrollbar-thumb]:bg-gray-700
              "
      >
        {isOpen && errorFiles && errorFiles.length > 0 && (
          <>
            <h4 className="mb-4 text-sm font-medium leading-none">
              Expedientes inválidos
            </h4>
            <ScrollArea className="h-full">
              <Separator />
              {errorFiles.map((file, index) => (
                <>
                  <p
                    className="text-red-400"
                    key={file?.completeNum + "" + index}
                  >
                    {file?.completeNum}
                  </p>
                  {index < errorFiles.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </>
              ))}
            </ScrollArea>
          </>
        )}
      </AlertDialogDescription>
    </ModalDialog>
  );
}

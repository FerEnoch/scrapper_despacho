import {
  AlertDialogAction,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ModalDialog } from "../ui/modal-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RawFile } from "@/types";

interface FilesErrorModalProps {
  errorFiles: RawFile[] | null;
  dialogTitle: string;
  dialogDescription: string;
  actionButton: string;
  isOpen: boolean;
  errorFilesActionHandler: (flag?: string) => void;
}

export function FilesErrorModal({
  errorFiles,
  dialogTitle,
  dialogDescription,
  actionButton,
  isOpen,
  errorFilesActionHandler,
}: FilesErrorModalProps) {
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
        <AlertDialogDescription>
          {isOpen && errorFiles && errorFiles.length > 0 && (
            <h4 className="mb-4 text-sm font-medium leading-none">
              Expedientes inválidos
            </h4>
          )}
        </AlertDialogDescription>
        <AlertDialogDescription
          className="
                h-full w-full
                mt-2
                overflow-x-hidden overflow-y-scroll 
                [&::-webkit-scrollbar]:w-1
                [&::-webkit-scrollbar-track]:bg-gray-300
                [&::-webkit-scrollbar-thumb]:bg-gray-700
              "
        >
          {isOpen && errorFiles && errorFiles.length > 0 && (
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
          )}
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter className="mt-4">
        <AlertDialogAction onClick={() => errorFilesActionHandler()}>
          {actionButton}
        </AlertDialogAction>
      </AlertDialogFooter>
    </ModalDialog>
  );
}

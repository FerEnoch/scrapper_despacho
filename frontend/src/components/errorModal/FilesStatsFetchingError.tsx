import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { RawFile } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface FilesStatsFetchingErrorProps {
  dialogTitle: string;
  dialogDescription: string;
  errorFiles: RawFile[] | null;
  toggleAlertDialog: () => void;
  isOpen: boolean;
}

export function FilesStatsFetchingError({
  dialogTitle,
  dialogDescription,
  errorFiles,
  isOpen,
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
          <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
          <AlertDialogDescription className="leading-6">
            {dialogDescription}
          </AlertDialogDescription>
          {isOpen && errorFiles && errorFiles.length > 0 && (
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
              <ScrollArea className="h-full">
                <h4 className="mb-4 text-sm font-medium leading-none">
                  Expedientes inválidos
                </h4>
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
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogAction onClick={() => toggleAlertDialog()}>
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

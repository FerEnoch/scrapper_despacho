import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RawFile } from "@/models/types";

interface FilesStatsFetchingErrorProps {
  dialogTitle: string;
  dialogDescription: string;
  errorFiles: RawFile[] | null;
}

export function FilesStatsFetchingError({
  dialogTitle,
  dialogDescription,
  errorFiles,
}: FilesStatsFetchingErrorProps) {
  return (
    <Alert>
      <AlertTitle>{dialogTitle}</AlertTitle>
      <AlertDescription>{dialogDescription} </AlertDescription>
      {errorFiles && errorFiles.length > 0 && (
        <div className="mt-2 text-red-500">
          <AlertDescription>
            {errorFiles.map((file) => (
              <p key={file["Número"]}>{file["Número"]}</p>
            ))}
          </AlertDescription>
        </div>
      )}
    </Alert>
  );
}

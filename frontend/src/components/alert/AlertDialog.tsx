import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface FilesStatsFetchingErrorProps {
  dialogTitle: string;
  dialogDescription: string;
}

export function FilesStatsFetchingError({
  dialogTitle,
  dialogDescription,
}: FilesStatsFetchingErrorProps) {
  return (
    <Alert>
      <AlertTitle>{dialogTitle}</AlertTitle>
      <AlertDescription>{dialogDescription} </AlertDescription>
    </Alert>
  );
}

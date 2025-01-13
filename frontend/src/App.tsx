import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Columns } from "./components/table/Columns";
import { Input } from "@/components/ui/input";

import { formSchema } from "@/schemas/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "./api";
import { ApiResponseStats, FileEndedStats, RawFile } from "./models/types";
import { FileStats } from "./models/types";
import { useState } from "react";
import { DataTable } from "./components/table/DataTable";
import { TableSkeleton } from "./components/table/TableSkeleton";
import { FilesStatsFetchingError } from "./components/alert/AlertDialog";
import { ERROR_DIALOG_MESSAGE } from "./config/constants";
// import { apiResponseExample } from "./sample-api-response";

export default function App() {
  const [filesData, setFilesData] = useState<
    FileStats[] | FileEndedStats[] | undefined
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorFiles, setErrorFiles] = useState<RawFile[]>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setIsError(false);
    const formData = new FormData();
    formData.append("file", data.file);

    const { message, data: apiResponseData } = (await api.uploadFile(
      formData
    )) as ApiResponseStats<FileStats | FileEndedStats | RawFile>;

    console.log("🚀 ~ onSubmit ~ message:", message);

    if (message === "Invalid raw data") {
      setIsError(true);
      setErrorFiles(apiResponseData as RawFile[]);
    }

    setFilesData(apiResponseData as Array<FileStats | FileEndedStats>);
    setIsLoading(false);
  };

  console.log(errorFiles);
  return (
    <>
      <Card
        className="
      border-sm border-gray-400 shadow-none my-8 mx-auto px-4 max-w-[60%]
      bg-green-100 
      "
      >
        <CardHeader>
          <CardTitle className="text-2xl">Santa Fe Hábitat</CardTitle>

          <CardDescription className="leading-snug">
            <p>
              Carga un archivo .csv que contenga una columna "Número" con el
              número completo de expediente SIEM.
            </p>
            <p>
              Podrás visualizar su estado actual y finalizar su tramitación.
            </p>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              encType="multipart/form-data"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
            >
              <FormField
                name="file"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="file">Archivo</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white cursor-pointer hover:bg-gray-100 rounded-md"
                        type="file"
                        id="file"
                        placeholder="expedientes.csv"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription>Carga un archivo .csv</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                Buscar en SIEM
              </Button>
            </form>
          </Form>
          {isError && (
            <FilesStatsFetchingError
              dialogTitle="Error"
              dialogDescription={
                ERROR_DIALOG_MESSAGE + " \n" + errorFiles.join("\n")
              }
            />
          )}
        </CardContent>
      </Card>
      {filesData && !isLoading && (
        <DataTable columns={Columns} data={filesData} />
      )}
      {isLoading && <TableSkeleton />}
    </>
  );
}

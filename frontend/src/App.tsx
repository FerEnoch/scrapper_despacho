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
import { API_ERRORS, ApiResponseStats, RawFile } from "./types";
import { FileStats } from "./types";
import { useState } from "react";
import { DataTable } from "./components/table/DataTable";
import { TableSkeleton } from "./components/table/TableSkeleton";
import { FilesStatsFetchingError } from "./components/alert/AlertDialog";
import { CARD_TEXTS, UI_ERROR_MESSAGES } from "./config/constants";
import { MagnifyingGlass } from "react-loader-spinner";

export default function App() {
  const [filesData, setFilesData] = useState<FileStats[]>([]);
  const [isSerching, setIsSearching] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorFiles, setErrorFiles] = useState<RawFile[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
    },
  });

  const onDataChange = (data: FileStats[]) => {
    setFilesData(data);
  };

  const handleResponseMessages = ({
    message,
    data,
  }: ApiResponseStats<FileStats | RawFile>) => {
    switch (message) {
      case API_ERRORS.SERVER_ERROR:
      case API_ERRORS.INVALID_FILE:
      case API_ERRORS.NO_FILE_TO_UPLOAD:
      case API_ERRORS.NOT_FOUND:
      case API_ERRORS.GENERIC_ERROR:
        setIsSearching(false);
        setErrorMsg(UI_ERROR_MESSAGES[message]);
        setIsError(true);
        setFilesData([]);
        return;

      case API_ERRORS.INVALID_DATA:
        setErrorMsg(UI_ERROR_MESSAGES[message]);
        setIsError(true);
        setErrorFiles(data as RawFile[]);
        setIsSearching(false);
        setFilesData([]);
        return;

      case API_ERRORS.NO_FILES_TO_END:
        setErrorMsg(UI_ERROR_MESSAGES[message]);
        setIsError(true);
        return;

      default:
        setFilesData(data as FileStats[]);
        setIsSearching(false);
        return data;
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSearching(true);
    setIsError(false);
    setErrorFiles([]);
    const formData = new FormData();
    formData.append("file", data.file);

    setFileName(data.file.name);

    const response = (await api.uploadFile(formData)) as ApiResponseStats<
      FileStats | RawFile
    >;

    handleResponseMessages(response);
    formData.delete("file");
  };

  const onEndFilesClick = (apiResponseData: ApiResponseStats<FileStats>) => {
    const data = handleResponseMessages(apiResponseData);

    const newState = filesData.map((currentFile) => {
      if (!data) return currentFile;
      const updatedFile = data.find((file) => file.num === currentFile.num);
      return updatedFile ? updatedFile : currentFile;
    }) as FileStats[];

    setFilesData(newState);
  };

  return (
    <>
      <Card
        className="
      border-sm border-gray-400 shadow-none my-8 mx-auto px-4 max-w-[60%]
      bg-green-100 
      "
      >
        <CardHeader>
          <CardTitle className="text-3xl">{CARD_TEXTS.title}</CardTitle>

          <CardDescription>
            <p className="text-sm leading-8 text-gray-600">{CARD_TEXTS.body}</p>
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
                        onChange={(e) => {
                          setIsError(false);
                          field.onChange(e.target.files?.[0]);
                        }}
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
              <div className="flex justify-start items-center space-x-2">
                <Button type="submit" disabled={isSerching}>
                  Buscar en SIEM
                </Button>
                {isSerching && (
                  <MagnifyingGlass
                    visible={true}
                    height="30"
                    width="30"
                    ariaLabel="magnifying-glass-loading"
                    wrapperStyle={{}}
                    wrapperClass="magnifying-glass-wrapper"
                    glassColor="#c0efff"
                    color="#666"
                  />
                )}
              </div>
            </form>
          </Form>
          {isError && (
            <FilesStatsFetchingError
              dialogTitle="Error"
              dialogDescription={errorMsg}
              errorFiles={errorFiles}
            />
          )}
        </CardContent>
      </Card>
      {filesData && !isSerching && (
        <DataTable
          columns={Columns}
          data={filesData}
          fileName={fileName ?? ""}
          onEndFilesClick={onEndFilesClick}
          onDataChange={onDataChange}
        />
      )}
      {isSerching && <TableSkeleton />}
    </>
  );
}

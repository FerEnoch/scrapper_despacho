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
import { uploadFileFormSchema } from "@/schemas/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "./api";
import { API_ERRORS, ApiResponseStats, RawFile } from "./types";
import { FileStats } from "./types";
import { useState } from "react";
import { DataTable } from "./components/table/DataTable";
import { TableSkeleton } from "./components/table/TableSkeleton";
import { CARD_TEXTS, UI_ERROR_MESSAGES } from "./i18n/constants";
import { MagnifyingGlass } from "react-loader-spinner";
import { SpeedDial } from "./components/speedDial/SpeedDial";
import { Modals } from "./components/modal/Modals";

export default function App() {
  const [filesData, setFilesData] = useState<FileStats[]>([]);
  const [isSerching, setIsSearching] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [openAuthModal, setOpenAuthModal] = useState<boolean>(false);
  const [openLoginModal, setOpenLoginModal] = useState<boolean>(true);
  const [errorFiles, setErrorFiles] = useState<RawFile[]>([]);
  const [modalMsg, setModalMsg] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const form = useForm<z.infer<typeof uploadFileFormSchema>>({
    resolver: zodResolver(uploadFileFormSchema),
    defaultValues: {
      file: undefined,
    },
  });

  const handleDownloadData = async () => {
    try {
      await api.downloadFiles(filesData, fileName);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.message === API_ERRORS.GENERIC_ERROR) {
        return;
      }
    }
  };

  const onDataChange = (data: FileStats[], message: string) => {
    handleResponseMessages({ message, data });

    setFilesData(data);
  };

  const toggleErrorModal = () => {
    setIsError((error) => !error);
  };

  const toggleLoginModal = () => {
    setOpenLoginModal((login) => !login);
  };

  const toggleAuthModal = () => {
    setOpenAuthModal((auth) => !auth);
  };

  const handleResponseMessages = ({
    message,
    data,
  }: ApiResponseStats<FileStats | RawFile>) => {
    switch (message) {
      case API_ERRORS.UNAUTHORIZED:
        setIsSearching(false);
        setModalMsg(UI_ERROR_MESSAGES[message]);
        setOpenAuthModal(true);
        return;

      case API_ERRORS.SERVER_ERROR:
      case API_ERRORS.INVALID_FILE:
      case API_ERRORS.NO_FILE_TO_UPLOAD:
      case API_ERRORS.NOT_FOUND:
      case API_ERRORS.GENERIC_ERROR:
      case API_ERRORS.NO_FILE_STATS_RETRIEVED:
        setIsSearching(false);
        setModalMsg(UI_ERROR_MESSAGES[message]);
        setIsError(true);
        setFilesData([]);
        return;

      case API_ERRORS.INVALID_DATA:
        setIsSearching(false);
        setModalMsg(UI_ERROR_MESSAGES[message]);
        setIsError(true);
        setErrorFiles(data as RawFile[]);
        setFilesData([]);
        return;

      case API_ERRORS.NO_FILES_TO_END:
        setModalMsg(UI_ERROR_MESSAGES[message]);
        setIsError(true);
        return;

      default:
        setFilesData(data as FileStats[]);
        setIsSearching(false);
        return data;
    }
  };

  const onSubmit = async (data: z.infer<typeof uploadFileFormSchema>) => {
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
      border-none border-gray-400 shadow-md 
      mt-20 mb-16 px-4 min-h-96 py-4
      mx-auto max-w-[90%] xl:max-w-[80%] space-y-4
      bg-opacity-60 bg-white backdrop-filter backdrop-blur-lg
      "
      >
        <CardHeader>
          <CardTitle className="text-3xl mb-6">{CARD_TEXTS.title}</CardTitle>

          <CardDescription className="my-8">
            <p
              className="
            text-pretty text-sm leading-6 text-gray-700
            max-w-[80ch]
            "
            >
              {CARD_TEXTS.body}
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
                        onChange={(e) => {
                          setIsError(false);
                          field.onChange(e.target.files?.[0]);
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription>Adjunta un archivo .csv</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-start items-center space-x-2">
                <Button
                  className="bg-primary hover:bg-green-300"
                  type="submit"
                  disabled={isSerching}
                >
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
        </CardContent>
      </Card>
      <Modals
        modalMsg={modalMsg}
        isError={isError}
        errorFiles={errorFiles}
        toggleErrorModal={toggleErrorModal}
        openAuthModal={openAuthModal}
        openLoginModal={openLoginModal}
        toggleAuthModal={toggleAuthModal}
        toggleLoginModal={toggleLoginModal}
      />
      {isSerching && <TableSkeleton />}
      {filesData.length > 0 && !isSerching ? (
        <>
          <DataTable
            columns={Columns}
            data={filesData}
            onEndFilesClick={onEndFilesClick}
            onDataChange={onDataChange}
          />
          <SpeedDial handleDownloadData={handleDownloadData} />
        </>
      ) : (
        <></>
      )}
    </>
  );
}

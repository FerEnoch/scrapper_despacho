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
import { TableSkeleton } from "@/components/dataTable/TableSkeleton";
import { Input } from "@/components/ui/input";
import { uploadFileFormSchema } from "@/schemas/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { filesApi } from "@/api/filesApi";
import { FileStats, ApiResponse, RawFile, UserSession } from "@/types";
import {
  AUTH_API_ERRORS,
  AUTH_API_MESSAGES,
  FILES_API_ERRORS,
  FILES_API_MESSAGES,
} from "@/types/enums";
import { lazy, useState } from "react";
import {
  CARD_TEXTS,
  UI_ERROR_MESSAGES,
  UI_TOAST_MESSAGES,
} from "@/i18n/constants";
import { MagnifyingGlass } from "react-loader-spinner";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "./utils/hooks/use-toast";
import { Columns } from "@/components/dataTable/Columns";
import { DataTable } from "@/components/dataTable";
import { useActiveUser } from "./utils/hooks/use-active-user";

const SpeedDial = lazy(() =>
  import("@/components/speedDial/SpeedDial").then((module) => ({
    default: module.SpeedDial,
  }))
);

const Account = lazy(() =>
  import("@/components/account/Account").then((module) => ({
    default: module.Account,
  }))
);

const Modals = lazy(() =>
  import("./components/modals/Modals").then((module) => ({
    default: module.Modals,
  }))
);

export default function App() {
  const [filesData, setFilesData] = useState<FileStats[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileStats[]>([]);
  const [isSerchingFiles, setIsSearchingFiles] = useState<boolean>(false);
  const [isFilesApiError, setFilesApiError] = useState<boolean>(false);
  const [openAuthModal, setOpenAuthModal] = useState<boolean>(false);
  const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
  const [errorFiles, setErrorFiles] = useState<RawFile[]>([]);
  const [modalMsg, setModalMsg] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

  const { activeUser, handleActiveUser, logoutAndClearCookie } =
    useActiveUser();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof uploadFileFormSchema>>({
    resolver: zodResolver(uploadFileFormSchema),
    defaultValues: {
      file: undefined,
    },
  });

  const onFilterData = (filteredFiles: FileStats[]) => {
    setFilteredFiles(filteredFiles);
  };

  const handleLogin = async (userData: UserSession) => {
    const { userId, user, pass } = userData;
    handleActiveUser({
      userId: userId,
      username: user,
      password: pass,
    });
  };

  const handleDownloadData = async () => {
    try {
      const userFileName = window.prompt(
        "Introduce un nombre para el archivo .csv",
        fileName
      );
      if (!userFileName) return;
      await filesApi.downloadFiles(filteredFiles, userFileName);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.message === FILES_API_ERRORS.GENERIC_ERROR) {
        return;
      }
    }
  };

  const onDataChange = (data: FileStats[], message: string) => {
    handleFilesResponseMessages({ message, data });
    setFilesData(data);
  };

  const toggleErrorModal = () => {
    setFilesApiError((error) => !error);
  };

  const toggleLoginModal = () => {
    setOpenLoginModal((login) => !login);
  };

  const toggleAuthModal = () => {
    setOpenAuthModal((auth) => !auth);
  };

  const handleAuthResponseMessages = ({
    message /*data -> unused parameter */,
  }: ApiResponse<UserSession>) => {
    switch (message) {
      case AUTH_API_MESSAGES.USER_LOGGED_OUT:
        logoutAndClearCookie();
        toast({
          title: UI_TOAST_MESSAGES.LOGOUT_SUCCESS.title,
          description: UI_TOAST_MESSAGES.LOGOUT_SUCCESS.description,
          variant: "default",
        });
        break;
      case AUTH_API_ERRORS.LOGOUT_FAILED:
        toast({
          title: UI_TOAST_MESSAGES.LOGOUT_ERROR.title,
          description: UI_TOAST_MESSAGES.LOGOUT_ERROR.description,
          variant: "destructive",
        });
        break;
      case AUTH_API_ERRORS.SERVER_ERROR:
        toast({
          title: UI_TOAST_MESSAGES.GENERIC_ERROR.title,
          description: UI_TOAST_MESSAGES.GENERIC_ERROR.description,
          variant: "destructive",
        });
        break;
      default:
        toast({
          title: UI_TOAST_MESSAGES.GENERIC_ERROR.title,
          description: UI_TOAST_MESSAGES.GENERIC_ERROR.description,
          variant: "destructive",
        });
    }
  };

  const handleFilesResponseMessages = ({
    message,
    data,
  }: ApiResponse<FileStats | RawFile>) => {
    switch (message) {
      case FILES_API_MESSAGES.FILE_UPLOADED:
        setFilesData(data as FileStats[]);
        setIsSearchingFiles(false);
        toast({
          title: UI_TOAST_MESSAGES.FILE_UPLOADED.title,
          description: UI_TOAST_MESSAGES.FILE_UPLOADED.description(
            data?.length || 0
          ),
          variant: "default",
        });
        break;
      case FILES_API_ERRORS.UNAUTHORIZED:
      case FILES_API_ERRORS.TOKEN_MISSING_ACCESS_DENIED:
        setIsSearchingFiles(false);
        setModalMsg(UI_ERROR_MESSAGES[message]);
        setOpenAuthModal(true);
        return;

      case FILES_API_ERRORS.SERVER_ERROR:
      case FILES_API_ERRORS.INVALID_FILE:
      case FILES_API_ERRORS.NO_FILE_TO_UPLOAD:
      case FILES_API_ERRORS.NOT_FOUND:
      case FILES_API_ERRORS.GENERIC_ERROR:
      case FILES_API_ERRORS.NO_FILE_STATS_RETRIEVED:
      case FILES_API_ERRORS.CREDENTIALS_NOT_PROVIDED:
      case FILES_API_ERRORS.COULD_NOT_LOGIN_IN_SIEM:
        setIsSearchingFiles(false);
        setModalMsg(UI_ERROR_MESSAGES[message]);
        setFilesApiError(true);
        setFilesData([]);
        return;

      case FILES_API_ERRORS.INVALID_DATA:
        setIsSearchingFiles(false);
        setModalMsg(UI_ERROR_MESSAGES[message]);
        setFilesApiError(true);
        setErrorFiles(data as RawFile[]);
        setFilesData([]);
        return;

      case FILES_API_ERRORS.NO_FILES_TO_END:
        setModalMsg(UI_ERROR_MESSAGES[message]);
        setFilesApiError(true);
        return;

      default:
        setFilesData(data as FileStats[]);
        setIsSearchingFiles(false);
        return data;
    }
  };

  const onSubmitFileForm = async (
    data: z.infer<typeof uploadFileFormSchema>
  ) => {
    setIsSearchingFiles(true);
    setFilesApiError(false);
    setErrorFiles([]);

    const formData = new FormData();
    formData.append("file", data.file);

    const [fileRawName] = data.file.name.split(".csv");

    const defaultFileName = `${fileRawName}.download`;

    setFileName(defaultFileName);

    const response = (await filesApi.uploadFile(formData)) as ApiResponse<
      FileStats | RawFile
    >;

    handleFilesResponseMessages(response);
    formData.delete("file");
  };

  const onEndFilesClick = (apiResponseData: ApiResponse<FileStats>) => {
    const data = handleFilesResponseMessages(apiResponseData);

    const newState = filesData.map((currentFile) => {
      if (!data) return currentFile;
      const updatedFile = data.find((file) => file.num === currentFile.num);
      return updatedFile ? updatedFile : currentFile;
    }) as FileStats[];

    setFilesData(newState);
  };

  const handleLogout = (apiResponse: ApiResponse<UserSession>) => {
    handleAuthResponseMessages(apiResponse);
  };

  const handleChangeCredentials = (apiResponse: ApiResponse<UserSession>) => {
    // handleAuthResponseMessages(apiResponse);
    console.log("🚀 ~ handleChangeCredentials ~ apiResponse:", apiResponse);
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
        <CardHeader className="relative">
          {activeUser.username.length > 0 && (
            <Account
              activeUser={activeUser}
              handleLogout={handleLogout}
              handleChangeCredentials={handleChangeCredentials}
            />
          )}
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
              onSubmit={form.handleSubmit(onSubmitFileForm)}
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
                          setFilesApiError(false);
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
                  disabled={isSerchingFiles}
                >
                  Buscar en SIEM
                </Button>
                {isSerchingFiles && (
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
        isError={isFilesApiError}
        errorFiles={errorFiles}
        toggleErrorModal={toggleErrorModal}
        openAuthModal={openAuthModal}
        openLoginModal={openLoginModal}
        toggleAuthModal={toggleAuthModal}
        toggleLoginModal={toggleLoginModal}
        handleLogin={handleLogin}
      />
      <Toaster />
      {isSerchingFiles && <TableSkeleton />}
      {filesData.length > 0 && !isSerchingFiles ? (
        <>
          <DataTable
            columns={Columns}
            data={filesData}
            onEndFilesClick={onEndFilesClick}
            onDataChange={onDataChange}
            onFilterData={onFilterData}
          />
          <SpeedDial handleDownloadData={handleDownloadData} />
        </>
      ) : (
        <></>
      )}
    </>
  );
}

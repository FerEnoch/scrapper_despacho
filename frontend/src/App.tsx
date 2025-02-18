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
import { FormDataSubmit, uploadFileFormSchema } from "@/schemas/forms";
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
import { lazy, useCallback, useState } from "react";
import {
  CARD_TEXTS,
  UI_ERROR_MESSAGES,
  UI_MODAL_MESSAGES,
  UI_TOAST_MESSAGES,
} from "@/i18n/constants";
import { MagnifyingGlass } from "react-loader-spinner";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "./utils/hooks/use-toast";
import { Columns } from "@/components/dataTable/Columns";
import { DataTable } from "@/components/dataTable";
import { useActiveUser } from "./utils/hooks/use-active-user";
import { authApi } from "./api/authApi";

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
  /** data - data loading state */
  const [filesData, setFilesData] = useState<FileStats[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileStats[]>([]);
  const [isSerchingFiles, setIsSearchingFiles] = useState<boolean>(false);
  const [errorFiles, setErrorFiles] = useState<RawFile[]>([]);
  /** handle file downloading name */
  const [fileName, setFileName] = useState<string>("");
  /** errors */
  const [isFilesApiError, setIsFilesApiError] = useState<boolean>(false);
  const [isAuthApiError, setIsAuthApiError] = useState<boolean>(false);
  /** modal handlers */
  const [modalMsg, setModalMsg] = useState<string>("");
  const [authModalTitle, setAuthModalTitle] = useState<string>("");
  const [authModalActionButton, setAuthModalActionButton] =
    useState<string>("");
  const [openAuthModal, setOpenAuthModal] = useState<boolean>(false);
  const [isOpenAuthErrorModal, setIsOpenAuthErrorModal] =
    useState<boolean>(false);
  const [submitHandler, setSubmitHandler] = useState<
    (data: FormDataSubmit) => Promise<void>
  >(() => Promise.resolve());
  /** custom hooks */
  const { toast } = useToast();
  const { activeUser, handleActiveUser, logoutAndClearCookie } =
    useActiveUser();
  const form = useForm<z.infer<typeof uploadFileFormSchema>>({
    resolver: zodResolver(uploadFileFormSchema),
    defaultValues: {
      file: undefined,
    },
  });

  const onFilterData = useCallback((filteredFiles: FileStats[]) => {
    setFilteredFiles(filteredFiles);
  }, []);

  const handleDownloadData = useCallback(async () => {
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
  }, [fileName, filteredFiles]);

  const toggleFilesApiErrorModal = useCallback(() => {
    setIsFilesApiError((error) => !error);
  }, []);

  const toggleAuthErrorModal = () => {
    setIsOpenAuthErrorModal((auth) => !auth);
  };

  const handleFilesResponseMessages = useCallback(
    ({ message, data }: ApiResponse<FileStats | RawFile>) => {
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
          toggleAuthErrorModal();
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
          setIsFilesApiError(true);
          setFilesData([]);
          return;

        case FILES_API_ERRORS.INVALID_DATA:
          setIsSearchingFiles(false);
          setModalMsg(UI_ERROR_MESSAGES[message]);
          setIsFilesApiError(true);
          setErrorFiles(data as RawFile[]);
          setFilesData([]);
          return;

        case FILES_API_ERRORS.NO_FILES_TO_END:
          setModalMsg(UI_ERROR_MESSAGES[message]);
          setIsFilesApiError(true);
          return;

        default:
          setFilesData(data as FileStats[]);
          setIsSearchingFiles(false);
          return data;
      }
    },
    [toast]
  );

  const onDataChange = useCallback(
    (data: FileStats[], message: string) => {
      handleFilesResponseMessages({ message, data });
      setFilesData(data);
    },
    [handleFilesResponseMessages]
  );

  const onSubmitFileForm = useCallback(
    async (data: z.infer<typeof uploadFileFormSchema>) => {
      setIsSearchingFiles(true);
      setIsFilesApiError(false);
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
    },
    [handleFilesResponseMessages]
  );

  const onEndFilesClick = useCallback(
    (apiResponseData: ApiResponse<FileStats>) => {
      console.log("🚀 ~ onEndFilesClick ~ apiResponseData:", apiResponseData);
      const data = handleFilesResponseMessages(apiResponseData);

      const newState = filesData.map((currentFile) => {
        if (!data) return currentFile;
        const updatedFile = data.find((file) => file.num === currentFile.num);
        return updatedFile ? updatedFile : currentFile;
      }) as FileStats[];

      setFilesData(newState);
    },
    [filesData, handleFilesResponseMessages]
  );

  const handleAuthResponseMessages = useCallback(
    ({ message, data }: ApiResponse<UserSession>) => {
      const userData: UserSession | null = data?.[0] ?? null;
      switch (message) {
        case AUTH_API_MESSAGES.USER_CREDENTIALS_UPDATED:
          toggleAuthModal();
          toast({
            title: UI_TOAST_MESSAGES.CREDENTIALS_UPDATED_SUCCESS.title,
            description:
              UI_TOAST_MESSAGES.CREDENTIALS_UPDATED_SUCCESS.description,
            variant: "success",
          });
          return userData;
        case AUTH_API_MESSAGES.USER_LOGGED_IN:
        case AUTH_API_MESSAGES.USER_REGISTERED:
          toggleAuthModal();
          toast({
            title: UI_TOAST_MESSAGES.LOGIN_SUCCESS.title,
            description: UI_TOAST_MESSAGES.LOGIN_SUCCESS.description,
            variant: "success",
          });
          return userData;
        case AUTH_API_ERRORS.INVALID_CREDENTIALS:
          setIsAuthApiError(true);
          return null;
        case AUTH_API_ERRORS.GENERIC_ERROR:
          toggleAuthModal();
          toast({
            title: UI_TOAST_MESSAGES.GENERIC_ERROR.title,
            description: UI_TOAST_MESSAGES.GENERIC_ERROR.description,
            variant: "destructive",
          });
          return null;
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
        case AUTH_API_ERRORS.RESOURCE_NOT_FOUND:
          setIsAuthApiError(true);
          return null;
        case AUTH_API_ERRORS.SERVER_ERROR:
          toggleAuthModal();
          toast({
            title: UI_TOAST_MESSAGES.GENERIC_ERROR.title,
            description: UI_TOAST_MESSAGES.GENERIC_ERROR.description,
            variant: "destructive",
          });
          break;
        default:
          toggleAuthModal();
          toast({
            title: UI_TOAST_MESSAGES.GENERIC_ERROR.title,
            description: UI_TOAST_MESSAGES.GENERIC_ERROR.description,
            variant: "destructive",
          });
          return null;
      }
    },
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    []
  );

  const handleLogin = useCallback(
    async (data: FormDataSubmit) => {
      const apiResponse = await authApi.register(data);
      const userData = handleAuthResponseMessages(apiResponse);
      if (!userData) return;
      const { userId, user, pass } = userData;
      handleActiveUser({
        userId: userId,
        username: user,
        password: pass,
      });
    },
    [handleActiveUser, handleAuthResponseMessages]
  );

  const handleLogout = useCallback(async () => {
    const apiResponse = await authApi.logout();
    handleAuthResponseMessages(apiResponse);
  }, [handleAuthResponseMessages]);

  const handleUpdateCredentials = useCallback(
    async (data: FormDataSubmit) => {
      // Rename just for clarity
      const { user: newUser, pass: newPass } = data;
      const apiResponse = await authApi.updateCredentials(activeUser.userId, {
        user: newUser,
        pass: newPass,
      });
      const userData = handleAuthResponseMessages(apiResponse);
      if (!userData) return;

      const { userId, user, pass } = userData;
      handleActiveUser({
        userId,
        username: user,
        password: pass,
      });
    },
    [activeUser, handleAuthResponseMessages, handleActiveUser]
  );

  const toggleAuthModal = useCallback(
    (flag?: string) => {
      if (flag === "UPDATE_CREDENTIALS") {
        setSubmitHandler(() => handleUpdateCredentials);
        setAuthModalTitle(UI_MODAL_MESSAGES.UPDATE_CREDENTIALS.dialogTitle);
        setAuthModalActionButton(
          UI_MODAL_MESSAGES.UPDATE_CREDENTIALS.actionButton
        );
      } else if (flag === "LOGIN") {
        setSubmitHandler(() => handleLogin);
        setAuthModalTitle(UI_MODAL_MESSAGES.LOGIN.dialogTitle);
        setAuthModalActionButton(UI_MODAL_MESSAGES.LOGIN.actionButton);
      }
      setIsAuthApiError(false);
      setOpenAuthModal((auth) => !auth);
    },
    [handleLogin, handleUpdateCredentials]
  );

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
              toggleAuthModal={toggleAuthModal}
              handleLogout={handleLogout}
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
                          setIsFilesApiError(false);
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
        authModalTitle={authModalTitle}
        authModalActionButton={authModalActionButton}
        filesError={isFilesApiError}
        authError={isAuthApiError}
        errorFiles={errorFiles}
        openAuthModal={openAuthModal}
        isOpenAuthErrorModal={isOpenAuthErrorModal}
        toggleAuthErrorModal={toggleAuthErrorModal}
        toggleErrorModal={toggleFilesApiErrorModal}
        toggleAuthModal={toggleAuthModal}
        handleSubmit={submitHandler}
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

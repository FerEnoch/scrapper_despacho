import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DataTable } from "@/components/table/DataTable";
import { TableSkeleton } from "@/components/table/TableSkeleton";
import { SpeedDial } from "@/components/speedDial/SpeedDial";
import { Input } from "@/components/ui/input";
import { Columns } from "@/components/table/Columns";
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
} from "@/types/enums";
import { useEffect, useState } from "react";
import {
  CARD_TEXTS,
  UI_ERROR_MESSAGES,
  UI_TOAST_MESSAGES,
} from "@/i18n/constants";
import { MagnifyingGlass } from "react-loader-spinner";
import { Modals } from "./components/modals/Modals";
import { Toaster } from "@/components/ui/toaster";
import { CircleUser, LogOutIcon } from "lucide-react";
import { authApi } from "./api/authApi";
import { useToast } from "./lib/hooks/use-toast";
import { parseJwt } from "./lib/utils";

export default function App() {
  const [filesData, setFilesData] = useState<FileStats[]>([]);
  const [isSerchingFiles, setIsSearchingFiles] = useState<boolean>(false);
  const [isFilesApiError, setFilesApiError] = useState<boolean>(false);
  const [openAuthModal, setOpenAuthModal] = useState<boolean>(false);
  const [openLoginModal, setOpenLoginModal] = useState<boolean>(true);
  const [errorFiles, setErrorFiles] = useState<RawFile[]>([]);
  const [modalMsg, setModalMsg] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [activeUser, setActiveUser] = useState<{
    userId: string;
    username: string;
    password: string;
  } | null>(null);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof uploadFileFormSchema>>({
    resolver: zodResolver(uploadFileFormSchema),
    defaultValues: {
      file: undefined,
    },
  });

  useEffect(() => {
    const cookie = document.cookie;
    if (!cookie) return;
    const data = parseJwt(cookie);
    const { userId, user, pass } = data;
    setActiveUser({ userId, username: user, password: pass });
  }, []);

  const handleLogin = async (userData: UserSession) => {
    setActiveUser({
      userId: userData.userId,
      username: userData.user,
      password: userData.pass,
    });
  };

  const handleDownloadData = async () => {
    try {
      const userFileName = window.prompt(
        "Introduce un nombre para el archivo .csv",
        fileName
      );
      if (!userFileName) return;
      await filesApi.downloadFiles(filesData, userFileName);
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
        toast({
          title: UI_TOAST_MESSAGES.LOGOUT_SUCCESS.title,
          description: UI_TOAST_MESSAGES.LOGOUT_SUCCESS.description,
          variant: "default",
        });
        setActiveUser(null);
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
      case FILES_API_ERRORS.UNAUTHORIZED:
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

  const onSubmit = async (data: z.infer<typeof uploadFileFormSchema>) => {
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

  const handleLogout = async () => {
    const apiResponse = await authApi.logout();
    handleAuthResponseMessages(apiResponse);
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
          {activeUser && activeUser.username.length > 0 && (
            <div className="absolute right-8 top-8 space-y-4 flex flex-col justify-center items-center">
              <CircleUser
                className="
                h-10 w-10 rounded-full
                bg-primary text-white
                shadow-md
                "
              />
              <div className="flex justify-center items-center">
                <Badge className="py-2 px-4" variant="outline">
                  {activeUser.username}
                </Badge>
                <LogOutIcon
                  className="
                h-6 w-6 ms-2
                text-red-300
                hover:text-red-700 cursor-pointer
                "
                  onClick={handleLogout}
                />
              </div>
            </div>
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
          />
          <SpeedDial handleDownloadData={handleDownloadData} />
        </>
      ) : (
        <></>
      )}
    </>
  );
}

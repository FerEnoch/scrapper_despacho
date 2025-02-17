import { Eye, EyeClosed } from "lucide-react";
import {
  AlertDialogAction,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { loginFormSchema } from "@/schemas/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useState } from "react";
import { authApi } from "@/api/authApi";
import { ApiResponse, UserSession } from "@/types";
import { Puff } from "react-loader-spinner";

interface LoginFormProps {
  actionButton: string;
  toggleAlertDialog: () => void;
  handleLoginCredentials: (apiResponseData: ApiResponse<UserSession>) => void;
  isError: boolean;
}

export function LoginForm({
  actionButton,
  toggleAlertDialog,
  handleLoginCredentials,
  isError,
}: LoginFormProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      user: "",
      pass: "",
    },
  });

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((isVisible) => !isVisible);
  };

  const onSubmit = async (data: z.infer<typeof loginFormSchema>) => {
    setIsLoading(true);
    const apiResponse = await authApi.register(data);
    handleLoginCredentials(apiResponse);
    setIsLoading(false);
  };

  const errorInputStyle =
    "text-red-300 border-red-400 focus:ring-transparent placeholder-red-300 focus:outline-none";

  return (
    <Form {...form}>
      <form
        encType="text/plain"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <FormField
          {...form.register("user")}
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="user">Usuario SIEM</FormLabel>
              <FormControl>
                <Input
                  className={`${
                    isError && errorInputStyle
                  } ps-2 w-48 placeholder:text-muted`}
                  type="text"
                  id="user"
                  placeholder="Nombre de usuario"
                  {...field}
                />
              </FormControl>
              {isError && (
                <FormDescription className="text-red-300 absolute">
                  Revisa tu usuario
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          {...form.register("pass")}
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="pass">Contraseña SIEM</FormLabel>
              <FormControl>
                <div className="flex items-center justify-between relative">
                  <Input
                    className={`${isError && errorInputStyle} ps-2 w-48`}
                    type={isPasswordVisible ? "text" : "password"}
                    id="pass"
                    {...field}
                  />
                  {isPasswordVisible ? (
                    <Eye
                      className="
                        absolute left-40
                        text-gray-400 hover:text-gray-500 cursor-pointer w-4
                        "
                      onClick={togglePasswordVisibility}
                    />
                  ) : (
                    <EyeClosed
                      className="
                        absolute left-40
                        text-gray-400 hover:text-gray-500 cursor-pointer w-4
                        "
                      onClick={togglePasswordVisibility}
                    />
                  )}
                </div>
              </FormControl>
              {isError && (
                <FormDescription className="text-red-300 absolute">
                  Revisa tu contraseña
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <AlertDialogFooter className="mt-4">
          <AlertDialogAction
            className="bg-transparent hover:text-red-400 shadow-none"
            onClick={() => toggleAlertDialog()}
          >
            {"Cancelar"}
          </AlertDialogAction>
          <AlertDialogAction className="bg-transparent shadow-none">
            <Button type="submit" disabled={isLoading}>
              {actionButton}
              {isLoading && (
                <Puff
                  visible={true}
                  height="100"
                  width="100"
                  color="#000"
                  ariaLabel="puff-loading"
                  wrapperStyle={{}}
                  wrapperClass=""
                />
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </form>
    </Form>
  );
}

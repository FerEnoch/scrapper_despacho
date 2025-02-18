import { Eye, EyeClosed } from "lucide-react";
import {
  AlertDialogAction,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { loginFormSchema, FormDataSubmit } from "@/schemas/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Puff } from "react-loader-spinner";

interface AuthFormProps {
  actionButton: string;
  authError: boolean;
  toggleAuthModal: (flag?: string) => void;
  handleSubmit: (data: FormDataSubmit) => Promise<void>;
}

export function AuthForm({
  actionButton,
  toggleAuthModal,
  handleSubmit,
  authError: isError,
}: AuthFormProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormDataSubmit>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      user: "",
      pass: "",
    },
  });

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((isVisible) => !isVisible);
  };

  const onSubmit = async (data: FormDataSubmit) => {
    setIsLoading(true);
    await handleSubmit(data);
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
            onClick={() => toggleAuthModal()}
          >
            {"Cancelar"}
          </AlertDialogAction>
          <AlertDialogAction
            className="bg-transparent shadow-none"
            type="submit"
            disabled={isLoading}
            asChild
          >
            <Button variant="outline" className="bg-primary">
              {actionButton}
              {isLoading && (
                <Puff
                  visible
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

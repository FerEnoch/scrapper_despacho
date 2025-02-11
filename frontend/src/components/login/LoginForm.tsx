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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useState } from "react";

interface LoginFormProps {
  actionButton: string;
  toggleAlertDialog: () => void;
}

export function LoginForm({ actionButton, toggleAlertDialog }: LoginFormProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((isVisible) => !isVisible);
  };

  const onSubmit = (data: z.infer<typeof loginFormSchema>) => {
    console.log("🚀 ~ onSubmit ~ data:", data);
  };

  return (
    <Form {...form}>
      <form
        encType="text/plain"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <FormField
          {...form.register("username")}
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="username">Usuario SIEM</FormLabel>
              <FormControl>
                <Input
                  className="ps-2 w-48"
                  type="text"
                  id="username"
                  placeholder="Nombre de usuario"
                  {...field}
                />
              </FormControl>
              {/* <FormDescription>Usuario SIEM</FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          {...form.register("password")}
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="pass">Contraseña SIEM</FormLabel>
              <FormControl>
                <div className="flex items-center justify-between relative">
                  <Input
                    className="ps-2 w-48"
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
              {/* <FormDescription>Contraseña SIEM</FormDescription> */}
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
          <AlertDialogAction>
            <Button type="submit">{actionButton}</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </form>
    </Form>
  );
}

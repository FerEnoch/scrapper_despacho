import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

import { Input } from "@/components/ui/input";

import { formSchema } from "@/schemas/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "./api";

export default function App() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const formData = new FormData().append(
      "file",
      values.file
    ) as unknown as FormData;

    const response = await api.getFilesStats(formData);
    console.log(response);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Despacho Santa Fe Hábitat</CardTitle>

        <CardDescription>
          <p>
            Carga un archivo .csv que contenga una columna "Número" con el
            número completo de expediente SIEM.
          </p>
          <p>Podrás visualizar su estado actual y finalizar su tramitación.</p>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="file">Archivo</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      id="file"
                      placeholder="expedientes.csv"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Carga un archivo .csv</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter>
        <p>Santa Fe Hábitat</p>
      </CardFooter>
    </Card>
  );
}

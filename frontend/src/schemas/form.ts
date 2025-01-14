import { z } from "zod";

export const formSchema = z.object({
  file: z
    .instanceof(File, {
      message: "Debe seleccionar un archivo",
    })
    .refine((value) => value.name.endsWith(".csv"), {
      message: "El archivo debe ser en formato .csv",
    }),
});

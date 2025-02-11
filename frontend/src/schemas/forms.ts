import { z } from "zod";

export const uploadFileFormSchema = z.object({
  file: z
    .instanceof(File, {
      message: "Debe seleccionar un archivo",
    })
    .refine((value) => value.name.endsWith(".csv"), {
      message: "El archivo debe ser en formato .csv",
    }),
});

export const loginFormSchema = z.object({
  username: z.string({ message: "Utiliza tu usuario SIEM" }),
  password: z.string({ message: "Utiliza tu contraseña SIEM" }),
});

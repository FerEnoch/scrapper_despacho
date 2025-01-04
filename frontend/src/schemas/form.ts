import { z } from "zod";

export const formSchema = z.object({
  file: z.string().refine((value) => value.endsWith(".csv"), {
    message: "El archivo debe ser en formato .csv",
  }),
});

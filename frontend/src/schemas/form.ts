import { z } from "zod";

export const formSchema = z.object({
  file: z.instanceof(File).refine((value) => value.name.endsWith(".csv"), {
    message: "El archivo debe ser en formato .csv",
  }),
});

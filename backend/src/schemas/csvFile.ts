import { z } from "zod";
import { ERRORS } from "../errors/types";

export const csvFileSchema = z.object({
  file: z.object({
    mimetype: z.string().refine((type) => type.includes("csv"), {
      message: ERRORS.INVALID_FILE,
    }),
  }),
});

export type CsvFile = z.infer<typeof csvFileSchema>;

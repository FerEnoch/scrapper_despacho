import { Request, Response, NextFunction } from "express";
import { ApiError } from "../errors/api-error";
import { ERRORS } from "../errors/types";
import { UploadedFile } from "express-fileupload";
import { UPLOADS_FOLDER } from "../controllers/constants";
import { csvFileSchema } from "../schemas/csvFile";
import { ZodError } from "zod";

export async function validateFileRequest(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const file = req.files?.file as UploadedFile;

    if (!file) {
      throw new ApiError({
        statusCode: 400,
        message: ERRORS.NO_FILE_TO_UPLOAD,
      });
    }

    csvFileSchema.parse({
      file,
    });

    // save the file as cache data csv
    await file.mv(`./${UPLOADS_FOLDER.FOLDER}/${UPLOADS_FOLDER.FILES_CSV}`);

    req.body = file;

    next();
  } catch (error: any) {
    if (error instanceof ApiError) {
      next(error);
    } else if (error instanceof ZodError) {
      next(
        new ApiError({
          statusCode: 400,
          message: error.errors?.[0].message ?? ERRORS.INVALID_FILE,
        })
      );
    } else {
      next(
        new ApiError({
          statusCode: 400,
          message: ERRORS.INVALID_FILE,
        })
      );
    }
  }
}

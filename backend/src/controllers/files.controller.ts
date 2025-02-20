import { convertData } from "../utils";
import { NextFunction, Request, Response } from "express";
import { IFilesController } from "./types";
import { IFilesService } from "../sevices/types";
import { MESSAGES } from "./constants";
import { FilesService } from "../sevices/files.service";
import { modelTypes } from "../types";
import { FileId, FileStats, RawFile } from "../models/types";
import { parseRawFiles } from "../models/lib/filesScrapper";
import { UploadedFile } from "express-fileupload";
import { ApiError } from "../errors/api-error";
import { ERRORS } from "../errors/types";
import { JwtPayload } from "jsonwebtoken";
import chalk from "chalk";

export class FilesController implements IFilesController {
  service: IFilesService;

  constructor({ model }: { model: modelTypes }) {
    this.service = new FilesService({ model });
    // this.getFilesStats = this.getFilesStats.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.endFiles = this.endFiles.bind(this);
  }

  async uploadFile(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.body as UploadedFile;
      const data = file.data.toString("utf-8");
      const jsonData = (await convertData(data)) as RawFile[];

      /**
       *  TODO -> update parser to admit files wwith "963" and no letters
       */
      const { ok, parsedData } = await parseRawFiles(jsonData, {
        withLetters: true,
      });

      if (!ok) {
        throw new ApiError({
          statusCode: 400,
          message: ERRORS.INVALID_DATA,
          data: parsedData as RawFile[],
        });
      }

      const scrappedData = await this.service.searchFilesStats(
        parsedData as FileId[]
      );

      res.status(201).json({
        message: MESSAGES.FILE_UPLOADED,
        data: scrappedData,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async endFiles(
    req: Request & {
      auth?: {
        access: string | JwtPayload;
      };
    },
    res: Response,
    next: NextFunction
  ) {
    try {
      const files = req.body as FileStats[];
      const filesToEnd = files?.filter(
        (file) =>
          file.prevStatus !== "FINALIZADO" && file.prevStatus !== "Sin datos"
      );

      if (filesToEnd?.length === 0) {
        throw new ApiError({
          statusCode: 400,
          message: ERRORS.NO_FILES_TO_END,
        });
      }

      const { user, pass } = req.auth?.access as {
        user: string;
        pass: string;
      };

      await this.service.populateUserCredentials({ user, pass });

      const endedFiles = await this.service.endFiles({ files });

      if (endedFiles.length === 0) {
        throw new ApiError({
          statusCode: 400,
          message: ERRORS.NO_FILES_ENDED,
        });
      }

      res.status(200).json({ message: MESSAGES.FILES_ENDED, data: endedFiles });
    } catch (error: any) {
      next(error);
    }
  }
}

import { convertData } from "../utils";
import { NextFunction, Request, Response } from "express";
import { IFilesController } from "./types";
import { IFilesService } from "../sevices/types";
import { MESSAGES, UPLOADS_FOLDER } from "./constants";
import { FilesService } from "../sevices/files.service";
import { modelTypes } from "../types";
import { FileId, FileStats, RawFile } from "../models/types";
import { parseRawFiles } from "../models/lib/filesScrapper";
import { UploadedFile } from "express-fileupload";
import { ApiError } from "../errors/api-error";
import { ERRORS } from "../errors/types";

export class FilesController implements IFilesController {
  service: IFilesService;

  constructor({ model }: { model: modelTypes }) {
    this.service = new FilesService({ model });
    this.getFilesStats = this.getFilesStats.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.endFiles = this.endFiles.bind(this);
  }

  async getFilesStats(req: Request, res: Response, next: NextFunction) {
    /** Ever used ?? */
    try {
      const { id } = req.params;
      // read from cache
      // const csvFile = await getFilesRawDataFromFile({
      //   folder: UPLOADS_FOLDER.FOLDER,
      //   fileName: UPLOADS_FOLDER.FILES_CSV,
      // });
      // const jsonData = await convertToJson(csvFile);

      const rawFile: RawFile = { Número: id };
      const { ok, parsedData } = await parseRawFiles([rawFile], {
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

      res
        .status(200)
        .json({ message: MESSAGES.FILES_STATS_RETRIEVED, data: scrappedData });
    } catch (error: any) {
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(
          new ApiError({
            statusCode: 500,
            message: ERRORS.SERVER_ERROR,
          })
        );
      }
    }
  }

  async uploadFile(
    req: Request & { file: UploadedFile },
    res: Response,
    next: NextFunction
  ) {
    try {
      const file = req.file as UploadedFile;
      const data = file.data.toString("utf-8");
      const jsonData = (await convertData(data)) as RawFile[];

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
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(
          new ApiError({
            statusCode: 500,
            message: ERRORS.SERVER_ERROR,
          })
        );
      }
    }
  }

  async endFiles(req: Request, res: Response, next: NextFunction) {
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

      const endedFiles = await this.service.endFiles({ files });

      if (endedFiles.length === 0) {
        throw new ApiError({
          statusCode: 400,
          message: ERRORS.NO_FILES_ENDED,
        });
      }

      res.status(200).json({ message: MESSAGES.FILES_ENDED, data: endedFiles });
    } catch (error: any) {
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(
          new ApiError({
            statusCode: 500,
            message: ERRORS.SERVER_ERROR,
          })
        );
      }
    }
  }
}

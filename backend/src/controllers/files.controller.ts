import { IFilesService } from "../sevices/types";
import { convertData } from "../utils";
import { NextFunction, Request, Response } from "express";
import { IFilesController } from "./types";
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
import {
  COLLECTION_ERRORS,
  SIEM_PAGE_DATA,
} from "../models/lib/filesScrapper/constants";
import { FILE_NUMBER_COLUMN_VALID_NAME } from "../config";

export class FilesController implements IFilesController {
  private readonly service: IFilesService;

  constructor(
    private readonly filesScrapperModel: modelTypes["IFileScrapper"]
  ) {
    this.service = new FilesService(filesScrapperModel);
    this.getFilesStats = this.getFilesStats.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.endFiles = this.endFiles.bind(this);
  }

  async getFilesStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const rawFile: RawFile = { [FILE_NUMBER_COLUMN_VALID_NAME]: id };
      const { ok, parsedData } = await parseRawFiles([rawFile]);

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
      console.log(
        chalk.red(
          "~ FilesController ~ getFilesStats ~ error.message:",
          error.message
        )
      );
      next(error);
    }
  }

  async uploadFile(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.body as UploadedFile;
      const data = file.data.toString("utf-8");
      const jsonData = (await convertData(data)) as RawFile[];

      const { ok, parsedData } = await parseRawFiles(jsonData);
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
      const { access } = req.auth as {
        access: {
          user: string;
          pass: string;
        };
      };
      const { user, pass } = access;
      const files = req.body as FileStats[];

      const filesToEnd = files?.filter(
        (file) =>
          file.prevStatus !== SIEM_PAGE_DATA.ENDED_FILE_STATUS_TEXT &&
          file.prevStatus !== COLLECTION_ERRORS.NO_DATA_COLLECTED &&
          file.prevStatus !== COLLECTION_ERRORS.DATA_MISSING
      );

      if (filesToEnd?.length === 0) {
        throw new ApiError({
          statusCode: 400,
          message: ERRORS.NO_FILES_TO_END,
        });
      }

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

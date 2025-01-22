import { Request, Response } from "express";
import { IFilesController } from "./types";
import { IFilesService } from "../sevices/types";
import { MESSAGES, UPLOADS_FOLDER } from "./constants";
import { FilesService } from "../sevices/files.service";
import { modelTypes } from "../types";
import { FileId, RawFile } from "../models/types";
import { convertToJson, parseRawFiles } from "../models/lib/index";
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

  async getFilesStats(req: Request, res: Response) {
    const { id } = req.params;
    try {
      // read from cache
      // const csvFile = await getFilesRawDataFromFile({
      //   folder: UPLOADS_FOLDER.FOLDER,
      //   fileName: UPLOADS_FOLDER.FILES_CSV,
      // });
      // const jsonData = await convertToJson(csvFile);

      const rawFile: RawFile = { Número: id };
      const analyzeWithLetters = true;
      const { ok, parsedData } = await parseRawFiles(
        [rawFile],
        analyzeWithLetters
      );

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
      res
        .status(400)
        .json({ message: ERRORS.NO_FILE_STATS_RETRIEVED, data: [] });
    }
  }

  async uploadFile(req: Request, res: Response) {
    try {
      if (!req.files) {
        res.status(400).send({
          message: ERRORS.NO_FILE_TO_UPLOAD,
          data: [],
        });
        return;
      }

      const file = req.files.file as UploadedFile;

      // validate file format
      if (!file.mimetype.includes("csv")) {
        res.status(400).json({ message: ERRORS.INVALID_FILE, data: [] });
        return;
      }

      const data = file.data.toString("utf-8");
      const jsonData = await convertToJson(data);
      const { ok, parsedData } = await parseRawFiles(jsonData);

      if (!ok) {
        res.status(400).json({
          message: ERRORS.INVALID_DATA,
          data: parsedData as RawFile[],
        });
        return;
      }
      // save the file as cache data csv
      await file.mv(`./${UPLOADS_FOLDER.FOLDER}/${UPLOADS_FOLDER.FILES_CSV}`);
      const scrappedData = await this.service.searchFilesStats(
        parsedData as FileId[]
      );
      res.status(201).json({
        message: MESSAGES.FILE_UPLOADED,
        data: scrappedData,
      });
    } catch (error: any) {
      res
        .status(400)
        .json({ message: ERRORS.NO_FILE_STATS_RETRIEVED, data: [] });
    }
  }

  async endFiles(req: Request, res: Response) {
    try {
      const files = req.body;
      if (!files) {
        res.status(400).json({ message: ERRORS.NO_FILE_TO_UPLOAD, data: [] });
        return;
      }

      const endedFiles = await this.service.endFiles({ files });
      if (endedFiles.length === 0) {
        res.status(400).json({ message: ERRORS.NO_FILES_TO_END, data: [] });
        return;
      }

      res.status(200).json({ message: MESSAGES.FILES_ENDED, data: endedFiles });
    } catch (error: any) {
      res.status(400).json({ message: ERRORS.NO_FILES_ENDED, data: [] });
    }
  }
}

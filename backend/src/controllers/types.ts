import { Request, Response } from "express";
import { IFilesService } from "../sevices/types";

export interface IFilesController {
  service: IFilesService;
  getFilesStats(req: Request, res: Response): Promise<void>;
  uploadFile(req: Request, res: Response): Promise<void>;
  endFiles(req: Request, res: Response): Promise<void>;
}

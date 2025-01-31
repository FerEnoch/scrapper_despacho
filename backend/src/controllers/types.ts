import { Request, Response } from "express";
import { IAuthService, IFilesService } from "../sevices/types";

export interface IFilesController {
  service: IFilesService;
  getFilesStats(req: Request, res: Response): Promise<void>;
  uploadFile(req: Request, res: Response): Promise<void>;
  endFiles(req: Request, res: Response): Promise<void>;
}

export interface IAuthController {
  service: IAuthService;
  login(req: Request, res: Response): Promise<void>;
  getUserById(req: Request, res: Response): Promise<void>;
  logout(req: Request, res: Response): Promise<void>;
}

import { NextFunction, Request, Response } from "express";
import { IFilesService, IUserService } from "../sevices/types";
import { JwtPayload } from "jsonwebtoken";

export interface IFilesController {
  service: IFilesService;
  // getFilesStats(req: Request, res: Response, next: NextFunction): Promise<void>;
  uploadFile(req: Request, res: Response, next: NextFunction): Promise<void>;
  endFiles(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export interface IAuthController {
  service: IUserService;
  login(req: Request, res: Response, next: NextFunction): Promise<void>;
  register(req: Request, res: Response, next: NextFunction): Promise<void>;
  // getUserById(req: Request, res: Response, next: NextFunction): Promise<void>;
  logout(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateUserCredentials(
    req: Request & { auth?: { access: string | JwtPayload } },
    res: Response,
    next: NextFunction
  ): Promise<void>;
}

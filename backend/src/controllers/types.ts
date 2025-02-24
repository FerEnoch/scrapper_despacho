import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface IFilesController {
  getFilesStats(req: Request, res: Response, next: NextFunction): Promise<void>;
  uploadFile(req: Request, res: Response, next: NextFunction): Promise<void>;
  endFiles(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export interface IAuthController {
  // register(req: Request, res: Response, next: NextFunction): Promise<void>;
  login(req: Request, res: Response, next: NextFunction): Promise<void>;
  logout(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateUserCredentials(
    req: Request & { auth?: { access: string | JwtPayload } },
    res: Response,
    next: NextFunction
  ): Promise<void>;
}

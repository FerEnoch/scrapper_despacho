import { Browser, Page } from "@playwright/test";
import { Auth } from "../schemas/auth";
import Database from "better-sqlite3";
import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";

export type IFileScrapper = {
  getBrowserContext(): Promise<{
    newPage: Page;
    browser: Browser;
  }>;

  siemLogin({
    user,
    pass,
    newPage,
  }: {
    user: string;
    pass: string;
    newPage: Page;
  }): Promise<Page>;

  collectData({
    file,
    page,
  }: {
    file: FileId;
    page: Page | null;
  }): Promise<FileStats>;
};

export type IDatabaseModel = {
  database: Database.Database;
  checkIfUserExists({
    user,
  }: {
    user: string;
  }): Promise<{ id: string; user: string }>;
  saveRefreshToken({
    userId,
    refreshToken,
  }: {
    userId: string;
    refreshToken: string;
  }): Promise<void>;
  getRefreshTokenById({
    userId,
  }: {
    userId: string;
  }): Promise<{ refreshToken: string }>;
  register({ user, pass }: Auth): Promise<{ userId: string }>;
  login({ user, pass }: Auth): Promise<{ userId: string }>;
  getPassByUser({ user }: { user: string }): Promise<{ pass: string }>;
  getUserById({ userId }: { userId: string }): Promise<authApiResponse>;
  logout({ userId }: { userId: string }): Promise<authApiResponse>;
  createDB(name: string): Database.Database;
  createTables(db: Database.Database): void;
};

export type IAuthModel = {
  generateRefreshToken(userId: string): {
    refreshToken: string;
  };
  generateAccessToken(userId: string): {
    accessToken: string;
  };
  verifyJwt(
    req: Request & {
      auth?: {
        access: string | JwtPayload;
      };
    },
    _res: Response,
    next: NextFunction
  ): void;
  verifyRefreshToken({
    refreshToken,
  }: {
    refreshToken: string;
  }): string | JwtPayload;
};

/****************************************************************** */
/***************************************************************** */

export type authApiResponse = {
  userId: string;
  username?: string;
  token?: string;
};

export type RawFile = {
  Número: string;
  [key: string]: string | undefined; // Other properties are optional
};

export type FileId = {
  index: number;
  num: string;
  org?: string;
  rep?: string;
  digv?: string;
  completeNum?: string;
};

export type FileEndedStats = {
  index: number;
  num: string;
  location: string;
  title: string;
  prevStatus: string;
  newStatus: {
    status: string;
    message: string;
    detail: string;
  };
};

export type FileStats = {
  index: number;
  num: string;
  title: string;
  prevStatus: string;
  location: string;
};

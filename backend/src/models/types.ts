import { Browser, BrowserContext, Page, Route } from "@playwright/test";
import { Auth, CompleteAuthWithId } from "../schemas/auth";
import Database from "better-sqlite3";
import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";

export type IFileScrapperV1 = {
  END_FILE_TEXT: string;
  SIEM_BASE_URL: string;
  SIEM_LOGIN_PATH: string;
  SIEM_LOGIN_URL: string;
  SIEM_SEE_FILE_PATH: string;
  SIEM_SEARCH_FILE_PATH: string;
  SIEM_SEARCH_FILE_URL: string;
  SIEM_SEE_FILE_URL: string;
  SIEM_END_FILE_PATH: string;
  SIEM_END_FILE_URL: string;
  SIEM_LOCATE_FILE_TITLE: locationType;
  SIEM_LOCATE_FILE_STATUS: locationType;
  SIEM_LOCATE_FILE_LOCATION: locationType;
  AUTH_DENIED_PAGE_MSG: locationType;
  AUTH_GRANTED_PAGE_CHECK: locationType;
  context: BrowserContext | null;
  browser: Browser | null;
  createBrowserContext(): Promise<void>;
  interceptRoutes(route: Route): Promise<void>;
  closeBrowserContext(): Promise<void>;
  siemLogin({
    user,
    pass,
  }: {
    user: string;
    pass: string;
  }): Promise<void | null>;

  endFileByNum({ num }: { num: string }): Promise<{
    message: string;
    detail: string;
  }>;

  collectData({ file }: { file: FileId }): Promise<FileStats | null>;
  checkSiemLogin({ page }: { page: Page }): Promise<void>;
};

export type IDatabaseModel = {
  database: Database.Database;
  BCRYPT_SALT_ROUNDS: number;
  createDB(name: string): Database.Database;
  createTables(db: Database.Database): void;
  checkIfUserExists({
    user,
  }: {
    user: string;
  }): Promise<{ id: string; user: string } | null>;
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
  updateUserCredentials({
    userId,
    user,
    pass,
  }: CompleteAuthWithId): Promise<{ userId: string }>;
  // getUserById({ userId }: { userId: string }): Promise<authApiResponse>;
  // logout({ userId }: { userId: string }): Promise<authApiResponse>;
};

export type IAuthModel = {
  generateRefreshToken(userId: string): {
    refreshToken: string;
  };
  generateAccessToken({ userId, user, pass }: UserAuthData): {
    accessToken: string;
  };
  verifyJwt({ token }: { token: string }): string | JwtPayload;
  verifyJwtMiddleware(
    req: Request & {
      auth?: {
        access: string | JwtPayload;
      };
    },
    _res: Response,
    next: NextFunction
  ): void;
};

/****************************************************************** */
/***************************************************************** */

export type UserAuthData = {
  userId: string;
  user: string;
  pass?: string;
  token?: string;
};

export type UpdatedUserData = {
  updatedUser: string;
  updatedPass: string;
  userId?: string;
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
  } | null;
};

export type FileStats = {
  index: number;
  num: string;
  title: string;
  prevStatus: string;
  location: string;
};

export type locationType = {
  element: string;
  text: string;
};

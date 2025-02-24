import { Page, Route } from "@playwright/test";
import { Auth, CompleteAuthWithId } from "../schemas/auth";
import Database from "better-sqlite3";
import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import { FILE_NUMBER_COLUMN_VALID_NAME } from "../config";

export type IFileScrapperV1 = {
  createBrowserContext(): Promise<void>;
  interceptRoutes(route: Route): Promise<void>;
  closeBrowserContext(): Promise<void>;
  siemLogin({ user, pass }: Auth): Promise<void | null>;
  endFileByNum({ num }: { num: string }): Promise<{
    message: string;
    detail: string;
  }>;
  collectData({ file }: { file: FileId }): Promise<FileStats | null>;
  checkSiemLogin({ page }: { page: Page }): Promise<void>;
};

export type IDatabaseModel = {
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
};

export type IAuthModel = {
  generateRefreshToken(userId: string): {
    refreshToken: string;
  };
  generateAccessToken({ userId, user, pass }: UserAuthData): {
    accessToken: string;
  };
  verifyJwt({ token }: { token: string }): string | JwtPayload;
};

/****************************************************************** */
/***************************************************************** */

export type UserAuthData = {
  userId: string;
  user?: string;
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
  [FILE_NUMBER_COLUMN_VALID_NAME]: string;
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

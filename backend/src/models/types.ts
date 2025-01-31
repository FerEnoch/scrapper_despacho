import { Browser, Page } from "@playwright/test";
import { Auth } from "../schemas/auth";
import Database, { Statement } from "better-sqlite3";

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

export type IAuthModel = {
  database: Database.Database;
  createUsersTable: Statement;
  login({ user, pass }: Auth): Promise<authApiResponse>;
  getUserById({ userId }: { userId: string }): Promise<authApiResponse>;
  logout({ userId }: { userId: string }): Promise<authApiResponse>;
};

/********************************* */
/******************************** */

export type authApiResponse = {
  ok: boolean;
  message: string;
  userId: string;
  username?: string;
};

export type RawFile = {
  Número: string;
  [key: string]: string | undefined; // Other properties are optional
};

export type FileId = {
  num: string;
  org?: string;
  rep?: string;
  digv?: string;
  completeNum?: string;
};

export type FileEndedStats = {
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
  num: string;
  title: string;
  prevStatus: string;
  location: string;
};

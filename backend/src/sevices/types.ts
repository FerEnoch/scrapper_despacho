import { Browser, Page } from "@playwright/test";
import {
  authApiResponse,
  FileEndedStats,
  FileId,
  FileStats,
} from "../models/types";
import { Auth } from "../schemas/auth";
import { modelTypes } from "../types";

export interface IFilesService {
  model: modelTypes["IFileScrapper"];
  MAX_BATCH_SIZE: number;
  SIEM_USER: string;
  SIEM_PASSWORD: string;
  SIEM_LOGIN_URL: string;
  searchFilesStats(files: FileId[]): Promise<FileStats[]>;
  endFiles({ files }: { files: FileStats[] }): Promise<FileEndedStats[]>;
  siemLogin(): Promise<{ siemPage: Page; browser: Browser }>;
}

export interface IUserService {
  databaseModel: modelTypes["IDatabaseModel"];
  authModel: modelTypes["IAuthModel"];
  register({ user, pass }: Auth): Promise<authApiResponse>;
  login({ user, pass }: Auth): Promise<authApiResponse>;
  getUserById({ userId }: { userId: string }): Promise<authApiResponse>;
  logout({ userId }: { userId: string }): Promise<authApiResponse>;
}

export type ResultType =
  | {
      value: Array<FileStats & { status?: "fulfilled" | "rejected" }>;
      status: "fulfilled";
    }
  | { error: any; status: "rejected" };

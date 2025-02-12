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
  ENDED_FILE_STATUS_TEXT: string;
  MAX_BATCH_SIZE: number;
  SIEM_PASSWORD: string;
  SIEM_USER: string;
  searchFilesStats(files: FileId[]): Promise<FileStats[]>;
  endFiles({ files }: { files: FileStats[] }): Promise<FileEndedStats[]>;
  endFileByNum(num: string): Promise<{ message: string; detail: string }>;
  siemLogin(): Promise<{ siemPage: Page; browser: Browser }>;
}

export interface IUserService {
  databaseModel: modelTypes["IDatabaseModel"];
  authModel: modelTypes["IAuthModel"];
  register({ user, pass }: Auth): Promise<authApiResponse>;
  login({ user, pass }: Auth): Promise<authApiResponse>;
  // getUserById({ userId }: { userId: string }): Promise<authApiResponse>;
  // logout({ userId }: { userId: string }): Promise<authApiResponse>;
}

export type BatchOpResultType<F> =
  | {
      value: Array<F>;
      status: "fulfilled";
    }
  | { error: any; status: "rejected" };

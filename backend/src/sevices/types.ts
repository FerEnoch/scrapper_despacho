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
  searchFilesStats(files: FileId[]): Promise<FileStats[]>;
  endFiles({ files }: { files: FileStats[] }): Promise<FileEndedStats[]>;
}

export interface IUserService {
  databaseModel: modelTypes["IDatabaseModel"];
  authModel: modelTypes["IAuthModel"];
  register({ user, pass }: Auth): Promise<authApiResponse>;
  login({ user, pass }: Auth): Promise<authApiResponse>;
  getUserById({ userId }: { userId: string }): Promise<authApiResponse>;
  logout({ userId }: { userId: string }): Promise<authApiResponse>;
}

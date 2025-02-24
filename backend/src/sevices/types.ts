import { JwtPayload } from "jsonwebtoken";
import {
  UserAuthData,
  FileEndedStats,
  FileId,
  FileStats,
} from "../models/types";
import { Auth, CompleteAuthWithId } from "../schemas/auth";

export interface IFilesService {
  populateUserCredentials({ user, pass }: Auth): Promise<void>;
  searchFilesStats(files: FileId[]): Promise<FileStats[]>;
  endFiles({ files }: { files: FileStats[] }): Promise<FileEndedStats[]>;
  endFileByNum(num: string): Promise<{ message: string; detail: string }>;
  siemLogin(): Promise<void>;
}

export interface IUserService {
  register({ user, pass }: Auth): Promise<UserAuthData>;
  login({ user, pass }: Auth): Promise<UserAuthData>;
  updateUserCredentials({
    userId,
    user,
    pass,
  }: CompleteAuthWithId): Promise<{ token: string }>;
  handleRefreshToken({ userId }: { userId: string }): Promise<void>;
  generateRefreshToken(userId: string): {
    refreshToken: string;
  };
  getRefreshTokenById({
    userId,
  }: {
    userId: string;
  }): Promise<{ refreshToken: string }>;
  generateAccessToken({ userId, user, pass }: UserAuthData): {
    accessToken: string;
  };
  verifyJwt({ token }: { token: string }): string | JwtPayload;
}

export type BatchOpResultType<F> =
  | {
      value: Array<F>;
      status: "fulfilled";
    }
  | { error: any; status: "rejected" };

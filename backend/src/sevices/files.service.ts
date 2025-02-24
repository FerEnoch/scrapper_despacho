import { FileEndedStats, FileId, FileStats } from "../models/types";
import { modelTypes } from "../types";
import { getFilesBatches, parseFileStats } from "../models/lib/filesScrapper";
import { IFilesService, BatchOpResultType } from "./types";
import {
  COLLECTION_ERRORS,
  SIEM_PAGE_DATA,
} from "../models/lib/filesScrapper/constants";
import { ApiError } from "../errors/api-error";
import { ERRORS } from "../errors/types";
import { Auth } from "../schemas/auth";

export class FilesService implements IFilesService {
  private readonly MAX_BATCH_SIZE: number;
  private readonly ENDED_FILE_STATUS_TEXT: string;
  private SIEM_PASSWORD: string;
  private SIEM_USER: string;

  constructor(
    private readonly filesScrapperModel: modelTypes["IFileScrapper"]
  ) {
    this.ENDED_FILE_STATUS_TEXT = SIEM_PAGE_DATA.ENDED_FILE_STATUS_TEXT;
    this.MAX_BATCH_SIZE = 10;
    this.SIEM_USER = "";
    this.SIEM_PASSWORD = "";

    this.searchFilesStats.bind(this);
    this.endFiles.bind(this);
    this.endFileByNum.bind(this);
    this.siemLogin.bind(this);
    this.populateUserCredentials.bind(this);
  }

  async searchFilesStats(files: FileId[]) {
    await this.filesScrapperModel.createBrowserContext();

    const scrappedData: Array<FileStats> = [];

    const batchedFiles =
      files.length > this.MAX_BATCH_SIZE
        ? getFilesBatches<FileId>({
            arr: files,
            size: this.MAX_BATCH_SIZE,
          })
        : [files];

    const results = (await Promise.allSettled(
      batchedFiles.map(async (batch) => {
        return Promise.all(
          batch.map(async (file) => {
            try {
              const fileStats = await this.filesScrapperModel.collectData({
                file,
              });
              return { ...fileStats };
            } catch (error) {
              return { error };
            }
          })
        );
      })
    )) as Array<BatchOpResultType<FileStats>>;

    results.forEach((batchResult) => {
      if (batchResult.status === "fulfilled") {
        batchResult.value.forEach((file) => {
          scrappedData.push(file);
        });
      } else {
        // throw new ApiError({
        //   statusCode: 400,
        //   message: ERRORS.NO_FILE_STATS_RETRIEVED,
        //   data: [],
        // });
      }
    });

    scrappedData.sort((a, b) => a.index - b.index);

    await this.filesScrapperModel.closeBrowserContext();
    return scrappedData;
  }

  async populateUserCredentials({ user, pass }: Auth) {
    this.SIEM_USER = user;
    this.SIEM_PASSWORD = pass;
    if (!this.SIEM_USER || !this.SIEM_PASSWORD) {
      throw new ApiError({
        statusCode: 401,
        message: ERRORS.CREDENTIALS_NOT_PROVIDED,
      });
    }
    await this.filesScrapperModel.createBrowserContext();
    await this.siemLogin();
    await this.filesScrapperModel.closeBrowserContext();
  }

  async endFiles({ files }: { files: FileStats[] }) {
    await this.filesScrapperModel.createBrowserContext();

    const filesEndedResult: Array<FileEndedStats> = [];

    await this.siemLogin();

    const batched =
      files.length > this.MAX_BATCH_SIZE
        ? getFilesBatches<FileStats>({
            arr: files,
            size: this.MAX_BATCH_SIZE,
          })
        : [files];

    const results = (await Promise.allSettled(
      batched.map(async (batch) => {
        return await Promise.all(
          batch.map(async (file) => {
            try {
              const { prevStatus } = file;
              if (
                prevStatus === this.ENDED_FILE_STATUS_TEXT ||
                prevStatus === COLLECTION_ERRORS.DATA_MISSING
              ) {
                return {
                  ...file,
                  newStatus: null,
                };
              }

              const [{ num }] = parseFileStats([file]);

              // const fileNewData: FileStats = await this.filesScrapperModel.collectData({
              //   file: {
              //     ...file,
              //     num, // only middle long number
              //   },
              // });

              const { message, detail } = await this.endFileByNum(num);

              return {
                ...file,
                newStatus: {
                  status: prevStatus ?? COLLECTION_ERRORS.DATA_MISSING,
                  message,
                  detail,
                },
              };
            } catch (error) {
              return { error };
            }
          })
        );
      })
    )) as Array<BatchOpResultType<FileEndedStats>>;

    results.forEach((batchResult) => {
      if (batchResult.status === "fulfilled") {
        batchResult.value.forEach((file) => {
          filesEndedResult.push(file);
        });
      } else {
        console.log(
          " 🚀 ~ file: files.service.endFiles ~ batchResult.error.message",
          batchResult.error.message
        );
        // throw new ApiError({
        //   statusCode: 400,
        //   message: ERRORS.NO_FILES_ENDED,
        //   data: [],
        // });
      }
    });
    await this.filesScrapperModel.closeBrowserContext();
    filesEndedResult.sort((a, b) => a.index - b.index);
    return filesEndedResult;
  }

  async endFileByNum(
    num: string
  ): Promise<{ message: string; detail: string }> {
    const { message, detail } = await this.filesScrapperModel.endFileByNum({
      num,
    });
    return { message, detail };
  }

  async siemLogin(): Promise<void> {
    if (!this.SIEM_USER || !this.SIEM_PASSWORD) {
      throw new ApiError({
        statusCode: 401,
        message: ERRORS.CREDENTIALS_NOT_PROVIDED,
      });
    }
    await this.filesScrapperModel.siemLogin({
      user: this.SIEM_USER,
      pass: this.SIEM_PASSWORD,
    });
  }
}

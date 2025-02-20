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

export class FilesService implements IFilesService {
  model: modelTypes["IFileScrapper"];
  MAX_BATCH_SIZE = 5;
  ENDED_FILE_STATUS_TEXT = "";
  SIEM_PASSWORD = "";
  SIEM_USER = "";

  constructor({ model }: { model: modelTypes }) {
    this.model = model;
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
    await this.model.createBrowserContext();

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
              const fileStats = await this.model.collectData({
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

    await this.model.closeBrowserContext();
    return scrappedData;

    /* old-method
    let dataCollection: FileStats;
    await Promise.all(
      files.map(async (file) => {
        dataCollection = await this.model.collectData({ file, page: null });
        scrappedData.push(dataCollection);
      })
    );
    */

    /* Appear to be not needed 
    // repeat first file to be sure to colect all the data
    const firstFileData = await this.model.collectData({
      file: files[0],
      page: null,
    });
    scrappedData.splice(0, 1, firstFileData);
    */
  }

  async populateUserCredentials({
    user,
    pass,
  }: {
    user: string;
    pass: string;
  }) {
    this.SIEM_USER = user;
    this.SIEM_PASSWORD = pass;
    if (!this.SIEM_USER || !this.SIEM_PASSWORD) {
      throw new ApiError({
        statusCode: 401,
        message: ERRORS.CREDENTIALS_NOT_PROVIDED,
      });
    }
    await this.model.createBrowserContext();
    await this.siemLogin();
    await this.model.closeBrowserContext();
  }

  async endFiles({ files }: { files: FileStats[] }) {
    await this.model.createBrowserContext();

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

              // const fileNewData: FileStats = await this.model.collectData({
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
    await this.model.closeBrowserContext();
    filesEndedResult.sort((a, b) => a.index - b.index);
    return filesEndedResult;
  }

  async endFileByNum(
    num: string
  ): Promise<{ message: string; detail: string }> {
    const { message, detail } = await this.model.endFileByNum({
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
    await this.model.siemLogin({
      user: this.SIEM_USER,
      pass: this.SIEM_PASSWORD,
    });
  }
}

import { FileEndedStats, FileId, FileStats } from "../models/types";
import { modelTypes } from "../types";
import { getFilesBatches, parseFileStats } from "../models/lib/filesScrapper";
import { IFilesService, BatchOpResultType } from "./types";
import {
  COLLECTION_ERRORS,
  SIEM_PAGE_DATA,
} from "../models/lib/filesScrapper/constants";
import { NODE_ENV, SIEM_PASSWORD, SIEM_USER } from "../config";
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
    this.SIEM_USER = SIEM_USER;
    this.SIEM_PASSWORD = SIEM_PASSWORD;

    this.searchFilesStats.bind(this);
    this.endFiles.bind(this);
    this.endFileByNum.bind(this);
    this.siemLogin.bind(this);
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
        console.log(
          " 🚀 ~ file: files.service.searchFilesStats ~ batchResult.error.message",
          batchResult.error.message
        );
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
        // replace :rocket with a rocket emoji 🚀
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
    /** old-method */
    // const result: FileEndedStats[] = [];
    // let updatedFile: FileEndedStats, message: string, detail: string;

    // const filesChunks = files.reduce((acc, file, index) => {
    //   if (index % 10 === 0) {
    //     acc.push([file]);
    //   } else {
    //     acc[acc.length - 1].push(file);
    //   }
    //   return acc;
    // }, [] as FileStats[][]);

    // await Promise.all(
    //   filesChunks.map(async (filesChunk) => {
    //     let fileNewData: FileStats,
    //       siemPage: Page | null = null,
    //       newBrowser: Browser | null = null;
    //     await Promise.all(
    //       filesChunk.map(async (file) => {
    //         const loginResult = await this.siemLogin();
    //         siemPage = loginResult.siemPage;
    //         newBrowser = loginResult.browser;

    //         siemPage.addListener("dialog", (alert) => {
    //           alert.accept();
    //         });
    //         try {
    //           const [{ num }] = parseFileStats([file]);
    //           await siemPage.goto(`${SIEM_BASE_URL}${FILE_STATS_PATH}${num}`);
    //           await siemPage.waitForLoadState();

    //           await siemPage
    //             .locator('.menu_contexto a:text-matches("finalizar", "i")')
    //             .click();

    //           await siemPage.waitForLoadState();
    //           message = (await siemPage.locator("h2").textContent()) ?? "";
    //           detail = (await siemPage.locator("h3").textContent()) ?? "";

    //           fileNewData = await this.model.collectData({
    //             file: {
    //               ...file,
    //               num, // only middle long number
    //             },
    //             page: null,
    //           });

    //           updatedFile = {
    //             ...file,
    //             newStatus: {
    //               status: fileNewData?.prevStatus ?? "",
    //               message,
    //               detail,
    //             },
    //           };
    //           result.push(updatedFile);
    //         } catch (error) {
    //           updatedFile = {
    //             ...file,
    //             newStatus: {
    //               status: fileNewData?.prevStatus ?? "",
    //               message,
    //               detail,
    //             },
    //           };
    //           result.push(updatedFile);
    //         } finally {
    //           await siemPage?.removeListener("dialog", () => {});
    //           await newBrowser?.close();
    //         }
    //       })
    //     );
    //   })
    // );

    // return result;
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

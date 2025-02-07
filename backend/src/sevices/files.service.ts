import { Browser, Page } from "@playwright/test";
import { FileEndedStats, FileId, FileStats } from "../models/types";
import { modelTypes } from "../types";
import {
  FILE_STATS_PATH,
  LOGIN_PATH,
  SIEM_BASE_URL,
  SIEM_PASSWORD,
  SIEM_USER,
} from "../config";
import { getFilesBatches, parseFileStats } from "../models/lib/filesScrapper";
import { IFilesService, ResultType } from "./types";
import { ApiError } from "../errors/api-error";
import { ERRORS } from "../errors/types";

export class FilesService implements IFilesService {
  model: modelTypes["IFileScrapper"];
  MAX_BATCH_SIZE = 5;
  SIEM_USER = "";
  SIEM_PASSWORD = "";
  SIEM_LOGIN_URL = "";

  constructor({ model }: { model: modelTypes }) {
    this.model = model;
    this.SIEM_USER = SIEM_USER;
    this.SIEM_PASSWORD = SIEM_PASSWORD;
    this.SIEM_LOGIN_URL = `${SIEM_BASE_URL}${LOGIN_PATH}`;
    this.searchFilesStats.bind(this);
    this.endFiles.bind(this);
    this.siemLogin.bind(this);
  }

  async searchFilesStats(files: FileId[]) {
    const scrappedData: Array<FileStats> = [];

    const batched = getFilesBatches({ arr: files, size: this.MAX_BATCH_SIZE });

    const results = (await Promise.allSettled(
      batched.map(async (batch) => {
        return Promise.all(
          batch.map(async (file) => {
            const { newPage, browser } = await this.model.getBrowserContext();
            try {
              const fileStats = await this.model.collectData({
                file,
                page: newPage,
              });
              await browser.close();
              return { ...fileStats, status: "fulfilled" };
            } catch (error) {
              return { error, status: "rejected" };
            }
          })
        );
      })
    )) as Array<ResultType>;

    results.forEach((batchResult) => {
      if (batchResult.status === "fulfilled") {
        batchResult.value.forEach((file) => {
          const { status, ...fileData } = file;
          scrappedData.push(fileData);
        });
      } else {
        throw new ApiError({
          statusCode: 400,
          message: ERRORS.NO_FILE_STATS_RETRIEVED,
          data: [],
        });
      }
    });

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

    scrappedData.sort((a, b) => a.index - b.index);

    return scrappedData;
  }

  async endFiles({ files }: { files: FileStats[] }) {
    const filesToEnd = files.filter(
      (file) =>
        file.prevStatus !== "FINALIZADO" && file.prevStatus !== "Sin datos"
    );

    if (filesToEnd.length === 0) {
      return [];
    }

    const result: FileEndedStats[] = [];
    let updatedFile: FileEndedStats, message: string, detail: string;

    /**
     * TO DO:
     * 1. Divide the files to end in groups of 5-10 to avoid timeouts
     * 2. Use Promise.allSettled() to handle errors
     * 3. Use "for await" loop to work with chunks, where each would be parallelized with Promise.allSettled()
     */
    const filesToEndChunks = filesToEnd.reduce((acc, file, index) => {
      if (index % 10 === 0) {
        acc.push([file]);
      } else {
        acc[acc.length - 1].push(file);
      }
      return acc;
    }, [] as FileStats[][]);

    await Promise.all(
      filesToEndChunks.map(async (filesChunk) => {
        let fileNewData: FileStats,
          siemPage: Page | null = null,
          newBrowser: Browser | null = null;
        await Promise.all(
          filesChunk.map(async (file) => {
            const loginResult = await this.siemLogin();
            siemPage = loginResult.siemPage;
            newBrowser = loginResult.browser;

            siemPage.addListener("dialog", (alert) => {
              alert.accept();
            });
            try {
              const [{ num }] = parseFileStats([file]);
              await siemPage.goto(`${SIEM_BASE_URL}${FILE_STATS_PATH}${num}`);
              await siemPage.waitForLoadState("domcontentloaded");

              // await siemPage.screenshot({
              //   path: `./uploads/screenshots/checkpoint-1.png`,
              //   fullPage: true,
              // });

              await siemPage
                .locator('.menu_contexto a:text-matches("finalizar", "i")')
                .click();
              // await siemPage.waitForTimeout(1000);

              // await siemPage.screenshot({
              //   path: `./uploads/screenshots/checkpoint-2.png`,
              //   fullPage: true,
              // });

              message = (await siemPage.locator("h2").textContent()) ?? "";
              detail = (await siemPage.locator("h3").textContent()) ?? "";
              // await siemPage.waitForLoadState();

              fileNewData = await this.model.collectData({
                file: {
                  ...file,
                  num, // only middle long number
                },
                page: null,
              });

              updatedFile = {
                ...file,
                newStatus: {
                  status: fileNewData?.prevStatus ?? "",
                  message,
                  detail,
                },
              };
              result.push(updatedFile);
            } catch (error) {
              updatedFile = {
                ...file,
                newStatus: {
                  status: fileNewData?.prevStatus ?? "",
                  message,
                  detail,
                },
              };
              result.push(updatedFile);
            } finally {
              await siemPage?.removeListener("dialog", () => {});
              await newBrowser?.close();
            }
          })
        );
      })
    );

    return result;
  }

  async siemLogin(): Promise<{ siemPage: Page; browser: Browser }> {
    if (!this.SIEM_LOGIN_URL) {
      throw new ApiError({
        statusCode: 500,
        message: ERRORS.SERVER_ERROR,
      });
    }

    let { newPage: siemPage, browser } = await this.model.getBrowserContext();

    await siemPage.goto(this.SIEM_LOGIN_URL);
    await siemPage.waitForLoadState();

    try {
      siemPage = await this.model.siemLogin({
        user: SIEM_USER,
        pass: SIEM_PASSWORD,
        newPage: siemPage,
      });
    } catch (error) {
      console.log("🚀 ~ FilesService ~ siemLogin ~ error:", error);
      throw new ApiError({
        statusCode: 401,
        message: ERRORS.COULD_NOT_LOGIN_IN_SIEM,
      });
    }

    await siemPage.waitForLoadState();

    return { siemPage, browser };
  }
}

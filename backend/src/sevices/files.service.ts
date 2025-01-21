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
import { parseFileStats } from "../models/lib";
import { IFilesService } from "./types";

export class FilesService implements IFilesService {
  model: modelTypes;

  constructor(model: modelTypes) {
    this.model = model;
  }

  async searchFilesStats(files: FileId[]) {
    // const { newPage, browser } = await getBrowserContext();

    const scrappedData: FileStats[] = [];
    let dataCollection: FileStats;

    await Promise.all(
      files.map(async (file) => {
        dataCollection = await this.model.collectData({ file, page: null });
        scrappedData.push(dataCollection);
      })
    );

    // repeat first file to be sure to colect all the data
    const firstFileData = await this.model.collectData({
      file: files[0],
      page: null,
    });
    scrappedData.splice(0, 1, firstFileData);

    // newPage.waitForTimeout(1500);
    // await browser.close();
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

    await Promise.all(
      filesToEnd.map(async (file) => {
        let fileNewData,
          siemPage: Page | null = null,
          newBrowser: Browser | null = null;

        try {
          const { newPage, browser } = await this.model.getBrowserContext();
          newBrowser = browser;
          await newPage.goto(`${SIEM_BASE_URL}${LOGIN_PATH}`);

          siemPage = await this.model.login({
            user: SIEM_USER,
            pass: SIEM_PASSWORD,
            newPage,
          });

          if (!siemPage) {
            throw new Error("Could not login to SIEM");
          }

          siemPage.addListener("dialog", (alert) => {
            alert.accept();
          });

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
          await siemPage.waitForTimeout(1000);

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

    return result;
  }
}

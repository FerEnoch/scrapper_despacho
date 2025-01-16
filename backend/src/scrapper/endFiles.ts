import { collectData, getBrowserContext, login } from "./lib";
import {
  SIEM_BASE_URL,
  LOGIN_PATH,
  FILE_STATS_PATH,
  SIEM_USER,
  SIEM_PASSWORD,
} from "../config";
import { FileStats, FileEndedStats } from "../types";
import { parseFileStats } from "../lib";
import { Browser, Page } from "@playwright/test";

export async function endFiles({ files }: { files: FileStats[] }) {
  const filesToEnd = files.filter(
    (file) =>
      file.prevStatus !== "FINALIZADO" && file.prevStatus !== "Sin datos"
  );

  if (filesToEnd.length === 0) {
    console.log("🚀 ~ endFiles ~ No files to end");
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
        const { newPage, browser } = await getBrowserContext();
        newBrowser = browser;
        await newPage.goto(`${SIEM_BASE_URL}${LOGIN_PATH}`);

        siemPage = await login({
          user: SIEM_USER,
          pass: SIEM_PASSWORD,
          newPage,
        });

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

        await siemPage.locator('.menu_contexto a:text-matches("finalizar", "i")').click();
        await siemPage.waitForTimeout(1000);

        // await siemPage.screenshot({
        //   path: `./uploads/screenshots/checkpoint-2.png`,
        //   fullPage: true,
        // });

        message = (await siemPage.locator("h2").textContent()) ?? "";
        detail = (await siemPage.locator("h3").textContent()) ?? "";
        // await siemPage.waitForLoadState();

        fileNewData = await collectData({
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
        console.log("🚀 ~ endFile ~ error:", error);
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
        console.log("🚀 ~ endFiles ~ result:", result.length);
      }
    })
  );

  return result;
}

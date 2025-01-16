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

export async function endFiles({ files }: { files: FileStats[] }) {
  const filesToEnd = files.filter((file) => file.prevStatus !== "FINALIZADO");

  if (filesToEnd.length === 0) {
    console.log("🚀 ~ endFiles ~ No files to end");
    return [];
  }

  const { newPage, browser } = await getBrowserContext();
  await newPage.goto(`${SIEM_BASE_URL}${LOGIN_PATH}`);

  const siemPage = await login({
    user: SIEM_USER,
    pass: SIEM_PASSWORD,
    newPage,
  });

  siemPage.addListener("dialog", (alert) => {
    alert.accept();
  });

  const result: FileEndedStats[] = [];
  let updatedFile: FileEndedStats;

  for await (const file of filesToEnd) {
    const [{ num }] = parseFileStats([file]);
    await siemPage.goto(`${SIEM_BASE_URL}${FILE_STATS_PATH}${num}`);
    await siemPage.waitForLoadState();

    // await siemPage.screenshot({
    //   path: `./uploads/screenshots/checkpoint-1.png`,
    //   fullPage: true,
    // });

    await siemPage.click('.menu_contexto a:text-matches("finalizar", "i")');
    // await siemPage.waitForTimeout(1000);

    // await siemPage.screenshot({
    //   path: `./uploads/screenshots/checkpoint-2.png`,
    //   fullPage: true,
    // });

    const message = (await siemPage.locator("h2").textContent()) ?? "";
    const detail = (await siemPage.locator("h3").textContent()) ?? "";
    // await siemPage.waitForLoadState();

    const fileNewData = await collectData({
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
    try {
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
      continue;
    }
  }

  await siemPage.removeListener("dialog", () => {});
  await browser.close();
  console.log("🚀 ~ endFiles ~ result:", result.length);
  return result;
}

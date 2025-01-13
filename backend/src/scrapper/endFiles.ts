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
  await newPage.goto(`${SIEM_BASE_URL}/${LOGIN_PATH}`);

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
    /* do not abstract process */
    // const statsPage = await getStatsPage({ file: fileId, page: siemPage });
    // const { completeNum, rep, num, digv } = fileId;
    // await siemPage.fill("input[id='repa']", rep || "");
    // await siemPage.fill("input[id='numero']", num || "");
    // await siemPage.fill("input[id='dv']", digv || "");
    // await siemPage.click("input[id='buscar_nro']");
    // await siemPage.waitForLoadState();

    await siemPage.goto(`${SIEM_BASE_URL}/${FILE_STATS_PATH}${num}`);

    // await siemPage.screenshot({
    //   path: `./uploads/screenshots/checkpoint-1.png`,
    //   fullPage: true,
    // });

    await siemPage.click('.menu_contexto a:text-matches("finalizar", "i")');

    await siemPage.waitForLoadState();
    await siemPage.waitForTimeout(1000);

    // await siemPage.screenshot({
    //   path: `./uploads/screenshots/checkpoint-2.png`,
    //   fullPage: true,
    // });

    const message = (await siemPage.locator("h2").textContent()) ?? "";
    const detail = (await siemPage.locator("h3").textContent()) ?? "";

    // await siemPage.locator("#volver").click();
    // await siemPage.waitForLoadState();
    // await siemPage.click("a[href='expediente_buscar.php']");
    // await siemPage.waitForLoadState();

    const { num: number, location, prevStatus, title } = file;
    const { prevStatus: newStatus = "" } = await collectData({
      file,
      page: newPage,
    });

    updatedFile = {
      num: number,
      location,
      title,
      prevStatus,
      newStatus,
      siemMessage: {
        message,
        detail,
      },
    };
    result.push(updatedFile);
    try {
    } catch (error) {
      console.log("🚀 ~ endFile ~ error:", error);
      updatedFile = {
        num: number,
        location,
        title,
        prevStatus,
        newStatus,
        siemMessage: {
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
  return result;
}

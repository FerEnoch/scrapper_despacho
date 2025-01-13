import { SIEM_BASE_URL, FILE_STATS_PATH } from "../config";
// import { parseFileStats } from "../lib";
import { FileId, FileStats } from "../types";
import { collectData, getBrowserContext, login } from "./lib";

export async function searchFilesStats(files: FileId[]) {
  const { newPage, browser } = await getBrowserContext();
  // await newPage.goto(`${SIEM_BASE_URL}/${LOGIN_PATH}`);

  // const siemPage = await login({
  //   user: SIEM_USER,
  //   pass: SIEM_PASSWORD,
  //   newPage,
  // });

  const scrappedData: FileStats[] = [];
  let dataCollection: FileStats;

  // Repeat first file to be sure to colect all the data
  let firstFile: FileId = files[0];

  for await (const file of files) {
    try {
      const { num } = file;
      await newPage.goto(`${SIEM_BASE_URL}/${FILE_STATS_PATH}${num}`);

      dataCollection = await collectData({ file, page: newPage });
      scrappedData.push(dataCollection);

      // await newPage.click("a[href='expediente_buscar.php']");
      // await newPage.waitForLoadState("domcontentloaded");
    } catch (error) {
      console.log("🚀 ~ searchFilesStats ~ error:", error);
      dataCollection = {
        num: file.completeNum ?? "",
        title: "",
        prevStatus: "No se pudo obtener datos",
        location: "No se pudo obtener datos",
      };
      scrappedData.push(dataCollection);
      continue;
    }
  }

  // repeat first file to be sure to colect all the data
  const firstFileData = await collectData({ file: firstFile, page: newPage });
  scrappedData.splice(0, 1, firstFileData);

  await browser.close();
  return scrappedData;
}

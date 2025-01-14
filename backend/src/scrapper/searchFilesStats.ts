import { FileId, FileStats } from "../types";
import { collectData, getBrowserContext, login } from "./lib";

export async function searchFilesStats(files: FileId[]) {
  const { newPage, browser } = await getBrowserContext();

  const scrappedData: FileStats[] = [];
  let dataCollection: FileStats;

  for await (const file of files) {
    dataCollection = await collectData({ file, page: newPage });
    scrappedData.push(dataCollection);
  }

  // repeat first file to be sure to colect all the data
  const firstFileData = await collectData({ file: files[0], page: newPage });
  scrappedData.splice(0, 1, firstFileData);

  // newPage.waitForTimeout(1500);
  await browser.close();
  return scrappedData;
}

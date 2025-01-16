import { FileId, FileStats } from "../types";
import { collectData } from "./lib";

export async function searchFilesStats(files: FileId[]) {
  // const { newPage, browser } = await getBrowserContext();

  const scrappedData: FileStats[] = [];
  let dataCollection: FileStats;

  await Promise.all(
    files.map(async (file) => {
      dataCollection = await collectData({ file, page: null });
      scrappedData.push(dataCollection);
    })
  );

  // repeat first file to be sure to colect all the data
  const firstFileData = await collectData({ file: files[0], page: null });
  scrappedData.splice(0, 1, firstFileData);

  // newPage.waitForTimeout(1500);
  // await browser.close();
  return scrappedData;
}

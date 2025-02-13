import { FileStats } from "../../models/types";
import { filesStats } from "../sample_data/filesStats";
import { expect, test } from "@playwright/test";
import { FilesScrapper } from "../../models/filesScrapper.model";
import { parsedFilesIds } from "../sample_data/parsedFilesIds";
import { FilesService } from "../../sevices/files.service";
import { modelTypes } from "../../types";
import fs from "node:fs/promises";
import { filesEnded } from "../sample_data/filesEnded";
import { wholeLotOfFileStats } from "../sample_data/filesStats-whole-lot-of";

/**
 * @description Playwright tests
 * @description These tests use the enviroment variables of SIEM_USER and SIEM_PASSWORD
 * @dev To run tests:
 *  1. npm run fs-service:test
 *  2. npm run fs-service:report:test
 */
test("FILES-SERVICE > Should login in SIEM page", async () => {
  let lastReportScreenshot;
  try {
    lastReportScreenshot = await fs.readFile(
      "./src/tests/integration/login.jpg"
    );

    if (lastReportScreenshot) {
      await fs.rm("./src/tests/integration/login.jpg");
    }
  } catch (error: any) {
    console.log("No file login.jpg to remove");
  }

  const filesScrapper: modelTypes["IFileScrapper"] = new FilesScrapper();
  const filesService = new FilesService({ model: filesScrapper });

  try {
    await filesService.siemLogin();

    fs.readFile("./src/tests/integration/login.jpg")
      .then((file) => {
        lastReportScreenshot = file;
      })
      .catch((_err: any) => console.log("No file login.jpg to remove"));
  } catch (error: any) {
    console.log("😭 Something whent wrong with SIEM login");
  }

  expect(lastReportScreenshot).toBeTruthy();
});

test("files.service > Should get complete files stats in batches", async () => {
  const filesScrapper: modelTypes["IFileScrapper"] = new FilesScrapper();
  const filesService = new FilesService({ model: filesScrapper });

  const result: Array<FileStats> = await filesService.searchFilesStats(
    parsedFilesIds
  );

  expect(result).toHaveLength(parsedFilesIds.length);
  expect(result).toEqual(filesStats);
});

test("files.service > Should end SOME files in SIEM system in batches", async () => {
  const filesScrapper: modelTypes["IFileScrapper"] = new FilesScrapper();
  const filesService = new FilesService({ model: filesScrapper });

  const filesEndedResult = await filesService.endFiles({ files: filesStats });

  expect(filesEndedResult).toHaveLength(filesStats.length);
  expect(filesEndedResult).toEqual(filesEnded);
});

/**
 * @description This test is for testing large amount of files (~50)
 * @description It is skipped because IT FAILS in playwright test runtime, but it works in
 * @description vitest api integration tests.
 *  */
test.skip("files.service > Should end LOT OF FILES in SIEM system in batches", async () => {
  const filesScrapper: modelTypes["IFileScrapper"] = new FilesScrapper();
  const filesService = new FilesService({ model: filesScrapper });

  const filesEndedResult = await filesService.endFiles({
    files: wholeLotOfFileStats,
  });

  expect(filesEndedResult).toHaveLength(wholeLotOfFileStats.length);
  expect(filesEndedResult).toEqual(wholeLotOfFileStats);
});

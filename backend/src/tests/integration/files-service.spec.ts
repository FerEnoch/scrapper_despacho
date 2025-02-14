import { FileStats } from "../../models/types";
import { filesStats } from "../sample_data/filesStats";
import { expect, test } from "@playwright/test";
import { FilesScrapperV1 } from "../../models/filesScrapper.model";
import { parsedFilesIds } from "../sample_data/parsedFilesIds";
import { FilesService } from "../../sevices/files.service";
import { modelTypes } from "../../types";
import fs from "node:fs/promises";
import { filesEnded } from "../sample_data/filesEnded";
import { wholeLotOfFileStats } from "../sample_data/filesStats-whole-lot-of";
import {
  findLastScreenshotIfExists,
  removeLastScreenshotIfExists,
} from "../helpers";

/**
 * @description Playwright tests for v1 of the files scrapper service
 * @description These tests use the enviroment variables of SIEM_USER and SIEM_PASSWORD
 * @dev To run tests:
 *  1. npm run fs-service:test
 *  2. npm run fs-service:report:test
 */
test("FILES-SERVICE > Should NOT login in SIEM without credentials", async () => {
  await removeLastScreenshotIfExists("./src/tests/integration/login.jpg");

  const filesScrapper: modelTypes["IFileScrapper"] = new FilesScrapperV1();
  const filesService = new FilesService({ model: filesScrapper });

  await filesService.siemLogin();

  const lastReportScreenshot = await findLastScreenshotIfExists(
    "./src/tests/integration/login.jpg"
  );

  expect(lastReportScreenshot).toBeNull();
});

test("files.service > Should get complete files stats in batches", async () => {
  const filesScrapper: modelTypes["IFileScrapper"] = new FilesScrapperV1();
  const filesService = new FilesService({ model: filesScrapper });

  const result: Array<FileStats> = await filesService.searchFilesStats(
    parsedFilesIds
  );

  expect(result).toHaveLength(parsedFilesIds.length);
  expect(result).toEqual(filesStats);
});

test("files.service > Should end SOME files in SIEM system in batches", async () => {
  const filesScrapper: modelTypes["IFileScrapper"] = new FilesScrapperV1();
  const filesService = new FilesService({ model: filesScrapper });

  const filesEndedResult = await filesService.endFiles({ files: filesStats });

  expect(filesEndedResult).toHaveLength(filesStats.length);
  expect(filesEndedResult).toEqual(filesEnded);
});

/**
 * @description This test is for testing large amount of files (~50)
 * @description It is skipped because IT FAILS in playwright test runtime.
 * @description It works in vitest api integration tests.
 *  */
test.skip("files.service > Should end LOT OF FILES in SIEM system in batches", async () => {
  const filesScrapper: modelTypes["IFileScrapper"] = new FilesScrapperV1();
  const filesService = new FilesService({ model: filesScrapper });

  const filesEndedResult = await filesService.endFiles({
    files: wholeLotOfFileStats,
  });

  expect(filesEndedResult).toHaveLength(wholeLotOfFileStats.length);
  expect(filesEndedResult).toEqual(wholeLotOfFileStats);
});

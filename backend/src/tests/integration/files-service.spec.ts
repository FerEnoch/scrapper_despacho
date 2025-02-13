import { FileStats } from "../../models/types";
import { filesStats } from "../sample_data/filesStats";
import { expect, test } from "@playwright/test";
import { FilesScrapper } from "../../models/filesScrapper.model";
import { parsedFilesIds } from "../sample_data/parsedFilesIds";
import { FilesService } from "../../sevices/files.service";
import { modelTypes } from "../../types";
import fs from "node:fs/promises";
import { filesEnded } from "../sample_data/filesEnded";
import { fakeEndFiles } from "./utils/fake-endFiles";
import { wholeLotOfFileStats } from "../sample_data/filesStats-whole-lot-of";

/**
 * @description Playwright tests
 * @dev To run tests:
 *  1. npm run fs-service:test
 *  2. npm run fs-service:report:test
 */
test("FILES-SERVICE > Should login in SIEM page", async () => {
  try {
    const lastResportImg = await fs.readFile(
      "./src/tests/integration/nav-to-login.jpg"
    );

    if (lastResportImg) {
      await fs.rm("./src/tests/integration/nav-to-login.jpg");
    }
  } catch (error: any) {
    console.log("No file nav-to-login.jpg to remove");
  }

  const filesScrapper: modelTypes["IFileScrapper"] = new FilesScrapper();
  const filesService = new FilesService({ model: filesScrapper });

  const { siemPage } = await filesService.siemLogin();

  await siemPage.screenshot({
    path: "./src/tests/integration/nav-to-login.jpg",
    fullPage: true,
  });

  expect(siemPage).toBeTruthy();
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

  // const filesEndedResult = await fakeEndFiles({
  //   files: filesStats,
  // });
  expect(filesEndedResult).toHaveLength(filesStats.length);
  expect(filesEndedResult).toEqual(filesEnded);
});

test.only("files.service > Should end LOT OF FILES in SIEM system in batches", async () => {
  // const filesScrapper: modelTypes["IFileScrapper"] = new FilesScrapper();
  // const filesService = new FilesService({ model: filesScrapper });

  // const filesEndedResult = await filesService.endFiles({
  //   files: wholeLotOfFileStats,
  // });

  const filesEndedResult = await fakeEndFiles({
    files: wholeLotOfFileStats,
  });
  expect(filesEndedResult).toHaveLength(filesStats.length);
  expect(filesEndedResult).toEqual(filesEnded);
});

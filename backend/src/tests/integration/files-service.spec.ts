import { FileStats } from "../../models/types";
import { filesStats } from "../sample_data/filesStats";
import { expect, test } from "@playwright/test";
import { FilesScrapper } from "../../models/filesScrapper.model";
import { parsedFilesIds } from "../sample_data/parsedFilesIds";
import { FilesService } from "../../sevices/files.service";
import { modelTypes } from "../../types";

test("files.service > Should login in SIEM page", async () => {
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

  const fileStatsSettled: Array<FileStats> =
    await filesService.searchFilesStats(parsedFilesIds);

  expect(fileStatsSettled).toHaveLength(parsedFilesIds.length);
  expect(fileStatsSettled).toEqual(filesStats);
});

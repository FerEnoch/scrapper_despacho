import { FileId, FileStats } from "../../models/types";
import { filesStats } from "../sample_data/filesStats";
import { expect, test } from "@playwright/test";
import { FilesScrapper } from "../../models/filesScrapper.model";
import { parsedFilesIds } from "../sample_data/parsedFilesIds";

test("Should login in SIEM page", async () => {
  const filesScrapper = new FilesScrapper();
  const { newPage } = await filesScrapper.getBrowserContext();

  const SIEM_LOGIN_PATH = "https://siem.santafeciudad.gov.ar/login.php";
  const SIEM_USER = "fgomez";
  const SIEM_PASSWORD = "fgomez1812";

  await newPage.goto(SIEM_LOGIN_PATH);

  await newPage.waitForLoadState("domcontentloaded");

  await filesScrapper.siemLogin({
    user: SIEM_USER,
    pass: SIEM_PASSWORD,
    newPage,
  });

  await newPage.screenshot({
    path: "./src/tests/integration/browser-nav-login.jpg",
    fullPage: true,
  });

  expect(newPage).toBeTruthy();
});

test.only("Should get complete files stats in batches", async () => {
  const filesScrapper = new FilesScrapper();
  const fileStatsSettled: Array<FileStats> = [];

  const MAX_BATCH_QUANTITY = 2;

  const batched = parsedFilesIds.reduce((acc, file, index) => {
    if (index % MAX_BATCH_QUANTITY === 0) {
      acc.push([file]);
    } else {
      acc[acc.length - 1].push(file);
    }
    return acc;
  }, [] as Array<FileId[]>);

  // Define a type for your promise results
  type ResultType =
    | {
        value: Array<FileStats & { status?: "fulfilled" | "rejected" }>;
        status: "fulfilled";
      }
    | { error: any; status: "rejected" };

  const results = (await Promise.allSettled(
    batched.map(async (batch) => {
      return Promise.all(
        batch.map(async (file) => {
          const { newPage, browser } = await filesScrapper.getBrowserContext();
          try {
            const fileStats = await filesScrapper.collectData({
              file,
              page: newPage,
            });
            await browser.close();
            return { ...fileStats, status: "fulfilled" };
          } catch (error) {
            return { error, status: "rejected" };
          }
        })
      );
    })
  )) as Array<ResultType>;

  results.forEach((batchResult) => {
    if (batchResult.status === "fulfilled") {
      batchResult.value.forEach((file) => {
        const { status, ...fileData } = file;
        fileStatsSettled.push(fileData);
      });
    } else {
      console.error("A batch failed:", batchResult.error);
    }
  });

  fileStatsSettled.sort((a, b) => a.index - b.index);

  expect(fileStatsSettled).toHaveLength(parsedFilesIds.length);
  expect(fileStatsSettled).toEqual(filesStats);
});

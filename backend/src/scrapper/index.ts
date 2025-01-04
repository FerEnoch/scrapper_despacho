import { chromium } from "playwright";
import { SIEM_URL, SIEM_USER, SIEM_PASSWORD } from "../config";
import { convertToJson } from "../lib/getFiles";
import { parseFilesNums } from "../lib/parseFiles";

async function getBrowserContext() {
  const browser = await chromium.launch();

  const context = await browser.newContext();
  const newPage = await context.newPage();

  return { newPage, browser };
}

async function scrap() {
  if (!SIEM_URL || !SIEM_USER || !SIEM_PASSWORD) return;

  const { newPage, browser } = await getBrowserContext();
  await newPage.goto(SIEM_URL);

  // await newPage.waitForTimeout(5000);

  await newPage.goto(SIEM_URL);

  await newPage.fill("input[name='login']", SIEM_USER);
  await newPage.fill("input[name='password']", SIEM_PASSWORD);

  await newPage.click("input[type='submit']");
  // await newPage.screenshot({ path: `siem.png`, fullPage: true });

  // await newPage.waitForTimeout(5000);

  // const filesRawData = await getFilesRawDataFromFile();
  // const filesArray = await convertToJson(filesRawData);

  // const filesByNum = await parseFilesNums(filesArray);
  // console.log("🚀 ~ main ~ filesToEnd:", filesByNum);

  await browser.close();
}

import { chromium } from "playwright";
import { Browser, Page } from "@playwright/test";
import { FileId } from "../../types";
import { FILE_STATS_PATH, SIEM_BASE_URL } from "../../config";
import { NO_RESULTS_GENERIC_MSG } from "../../config/constants";

export async function login({
  user,
  pass,
  newPage,
}: {
  user: string;
  pass: string;
  newPage: Page;
}): Promise<Page> {
  await newPage.fill("input[name='login']", user);
  await newPage.fill("input[name='password']", pass);
  await newPage.click("input[type='submit']");
  return newPage;
}

export async function getBrowserContext() {
  const browser = await chromium.launch();

  const context = await browser.newContext();
  const newPage = await context.newPage();

  return { newPage, browser };
}

export async function collectData({
  file,
  page,
}: {
  file: FileId;
  page: Page | null;
}) {
  try {
    let siemPage: Page | null = page,
      newBrowser: Browser | null = null;

    if (!siemPage) {
      const { newPage, browser } = await getBrowserContext();
      siemPage = newPage;
      newBrowser = browser;
    }

    const { num } = file;
    await siemPage.goto(`${SIEM_BASE_URL}${FILE_STATS_PATH}${num}`);

    let titleRow = await siemPage.$("tr:has-text('Carátula:')");
    let statusRow = await siemPage.$("tr:has-text('Estado:')");
    let locationRow = await siemPage.$("tr:has-text('Ubicado en:')");

    // retry to get the data
    if (!titleRow || !statusRow || !locationRow) {
      await siemPage.waitForTimeout(1000);
      titleRow = await siemPage.$("tr:has-text('Carátula:')");
      statusRow = await siemPage.$("tr:has-text('Estado:')");
      locationRow = await siemPage.$("tr:has-text('Ubicado en:')");
    }

    const rawTitle = await titleRow?.textContent();
    const rawStatus = await statusRow?.textContent();
    const rawLocation = await locationRow?.textContent();

    if (newBrowser) {
      await newBrowser.close();
    }

    return {
      num: file.completeNum ?? "",
      title: rawTitle?.slice(12).trim() ?? NO_RESULTS_GENERIC_MSG,
      prevStatus:
        rawStatus?.slice(18).replace("\n", "").replace("\t", "").trim() ??
        NO_RESULTS_GENERIC_MSG,
      location:
        rawLocation?.slice(15).replace("\n", "").trim() ??
        NO_RESULTS_GENERIC_MSG,
    };
  } catch (error) {
    console.log("🚀 ~ Fail to fetch file data:", file, error);
    return {
      num: file.completeNum ?? "",
      title: "",
      prevStatus: NO_RESULTS_GENERIC_MSG,
      location: NO_RESULTS_GENERIC_MSG,
    };
  }
}

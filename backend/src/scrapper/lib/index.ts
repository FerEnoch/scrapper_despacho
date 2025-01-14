import { chromium } from "playwright";
import { Page } from "@playwright/test";
import { FileId } from "../../types";
import { FILE_STATS_PATH, SIEM_BASE_URL } from "../../config";

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

// export async function getStatsPage({
//   file,
//   page,
// }: {
//   file: FileId;
//   page: Page;
// }) {
//   const { completeNum, rep, num, digv } = file;

//   await page.fill("input[id='repa']", rep || "");
//   await page.fill("input[id='numero']", num || "");
//   await page.fill("input[id='dv']", digv || "");

//   await page.locator("input[id='buscar_nro']").click();
//   await page.waitForLoadState("domcontentloaded");

//   return page;
// }

export async function collectData({
  file,
  page: siempPage,
}: {
  file: FileId;
  page: Page;
}) {
  try {
    const { num } = file;
    await siempPage.goto(`${SIEM_BASE_URL}${FILE_STATS_PATH}${num}`);
  } catch (error) {
    console.log("🚀 ~ Fail to fetch file data:", file, error);
    return {
      num: file.completeNum ?? "",
      title: "",
      prevStatus: "No se pudo obtener datos",
      location: "No se pudo obtener datos",
    };
  }

  let titleRow = await siempPage.$("tr:has-text('Carátula:')");
  let statusRow = await siempPage.$("tr:has-text('Estado:')");
  let locationRow = await siempPage.$("tr:has-text('Ubicado en:')");

  // retry to get the data
  if (!titleRow || !statusRow || !locationRow) {
    await siempPage.waitForTimeout(1000);
    titleRow = await siempPage.$("tr:has-text('Carátula:')");
    statusRow = await siempPage.$("tr:has-text('Estado:')");
    locationRow = await siempPage.$("tr:has-text('Ubicado en:')");
  }

  const rawTitle = (await titleRow?.textContent()) ?? "";
  const rawStatus = (await statusRow?.textContent()) ?? "";
  const rawLocation = (await locationRow?.textContent()) ?? "";

  return {
    num: file.completeNum ?? "",
    title: rawTitle.slice(12).trim(),
    prevStatus: rawStatus.slice(18).replace("\n", "").replace("\t", "").trim(),
    location: rawLocation.slice(15).replace("\n", "").trim(),
  };
}

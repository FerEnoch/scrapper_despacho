import { Browser, chromium, Page } from "@playwright/test";
import { FILE_STATS_PATH, SIEM_BASE_URL } from "../config";
import { FileId, FileStats, IFileScrapper } from "./types";

export class FilesScrapper implements IFileScrapper {
  constructor() {
    this.getBrowserContext.bind(this);
    this.login.bind(this);
    this.collectData.bind(this);
  }

  async getBrowserContext() {
    const browser = await chromium.launch();

    const context = await browser.newContext();
    const newPage = await context.newPage();

    return { newPage, browser };
  }

  async collectData({
    file,
    page,
  }: {
    file: FileId;
    page: Page | null;
  }): Promise<FileStats> {
    try {
      let siemPage: Page | null = page,
        newBrowser: Browser | null = null;
      if (!siemPage) {
        const { newPage, browser } = await this.getBrowserContext();
        siemPage = newPage;
        newBrowser = browser;
      }
      const { num } = file;
      await siemPage.goto(`${SIEM_BASE_URL}${FILE_STATS_PATH}${num}`);
      await siemPage.waitForLoadState("domcontentloaded");

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
        title: rawTitle?.slice(12).trim() ?? "",
        prevStatus:
          rawStatus?.slice(18).replace("\n", "").replace("\t", "").trim() ?? "",
        location: rawLocation?.slice(15).replace("\n", "").trim() ?? "",
      };
    } catch (error) {
      console.log("🚀 ~ FilesScrapper ~ error:", error);
      return {
        num: file.completeNum ?? "",
        title: "",
        prevStatus: "",
        location: "",
      };
    }
  }

  async login({
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
}

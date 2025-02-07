import { Browser, chromium, Dialog, Page } from "@playwright/test";
import { FileId, FileStats, IFileScrapper, locationType } from "./types";
import { ERRORS } from "../errors/types";
import {
  COLLECTION_ERRORS,
  SIEM_PAGE_DATA,
} from "../models/lib/filesScrapper/constants";
import { ApiError } from "../errors/api-error";

export class FilesScrapper implements IFileScrapper {
  SIEM_BASE_URL = "";
  SIEM_LOGIN_PATH = "";
  SIEM_LOGIN_URL = "";
  SIEM_SEARCH_FILE_PATH = "";
  SIEM_SEARCH_FILE_URL = "";
  END_FILE_TEXT = "";
  SIEM_LOCATE_FILE_TITLE: locationType;
  SIEM_LOCATE_FILE_STATUS: locationType;
  SIEM_LOCATE_FILE_LOCATION: locationType;

  constructor() {
    const {
      END_FILE_TEXT,
      SIEM_BASE_URL,
      SIEM_LOGIN_PATH,
      SIEM_SEARCH_FILE_PATH,
      SIEM_LOCATE_FILE_TITLE,
      SIEM_LOCATE_FILE_STATUS,
      SIEM_LOCATE_FILE_LOCATION,
    } = SIEM_PAGE_DATA;
    this.END_FILE_TEXT = END_FILE_TEXT;
    this.SIEM_SEARCH_FILE_PATH = SIEM_SEARCH_FILE_PATH;
    this.SIEM_SEARCH_FILE_URL = `${SIEM_BASE_URL}${SIEM_SEARCH_FILE_PATH}`;
    this.SIEM_BASE_URL = SIEM_BASE_URL;
    this.SIEM_LOGIN_PATH = SIEM_LOGIN_PATH;
    this.SIEM_LOGIN_URL = `${SIEM_BASE_URL}${SIEM_LOGIN_PATH}`;
    this.SIEM_LOCATE_FILE_TITLE = SIEM_LOCATE_FILE_TITLE;
    this.SIEM_LOCATE_FILE_STATUS = SIEM_LOCATE_FILE_STATUS;
    this.SIEM_LOCATE_FILE_LOCATION = SIEM_LOCATE_FILE_LOCATION;
    this.getBrowserContext.bind(this);
    this.siemLogin.bind(this);
    this.collectData.bind(this);
    this.endFileByNum.bind(this);
  }

  async getBrowserContext(): Promise<{ newPage: Page; browser: Browser }> {
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
      await siemPage.goto(`${this.SIEM_SEARCH_FILE_URL}${num}`);
      await siemPage.waitForLoadState();

      let titleRow = await siemPage.locator(
        this.SIEM_LOCATE_FILE_TITLE.element,
        {
          hasText: this.SIEM_LOCATE_FILE_TITLE.text,
        }
      );
      let statusRow = await siemPage.locator(
        this.SIEM_LOCATE_FILE_STATUS.element,
        {
          hasText: this.SIEM_LOCATE_FILE_STATUS.text,
        }
      );
      let locationRow = await siemPage.locator(
        this.SIEM_LOCATE_FILE_LOCATION.element,
        {
          hasText: this.SIEM_LOCATE_FILE_LOCATION.text,
        }
      );

      // retry to get the data
      if (!titleRow || !statusRow || !locationRow) {
        titleRow = await siemPage.locator(this.SIEM_LOCATE_FILE_TITLE.element, {
          hasText: this.SIEM_LOCATE_FILE_TITLE.text,
        });
        statusRow = await siemPage.locator(
          this.SIEM_LOCATE_FILE_STATUS.element,
          {
            hasText: this.SIEM_LOCATE_FILE_STATUS.text,
          }
        );
        locationRow = await siemPage.locator(
          this.SIEM_LOCATE_FILE_LOCATION.element,
          {
            hasText: this.SIEM_LOCATE_FILE_LOCATION.text,
          }
        );
      }

      const rawTitle = await titleRow?.textContent();
      const rawStatus = await statusRow?.textContent();
      const rawLocation = await locationRow?.textContent();

      if (newBrowser) {
        await newBrowser.close();
      }

      return {
        index: file.index,
        num: file.completeNum || COLLECTION_ERRORS.DATA_MISSING,
        title: rawTitle?.slice(12).trim() || COLLECTION_ERRORS.DATA_MISSING,
        prevStatus:
          rawStatus?.slice(18).replace("\n", "").replace("\t", "").trim() ||
          COLLECTION_ERRORS.DATA_MISSING,
        location:
          rawLocation?.slice(15).replace("\n", "").trim() ||
          COLLECTION_ERRORS.DATA_MISSING,
      };
    } catch (error) {
      console.log("🚀 ~ FilesScrapper ~ error:", error);
      return {
        index: file.index,
        num: file.completeNum || COLLECTION_ERRORS.NO_DATA_COLLECTED,
        title: "",
        prevStatus: "",
        location: "",
      };
    }
  }

  async endFileByNum({
    num,
    page,
  }: {
    num: string;
    page: Page;
  }): Promise<{ message: string; detail: string }> {
    page.addListener("dialog", (alert: Dialog) => {
      alert.accept();
    });

    try {
      await page.goto(`${this.SIEM_SEARCH_FILE_URL}${num}`);
      await page.waitForLoadState();
      await page
        .locator("a", {
          hasText: this.END_FILE_TEXT,
        })
        .click();

      await page.waitForLoadState();

      const message =
        (await page.locator("h2").textContent()) ??
        COLLECTION_ERRORS.DATA_MISSING;
      const detail =
        (await page.locator("h3").textContent()) ??
        COLLECTION_ERRORS.DATA_MISSING;

      return { message, detail };
    } catch (error) {
      console.log("🚀 ~ test ~ error:", error);
      return {
        message: COLLECTION_ERRORS.COULD_NOT_END_FILE_MESSAGE,
        detail: COLLECTION_ERRORS.COULD_NOT_END_FILE_DETAIL,
      };
    } finally {
      await page.removeListener("dialog", () => {});
    }
  }

  async siemLogin({
    user,
    pass,
  }: {
    user: string;
    pass: string;
  }): Promise<{ siemPage: Page; browser: Browser }> {
    if (!this.SIEM_LOGIN_URL) {
      throw new ApiError({
        statusCode: 500,
        message: ERRORS.SERVER_ERROR,
      });
    }

    try {
      let { newPage: siemPage, browser } = await this.getBrowserContext();

      await siemPage.goto(this.SIEM_LOGIN_URL);
      await siemPage.waitForLoadState();

      await siemPage.locator("input[name='login']").fill(user);
      await siemPage.locator("input[name='password']").fill(pass);

      await siemPage.getByRole("button", { name: "acceder" }).click();
      await siemPage.waitForLoadState();

      return { siemPage, browser };
    } catch (error) {
      console.log("🚀 ~ FilesScrapper ~ error:", error);
      throw new ApiError({
        statusCode: 401,
        message: ERRORS.COULD_NOT_LOGIN_IN_SIEM,
      });
    }
  }
}

import {
  BrowserContext,
  chromium,
  Dialog,
  expect,
  Page,
  Route,
} from "@playwright/test";
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
  SIEM_SEE_FILE_PATH = "";
  SIEM_SEE_FILE_URL = "";
  SIEM_SEARCH_FILE_PATH = "";
  SIEM_SEARCH_FILE_URL = "";
  SIEM_END_FILE_PATH = "";
  SIEM_END_FILE_URL = "";
  END_FILE_TEXT = "";
  SIEM_LOCATE_FILE_TITLE: locationType;
  SIEM_LOCATE_FILE_STATUS: locationType;
  SIEM_LOCATE_FILE_LOCATION: locationType;
  AUTH_DENIED_PAGE_TITLE: locationType;
  AUTH_DENIED_PAGE_MSG: locationType;
  AUTH_GRANTED_PAGE_CHECK: locationType;
  context: BrowserContext | null = null;
  // page: Page | null = null;

  constructor() {
    const {
      END_FILE_TEXT,
      SIEM_BASE_URL,
      SIEM_LOGIN_PATH,
      SIEM_SEE_FILE_PATH,
      SIEM_SEARCH_FILE_PATH,
      SIEM_END_FILE_PATH,
      SIEM_LOCATE_FILE_TITLE,
      SIEM_LOCATE_FILE_STATUS,
      SIEM_LOCATE_FILE_LOCATION,
      AUTH_DENIED_PAGE_TITLE,
      AUTH_DENIED_PAGE_MSG,
      AUTH_GRANTED_PAGE_CHECK,
    } = SIEM_PAGE_DATA;
    this.END_FILE_TEXT = END_FILE_TEXT;
    this.SIEM_SEE_FILE_PATH = SIEM_SEE_FILE_PATH;
    this.SIEM_SEE_FILE_URL = `${SIEM_BASE_URL}${SIEM_SEE_FILE_PATH}`;
    this.SIEM_SEARCH_FILE_PATH = SIEM_SEARCH_FILE_PATH;
    this.SIEM_SEARCH_FILE_URL = `${SIEM_BASE_URL}${SIEM_SEARCH_FILE_PATH}`;
    this.SIEM_BASE_URL = SIEM_BASE_URL;
    this.SIEM_LOGIN_PATH = SIEM_LOGIN_PATH;
    this.SIEM_END_FILE_PATH = SIEM_END_FILE_PATH;
    this.SIEM_END_FILE_URL = `${SIEM_BASE_URL}${SIEM_END_FILE_PATH}`;
    this.SIEM_LOGIN_URL = `${SIEM_BASE_URL}${SIEM_LOGIN_PATH}`;
    this.SIEM_LOCATE_FILE_TITLE = SIEM_LOCATE_FILE_TITLE;
    this.SIEM_LOCATE_FILE_STATUS = SIEM_LOCATE_FILE_STATUS;
    this.SIEM_LOCATE_FILE_LOCATION = SIEM_LOCATE_FILE_LOCATION;
    this.AUTH_DENIED_PAGE_TITLE = AUTH_DENIED_PAGE_TITLE;
    this.AUTH_DENIED_PAGE_MSG = AUTH_DENIED_PAGE_MSG;
    this.AUTH_GRANTED_PAGE_CHECK = AUTH_GRANTED_PAGE_CHECK;
    this.createBrowserContext.bind(this);
    this.siemLogin.bind(this);
    this.collectData.bind(this);
    this.endFileByNum.bind(this);
    // this.checkSiemLogin.bind(this);
  }

  async createBrowserContext(): Promise<void> {
    const browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext();
    await context.route("**/*", this.intercept);

    this.context = context;
  }

  async intercept(route: Route): Promise<void> {
    const unwantedResources = ["stylesheet", "image", "fonts", "script"];
    if (unwantedResources.includes(route.request().resourceType())) {
      await route.abort();
    } else {
      await route.continue();
    }
  }

  async closeBrowserContext(): Promise<void> {
    if (this.context) {
      await this.context.close();
    }
  }

  async collectData({ file }: { file: FileId }): Promise<FileStats | null> {
    if (!this.context) {
      await this.createBrowserContext();
      return null;
    }
    const page = await this.context.newPage();
    const { num } = file;

    try {
      await page.goto(`${this.SIEM_SEE_FILE_URL}${num}`);
      await page.waitForLoadState();

      let titleRow = await page.locator(this.SIEM_LOCATE_FILE_TITLE.element, {
        hasText: this.SIEM_LOCATE_FILE_TITLE.text,
      });
      let statusRow = await page.locator(this.SIEM_LOCATE_FILE_STATUS.element, {
        hasText: this.SIEM_LOCATE_FILE_STATUS.text,
      });
      let locationRow = await page.locator(
        this.SIEM_LOCATE_FILE_LOCATION.element,
        {
          hasText: this.SIEM_LOCATE_FILE_LOCATION.text,
        }
      );

      const rawTitle = await titleRow?.textContent();
      const rawStatus = await statusRow?.textContent();
      const rawLocation = await locationRow?.textContent();

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
  }: {
    num: string;
  }): Promise<{ message: string; detail: string }> {
    if (!this.context) {
      await this.createBrowserContext();
      return { message: "", detail: "" };
    }

    const page = await this.context.newPage();
    page.addListener("dialog", (alert: Dialog) => {
      alert.accept();
    });

    try {
      await page.goto(`${this.SIEM_SEE_FILE_URL}${num}`);
      await page.waitForURL(`${this.SIEM_SEE_FILE_URL}${num}`, {
        waitUntil: "load",
      });

      await page
        .locator("a", {
          hasText: this.END_FILE_TEXT,
        })
        .click();

      await page.goto(`${this.SIEM_END_FILE_URL}${num}`, {
        waitUntil: "load",
      });

      const message =
        (await page.locator("h2").textContent()) ??
        COLLECTION_ERRORS.DATA_MISSING;
      const detail =
        (await page.locator("h3").textContent()) ??
        COLLECTION_ERRORS.DATA_MISSING;

      // page.close();

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
  }): Promise<void | null> {
    if (!this.SIEM_LOGIN_URL) {
      throw new ApiError({
        statusCode: 500,
        message: ERRORS.SERVER_ERROR,
      });
    }
    if (!this.context) {
      await this.createBrowserContext();
      return null;
    }
    const page = await this.context.newPage();

    try {
      await page.goto(this.SIEM_LOGIN_URL);
      await page.waitForURL(this.SIEM_LOGIN_URL, {
        waitUntil: "load",
      });
      await page.locator("input[name='login']").fill(user);
      await page.locator("input[name='password']").fill(pass);

      const responsePromise = page.waitForResponse(`${this.SIEM_LOGIN_URL}`);
      await page.getByRole("button", { name: "acceder" }).click();
      await responsePromise;

      await page.waitForURL(`${this.SIEM_SEARCH_FILE_URL}`, {
        waitUntil: "load",
      });

      const isLoggedIn = await this.checkSiemLogin({ page, user });
      if (!isLoggedIn) {
        throw new ApiError({
          statusCode: 401,
          message: ERRORS.COULD_NOT_LOGIN_IN_SIEM,
        });
      }
    } catch (error) {
      console.log("🚀 ~ FilesScrapper ~ error:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError({
        statusCode: 401,
        message: ERRORS.COULD_NOT_LOGIN_IN_SIEM,
      });
    }
  }

  async checkSiemLogin({
    page,
    user,
  }: {
    page: Page;
    user: string;
  }): Promise<boolean> {
    if (!this.context) {
      await this.createBrowserContext();
      return false;
    }

    await page.screenshot({
      fullPage: true,
      path: "./src/tests/integration/login.jpg",
    });

    expect(page).toBeTruthy();

    try {
      const checkUser = await page.locator(
        this.AUTH_GRANTED_PAGE_CHECK.element,
        { hasText: user }
      );
      await checkUser.waitFor({ state: "visible" });
      return true;
    } catch (error) {
      const errorTitle = await page
        .locator(this.AUTH_DENIED_PAGE_TITLE.element, {
          hasText: this.AUTH_DENIED_PAGE_TITLE.text,
        })
        .textContent();
      const errorMsg = await page
        .locator(this.AUTH_DENIED_PAGE_MSG.element, {
          hasText: this.AUTH_DENIED_PAGE_MSG.text,
        })
        .textContent();

      console.log(
        "🚀 ~ FilesScrapper ~ checkSiemLogin ~ error page:",
        errorTitle,
        errorMsg
      );
      return false;
    }
  }
}

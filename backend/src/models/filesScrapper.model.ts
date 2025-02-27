import {
  chromium,
  Dialog,
  Page,
  Route,
  BrowserContext,
  Browser,
  errors as PwErrors,
  Locator,
} from "playwright";
import { FileId, FileStats, IFileScrapperV1, locationType } from "./types";
import { ERRORS } from "../errors/types";
import {
  COLLECTION_ERRORS,
  SIEM_PAGE_DATA,
} from "../models/lib/filesScrapper/constants";
import { ApiError } from "../errors/api-error";
import { SCRAPPER_TIMEOUT } from "../config";
import chalk from "chalk";

export class FilesScrapperV1 implements IFileScrapperV1 {
  private readonly SIEM_BASE_URL;
  private readonly SIEM_LOGIN_PATH;
  private readonly SIEM_LOGIN_URL;
  private readonly SIEM_SEE_FILE_PATH;
  private readonly SIEM_SEE_FILE_URL;
  private readonly SIEM_SEARCH_FILE_PATH;
  private readonly SIEM_SEARCH_FILE_URL;
  private readonly SIEM_END_FILE_PATH;
  private readonly SIEM_END_FILE_URL;
  private readonly END_FILE_TEXT;
  private readonly SIEM_LOCATE_FILE_TITLE: locationType;
  private readonly SIEM_LOCATE_FILE_STATUS: locationType;
  private readonly SIEM_LOCATE_FILE_LOCATION: locationType;
  private readonly AUTH_DENIED_PAGE_MSG: locationType;
  private readonly AUTH_GRANTED_PAGE_CHECK: locationType;
  private readonly timeout = SCRAPPER_TIMEOUT;
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;

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
    this.AUTH_DENIED_PAGE_MSG = AUTH_DENIED_PAGE_MSG;
    this.AUTH_GRANTED_PAGE_CHECK = AUTH_GRANTED_PAGE_CHECK;
    this.createBrowserContext.bind(this);
    this.interceptRoutes.bind(this);
    this.closeBrowserContext.bind(this);
    this.siemLogin.bind(this);
    this.collectData.bind(this);
    this.endFileByNum.bind(this);
    this.checkSiemLogin.bind(this);
  }

  async createBrowserContext(): Promise<void> {
    const browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext();
    await context.route("**/*", this.interceptRoutes);

    this.context = context;
    this.browser = browser;
  }

  async interceptRoutes(route: Route): Promise<void> {
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

    if (this.browser) {
      await this.browser.close();
    }
  }

  async collectData({ file }: { file: FileId }): Promise<FileStats | null> {
    if (!this.context) {
      await this.createBrowserContext();
      console.log(
        chalk.cyanBright(
          " ~ FilesScrapperV1 ~ error:",
          "context not created - try again"
        )
      );
      throw new ApiError({
        statusCode: 500,
        message: ERRORS.SERVER_ERROR,
      });
    }
    const page = await this.context.newPage();
    const { num } = file;

    try {
      const response = await page.goto(`${this.SIEM_SEE_FILE_URL}${num}`);
      await page.waitForLoadState();
      if (
        !response ||
        response?.status() === 404 ||
        response?.status() === 500
      ) {
        console.log(
          chalk.yellow(`Error going to ${this.SIEM_SEE_FILE_URL}${num}`)
        );
        return {
          index: file.index,
          num: file.completeNum || COLLECTION_ERRORS.NO_DATA_COLLECTED,
          title: COLLECTION_ERRORS.NO_DATA_COLLECTED,
          prevStatus: COLLECTION_ERRORS.NO_DATA_COLLECTED,
          location: COLLECTION_ERRORS.NO_DATA_COLLECTED,
        };
      }

      let rawTitle: string = COLLECTION_ERRORS.DATA_MISSING,
        rawStatus: string = COLLECTION_ERRORS.DATA_MISSING,
        rawLocation: string = COLLECTION_ERRORS.DATA_MISSING,
        titleRow: Locator | null = null,
        statusRow: Locator | null = null,
        locationRow: Locator | null = null;

      try {
        titleRow = await page.locator(this.SIEM_LOCATE_FILE_TITLE.element, {
          hasText: this.SIEM_LOCATE_FILE_TITLE.text,
        });
        rawTitle =
          (await titleRow?.textContent()) || COLLECTION_ERRORS.DATA_MISSING;
      } catch (error: any) {
        if (error instanceof PwErrors.TimeoutError) {
          rawTitle = COLLECTION_ERRORS.DATA_MISSING;
        }
      }

      try {
        statusRow = await page.locator(this.SIEM_LOCATE_FILE_STATUS.element, {
          hasText: this.SIEM_LOCATE_FILE_STATUS.text,
        });
        rawStatus =
          (await statusRow?.textContent()) || COLLECTION_ERRORS.DATA_MISSING;
      } catch (error: any) {
        if (error instanceof PwErrors.TimeoutError) {
          rawStatus = COLLECTION_ERRORS.DATA_MISSING;
        }
      }

      try {
        locationRow = await page.locator(
          this.SIEM_LOCATE_FILE_LOCATION.element,
          {
            hasText: this.SIEM_LOCATE_FILE_LOCATION.text,
          }
        );
        rawLocation =
          (await locationRow?.textContent()) || COLLECTION_ERRORS.DATA_MISSING;
      } catch (error: any) {
        if (error instanceof PwErrors.TimeoutError) {
          rawLocation = COLLECTION_ERRORS.DATA_MISSING;
        }
      }

      return {
        index: file.index,
        num: file.completeNum || COLLECTION_ERRORS.DATA_MISSING,
        title:
          rawTitle === COLLECTION_ERRORS.DATA_MISSING
            ? COLLECTION_ERRORS.DATA_MISSING
            : rawTitle.slice(12).trim() || COLLECTION_ERRORS.DATA_MISSING,
        prevStatus:
          rawStatus === COLLECTION_ERRORS.DATA_MISSING
            ? COLLECTION_ERRORS.DATA_MISSING
            : rawStatus.slice(18).replace("\n", "").replace("\t", "").trim() ||
              COLLECTION_ERRORS.DATA_MISSING,
        location:
          rawLocation === COLLECTION_ERRORS.DATA_MISSING
            ? COLLECTION_ERRORS.DATA_MISSING
            : rawLocation.slice(15).replace("\n", "").trim() ||
              COLLECTION_ERRORS.DATA_MISSING,
      };
    } catch (error: any) {
      console.log("🚀 ~ FilesScrapperV1 ~ collectData ~ error:", error);
      console.log(
        chalk.cyanBright(" ~ FilesScrapperV1 ~ error:", error.message)
      );
      return {
        index: file.index,
        num: file.completeNum || COLLECTION_ERRORS.NO_DATA_COLLECTED,
        title: COLLECTION_ERRORS.NO_DATA_COLLECTED,
        prevStatus: COLLECTION_ERRORS.NO_DATA_COLLECTED,
        location: COLLECTION_ERRORS.NO_DATA_COLLECTED,
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
      console.log(
        chalk.cyanBright(
          " ~ FilesScrapperV1 ~ error:",
          "context not created - try again"
        )
      );
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

      return { message, detail };
    } catch (error: any) {
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
    if (!this.context) {
      await this.createBrowserContext();
      console.log(
        chalk.cyanBright(
          " ~ FilesScrapperV1 ~ error:",
          "context not created - try again"
        )
      );
      throw new ApiError({
        statusCode: 500,
        message: ERRORS.SERVER_ERROR,
      });
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

      await this.checkSiemLogin({ page, user });
    } catch (error: any) {
      console.log(
        chalk.cyanBright(" ~ FilesScrapperV1 ~ error:", error.message)
      );
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
  }): Promise<void> {
    try {
      await page.waitForURL(`${this.SIEM_SEARCH_FILE_URL}`, {
        waitUntil: "load",
        timeout: this.timeout,
      });
      // check screenshot to see if login was successful
      await page.screenshot({
        fullPage: true,
        path: "./src/tests/integration/login.jpg",
      });

      const checkUser = await page.locator(
        this.AUTH_GRANTED_PAGE_CHECK.element,
        { hasText: user }
      );
      await checkUser.waitFor({ state: "visible", timeout: this.timeout });
    } catch (loginError) {
      if (loginError instanceof PwErrors.TimeoutError) {
        try {
          await page.screenshot({
            fullPage: true,
            path: "./src/tests/integration/login-error.jpg",
          });
          const loginErrorMsg = await page
            .locator(this.AUTH_DENIED_PAGE_MSG.element, {
              hasText: this.AUTH_DENIED_PAGE_MSG.text,
            })
            .textContent({ timeout: this.timeout });

          console.log("🚀 ~ FilesScrapperV1 ~ loginErrorMsg:", loginErrorMsg);
          if (loginErrorMsg) {
            throw new ApiError({
              statusCode: 401,
              message: ERRORS.COULD_NOT_LOGIN_IN_SIEM,
            });
          }
        } catch (getPageDataError) {
          if (getPageDataError instanceof PwErrors.TimeoutError) {
            await page.screenshot({
              fullPage: true,
              path: "./src/tests/integration/login-error.jpg",
            });
            throw getPageDataError;
          }
        }
        throw loginError;
      }
    }
  }
}

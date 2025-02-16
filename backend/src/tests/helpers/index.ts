import fs from "node:fs/promises";
import jwt from "jsonwebtoken";
import { UserAuthData } from "../../models/types";

export function getFakeValidCredentialsCookie() {
  const userId = 1;
  const user = process.env.DATA_TEST_SIEM_USER;
  const pass = process.env.DATA_TEST_SIEM_PASSWORD;
  return jwt.sign(
    {
      userId,
      user,
      pass,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "1m",
    }
  );
}

export function getFakeWrongCredentialsCookie() {
  const userId = 1;
  const user = "asdf";
  const pass = "1234";
  return jwt.sign(
    {
      userId,
      user,
      pass,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "1m",
    }
  );
}

export async function removeLastScreenshotIfExists(path: string) {
  try {
    const lastReportScreenshot = await fs.readFile(path);

    if (lastReportScreenshot) {
      await fs.rm(path);
    }
    return lastReportScreenshot;
  } catch (error: any) {
    console.log("No last screenshot to remove");
    return null;
  }
}

export async function findLastScreenshotIfExists(
  path: string
): Promise<Buffer<ArrayBufferLike> | null> {
  try {
    const lastReportScreenshot = await fs.readFile(path);
    return lastReportScreenshot;
  } catch (error: any) {
    console.log("No last screenshot to remove");
    return null;
  }
}

function parseJwt(token: string) {
  // Split the token and taken the second
  const base64Url = token.split(".")[1];

  // Replace "-" with "+"; "_" with "/"
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

  // Decode the base64 string
  const decoded = Buffer.from(base64, "base64").toString("utf-8");

  // Return the result parsed in JSON
  return JSON.parse(decoded);
}

export function parseCookie(cookieKVString: string): {
  value: UserAuthData;
} {
  const [, cookieValue] = cookieKVString.split("=");
  const parsedValue: UserAuthData = parseJwt(cookieValue);
  return { value: parsedValue };
}

import fs from "node:fs/promises";
import path from "node:path";
import converter from "convert-csv-to-json";
import { Response } from "express";
import { NODE_ENV, COOKIE_DOMAIN } from "../config";

export async function getFilesRawDataFromFile({
  folder,
  fileName,
}: {
  folder: string;
  fileName: string;
}) {
  const fileRawData = await fs.readFile(
    path.join(process.cwd(), folder, fileName),
    "utf8"
  );

  return fileRawData;
}

export async function convertData(rawData: string) {
  const json = converter.fieldDelimiter(",").csvStringToJson(rawData);
  return json;
}

export function setAccessTokenCookie(res: Response, accessToken: string) {
  res.cookie("accessToken", accessToken, {
    secure: NODE_ENV === "production",
    httpOnly: false,
    domain: COOKIE_DOMAIN,
    sameSite: NODE_ENV === "production" ? "none" : "strict",
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
  });
}

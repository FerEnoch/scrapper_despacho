import fs from "node:fs/promises";
import path from "node:path";
import converter from "convert-csv-to-json";
import { Response } from "express";
import { NODE_ENV, REMOTE_DEV_ENV } from "../config";

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
    sameSite: "strict",
    /**
     * ".devtunnels.ms" would be production domain too
     */
    domain: REMOTE_DEV_ENV ? ".devtunnels.ms" : "localhost",
    // maxAge: 24 * 60 * 60 * 1000,
  });
}

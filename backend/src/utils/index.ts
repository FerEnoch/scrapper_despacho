import converter from "convert-csv-to-json";
import { Response } from "express";
import { NODE_ENV } from "../config";

export async function convertData(rawData: string) {
  const json = converter.fieldDelimiter(",").csvStringToJson(rawData);
  return json;
}

export function setAccessTokenCookie(res: Response, accessToken: string) {
  res.cookie("accessToken", accessToken, {
    secure: NODE_ENV === "production",
    httpOnly: false,
    // domain: COOKIE_DOMAIN,
    // sameSite: "lax" by default,
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
  });
}

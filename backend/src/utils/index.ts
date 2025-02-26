import converter from "convert-csv-to-json";
import { Response } from "express";
import { NODE_ENV } from "../config";

export async function convertData(rawData: string) {
  const json = converter.fieldDelimiter(",").csvStringToJson(rawData);
  return json;
}

export function setTokenCookie(
  res: Response,
  {
    tokenKey,
    tokenValue,
    maxAge,
  }: {
    tokenKey: string;
    tokenValue: string;
    maxAge?: number;
  }
) {
  const cookieMaxAge = maxAge ?? 7 * 24 * 60 * 60 * 1000; // 7 days

  res.cookie(tokenKey, tokenValue, {
    maxAge: cookieMaxAge,
    secure: NODE_ENV === "production",
    httpOnly: true,
    /**
     * Cookie sameSite prop should be set to "none" in production mode due to how
     * the backend is served, which happen to send the cookie to the frontend
     * throw a tunnel vpn.
     */
    sameSite: NODE_ENV === "production" ? "none" : "strict",
  });
}

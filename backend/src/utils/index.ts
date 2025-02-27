import converter from "convert-csv-to-json";
import { Response } from "express";
import { NODE_ENV } from "../config";
import { DEFAULT_MAX_AGE_ACCESS_TOKEN_COOKIE } from "../config";

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
  const cookieMaxAge = maxAge ?? DEFAULT_MAX_AGE_ACCESS_TOKEN_COOKIE;

  res.cookie(tokenKey, tokenValue, {
    secure: NODE_ENV === "production",
    httpOnly: true,
    maxAge: cookieMaxAge,
    /**
     * Cookie sameSite prop should be set to "none" in production mode due to how
     * the backend is served, which happen to send the cookie to the frontend
     * throw a tunnel vpn.
     * Needed: allow frontend production domain 3rd party cookies.
     */
    sameSite: NODE_ENV === "production" ? "none" : "strict",
  });
}

export function clearCookie(
  res: Response,
  {
    tokenKey,
    maxAge,
  }: {
    tokenKey: string;
    maxAge?: number;
  }
) {
  const cookieMaxAge = maxAge ?? DEFAULT_MAX_AGE_ACCESS_TOKEN_COOKIE;
  res.clearCookie(tokenKey, {
    secure: NODE_ENV === "production",
    httpOnly: true,
    maxAge: cookieMaxAge,
    /**
     * Cookie sameSite prop should be set to "none" in production mode due to how
     * the backend is served, which happen to send the cookie to the frontend
     * throw a tunnel vpn.
     * Needed: allow frontend production domain 3rd party cookies.
     */
    sameSite: NODE_ENV === "production" ? "none" : "strict",
  });
}

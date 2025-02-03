import { JWT_ACCESS_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN } from "./config";

export function setAccessTokenCookie(res: any, accessToken: string) {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: JWT_ACCESS_EXPIRES_IN,
  });
}

export function setRefreshTokenCookie(res: any, refreshToken: string) {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: JWT_REFRESH_EXPIRES_IN,
  });
}

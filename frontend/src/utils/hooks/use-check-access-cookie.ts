import { ActiveUser } from "@/types";
import { useEffect, useState } from "react";
// import { parseCookie } from "..";

export function useCheckAccessCookie() {
  const [sessionUserInfo, setSessionUserInfo] = useState<ActiveUser | null>(null);

  const checkStorageData = () => {
    // const accessTokenCookieName = "accessToken";
    // const cookies = document.cookie;
    // const cookieKVString = cookies
    //   .split(";")
    //   .find((cookie) => cookie.includes(accessTokenCookieName));

    // return cookieKVString;
    const user = localStorage.getItem("username");
    const pass = localStorage.getItem("password");
    const userId = localStorage.getItem("userId");

    if (!user || !pass || !userId) return null;

    return { userId, username: user, password: pass };
  };

  const clearAccessToken = () => {
    const storageData = checkStorageData();

    if (!storageData?.username) return setSessionUserInfo(null);

    // const updatedCookie = `${accessTokenCookieName}=; expires=${expiryDate}; domain=${COOKIE_DOMAIN}; path=/; sameSite=none`;
    const updatedCookie = `accessToken=; expires=${new Date(
      0
    ).toUTCString()}; path=/`;

    document.cookie = updatedCookie;
    setSessionUserInfo(null);
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    localStorage.removeItem("userId");
  };

  useEffect(() => {
    const storageData = checkStorageData();
    if (!storageData?.username) return setSessionUserInfo(null);

    // const {
    //   value: { userId, user, pass },
    // } = parseCookie(cookieKVString);
    setSessionUserInfo({ ...storageData });
  }, []);

  return {
    clearAccessToken,
    sessionUserInfo,
  };
}

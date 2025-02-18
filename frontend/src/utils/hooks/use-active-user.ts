import { ActiveUser } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { parseCookie } from "..";
import { REMOTE_DEV_ENV } from "@/config";

export const useActiveUser = () => {
  const [cookieUserInfo, setCookieUserInfo] = useState<ActiveUser | null>(null);
  const [activeUser, setActiveUser] = useState<ActiveUser>({
    userId: cookieUserInfo?.userId || "",
    username: cookieUserInfo?.username || "",
    password: cookieUserInfo?.password || "",
  });

  const checkAccessToken = useCallback(() => {
    const accessTokenCookieName = "accessToken";
    const cookies = document.cookie;
    const cookieKVString = cookies
      .split(";")
      .find((cookie) => cookie.includes(accessTokenCookieName));

    return cookieKVString;
  }, []);

  const clearAccessToken = useCallback(() => {
    const cookieKVString = checkAccessToken();

    if (!cookieKVString) return setCookieUserInfo(null);

    const [accessTokenCookieName] = cookieKVString.split("=");
    const expiryDate = new Date(0).toUTCString();

    const updatedCookie = `${accessTokenCookieName}=; expires=${expiryDate}; domain=${
      REMOTE_DEV_ENV ? ".devtunnels.ms" : "localhost"
    }; path=/`;

    document.cookie = updatedCookie;
    setCookieUserInfo(null);
  }, [checkAccessToken]);

  const handleActiveUser = useCallback((userData: ActiveUser) => {
    setActiveUser(userData);
  }, []);

  const logoutAndClearCookie = useCallback(() => {
    clearAccessToken();
    setCookieUserInfo(null);
    setActiveUser({
      userId: "",
      username: "",
      password: "",
    });
  }, [clearAccessToken]);

  useEffect(() => {
    const cookieKVString = checkAccessToken();
    if (!cookieKVString) return setCookieUserInfo(null);

    const {
      value: { userId, user, pass },
    } = parseCookie(cookieKVString);
    setCookieUserInfo({ userId, username: user, password: pass });
  }, [checkAccessToken]);

  useEffect(() => {
    if (!cookieUserInfo) return;
    setActiveUser(cookieUserInfo);
  }, [cookieUserInfo]);

  return { activeUser, handleActiveUser, logoutAndClearCookie };
};

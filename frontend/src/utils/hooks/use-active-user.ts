import { ActiveUser } from "@/types";
import { useEffect, useState } from "react";
import { parseCookie } from "..";
// import { COOKIE_DOMAIN } from "@/config";

export const useActiveUser = () => {
  const [cookieUserInfo, setCookieUserInfo] = useState<ActiveUser | null>(null);
  const [activeUser, setActiveUser] = useState<ActiveUser>({
    userId: cookieUserInfo?.userId || "",
    username: cookieUserInfo?.username || "",
    password: cookieUserInfo?.password || "",
  });

  const checkAccessToken = () => {
    const accessTokenCookieName = "accessToken";
    const cookies = document.cookie;
    const cookieKVString = cookies
      .split(";")
      .find((cookie) => cookie.includes(accessTokenCookieName));

    return cookieKVString;
  };

  const clearAccessToken = () => {
    const cookieKVString = checkAccessToken();

    if (!cookieKVString) return setCookieUserInfo(null);

    const [accessTokenCookieName] = cookieKVString.split("=");
    const expiryDate = new Date(0).toUTCString();

    // const updatedCookie = `${accessTokenCookieName}=; expires=${expiryDate}; domain=${COOKIE_DOMAIN}; path=/; sameSite=none`;
    const updatedCookie = `${accessTokenCookieName}=; expires=${expiryDate}; path=/`;

    document.cookie = updatedCookie;
    setCookieUserInfo(null);
  };

  const handleActiveUser = (userData: ActiveUser) => {
    setActiveUser(userData);
  };

  const logoutAndClearCookie = () => {
    clearAccessToken();
    setCookieUserInfo(null);
    setActiveUser({
      userId: "",
      username: "",
      password: "",
    });
  };

  useEffect(() => {
    const cookieKVString = checkAccessToken();
    if (!cookieKVString) return setCookieUserInfo(null);

    const {
      value: { userId, user, pass },
    } = parseCookie(cookieKVString);
    setCookieUserInfo({ userId, username: user, password: pass });
  }, []);

  useEffect(() => {
    if (!cookieUserInfo) return;
    setActiveUser(cookieUserInfo);
  }, [cookieUserInfo, setActiveUser]);

  return { activeUser, handleActiveUser, logoutAndClearCookie };
};

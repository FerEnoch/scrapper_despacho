import { ActiveUser } from "@/types";
import { useEffect, useState } from "react";
import { useCheckAccessCookie } from "./use-check-access-cookie";
// import { COOKIE_DOMAIN } from "@/config";

export const useActiveUser = () => {
  const { sessionUserInfo, clearAccessToken } = useCheckAccessCookie();
  const [activeUser, setActiveUser] = useState<ActiveUser | null>(() => {
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");
    if (!userId || !username || !password) return null;
    return {
      userId,
      username,
      password,
    };
  });

  const handleActiveUser = (userData: ActiveUser) => {
    const { userId, username, password } = userData;

    localStorage.setItem("username", username);
    localStorage.setItem("password", password);
    localStorage.setItem("userId", userId);

    setActiveUser({
      userId,
      username,
      password,
    });
  };

  const logoutAndClearCookie = () => {
    clearAccessToken();
    setActiveUser({
      userId: "",
      username: "",
      password: "",
    });
  };

  useEffect(() => {
    if (!sessionUserInfo?.username) return;
    setActiveUser(sessionUserInfo);
  }, [sessionUserInfo, setActiveUser]);

  return { activeUser, handleActiveUser, logoutAndClearCookie };
};

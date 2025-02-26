import { authApi } from "@/api/authApi";
import { ActiveUserInfo, ApiResponse, UserSessionData } from "@/types";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { UserContext } from "./user-context";
import { AUTH_API_ERRORS, AUTH_API_MESSAGES } from "@/types/enums";

export function UserContextProvider({ children }: { children: ReactNode }) {
  const [userSession, setUserSession] = useState<ActiveUserInfo | null>(null);

  const handleRevalidateAccessToken = useCallback(async () => {
    if (!userSession) return null;

    const { message: revalidateTokenMessage, data: revalidateTokenData } =
      await authApi.revalidateAccessToken(userSession);
    console.log("🚀 ~ revalidateTokenMessage:", revalidateTokenMessage);

    if (revalidateTokenMessage === AUTH_API_MESSAGES.USER_SESSION_ACTIVE) {
      const [userData] = revalidateTokenData || [];
      const { userId, user, pass } = userData;
      return { userId, username: user, password: pass };
    }
    return null;
  }, [userSession]);

  const handleActiveUser = useCallback((userData: ActiveUserInfo | null) => {
    if (!userData) {
      window.localStorage.removeItem("userId");
      setUserSession(null);
      return;
    }
    const { userId } = userData;
    window.localStorage.setItem("userId", userId);
    setUserSession(userData);
  }, []);

  const getUserSession = useCallback(async () => {
    const activeId = window.localStorage.getItem("userId");
    if (!activeId) return null;

    const { message, data } = (await authApi.getUserById({
      userId: activeId,
    })) as ApiResponse<UserSessionData>;

    console.log("🚀 ~ getUserSession ~ message:", message);

    switch (message) {
      case AUTH_API_MESSAGES.USER_SESSION_ACTIVE:
        /* eslint-disable no-case-declarations */
        const [userData] = data || [];
        const { userId, user, pass } = userData;
        return { userId, username: user, password: pass };
      case AUTH_API_ERRORS.ACCESS_TOKEN_EXPIRED:
        return await handleRevalidateAccessToken();
      case AUTH_API_ERRORS.REFRESH_TOKEN_EXPIRED:
        return null;
      case AUTH_API_ERRORS.RESOURCE_NOT_FOUND:
        return null;
      default:
        return null;
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  useEffect(() => {
    getUserSession().then((userData) => {
      handleActiveUser(userData);
    });
  }, [getUserSession, handleActiveUser]);

  return (
    <UserContext.Provider
      value={{
        activeUserSession: userSession,
        handleActiveUser,
        handleRevalidateAccessToken,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

import { useContext } from "react";
import { UserContext } from "../context/user-context";

/**
 * @description This hook is a proxy to the user session context.
 */
export function useUserSession() {
  const userSessionContext = useContext(UserContext);

  if (!userSessionContext) {
    return {
      activeUser: null,
      handleActiveUser: () => {},
      handleRevalidateAccessToken: () => Promise.resolve(null),
    };
  }

  const { activeUserSession, handleActiveUser, handleRevalidateAccessToken } =
    userSessionContext;

  return {
    activeUser: activeUserSession,
    handleActiveUser,
    handleRevalidateAccessToken,
  };
}

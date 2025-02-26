import { ActiveUserInfo } from "@/types";
import { createContext } from "react";

type ContextType = {
  activeUserSession: ActiveUserInfo | null;
  handleActiveUser: (userData: ActiveUserInfo | null) => void;
  handleRevalidateAccessToken: () => Promise<ActiveUserInfo | null>;
};

export const UserContext = createContext<ContextType | null>(null);

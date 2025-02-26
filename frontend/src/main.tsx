import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { UserContextProvider } from "./utils/context/user-context-provider.tsx";

createRoot(document.getElementById("root")!).render(
  <UserContextProvider>
    <App />
  </UserContextProvider>
);

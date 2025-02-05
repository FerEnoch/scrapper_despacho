import path from "node:path";
import { loadEnvFile } from "node:process";

try {
  const envFilePath = path.resolve(process.cwd(), ".env");
  loadEnvFile(envFilePath);
} catch (error) {
  console.log("🚀 ~ error:", error);
}

const {
  NODE_ENV = "development",
  VITE_SIEM_BASE_URL = "",
  LOGIN_PATH = "",
  VITE_FILE_STATS_PATH = "",
  SIEM_USER = "",
  SIEM_PASSWORD = "",
  API_PORT = NODE_ENV === "production" ? 3000 : 3001,
} = process.env;

export {
  VITE_SIEM_BASE_URL as SIEM_BASE_URL,
  LOGIN_PATH,
  VITE_FILE_STATS_PATH as FILE_STATS_PATH,
  SIEM_USER,
  SIEM_PASSWORD,
  API_PORT,
};

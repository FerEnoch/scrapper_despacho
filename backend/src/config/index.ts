import path from "node:path";
import { loadEnvFile } from "node:process";

const envFilePath = path.resolve(process.cwd(), "../.env");
loadEnvFile(envFilePath);

const {
  VITE_SIEM_BASE_URL = "",
  LOGIN_PATH = "",
  VITE_FILE_STATS_PATH = "",
  SIEM_USER = "",
  SIEM_PASSWORD = "",
  PORT = 3000,
} = process.env;

export {
  VITE_SIEM_BASE_URL as SIEM_BASE_URL,
  LOGIN_PATH,
  VITE_FILE_STATS_PATH as FILE_STATS_PATH,
  SIEM_USER,
  SIEM_PASSWORD,
  PORT,
};

import path from "node:path";
import { loadEnvFile } from "node:process";
import { Secret } from "jsonwebtoken";
import { config } from "dotenv";

try {
  const envFilePath = path.resolve(process.cwd(), ".env");
  loadEnvFile(envFilePath);
} catch (error) {
  config();
}

const {
  NODE_ENV = "development",
  VITE_SIEM_BASE_URL = "",
  LOGIN_PATH = "",
  VITE_FILE_STATS_PATH = "",
  SIEM_USER = "",
  SIEM_PASSWORD = "",
  API_PORT = NODE_ENV === "production" ? 3000 : 3001,
  JWT_SECRET = "" as Secret,
  JWT_ACCESS_EXPIRES_IN = "1h",
  JWT_REFRESH_EXPIRES_IN = "1d",
  BCYPT_SALT_DEV = 1,
  BCYPT_SALT_PROD = 10,
} = process.env;

const BCRYPT_SALT_ROUNDS =
  NODE_ENV === "production" ? BCYPT_SALT_PROD : BCYPT_SALT_DEV;

export {
  NODE_ENV,
  VITE_SIEM_BASE_URL as SIEM_BASE_URL,
  LOGIN_PATH,
  VITE_FILE_STATS_PATH as FILE_STATS_PATH,
  SIEM_USER,
  SIEM_PASSWORD,
  API_PORT,
  JWT_SECRET,
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  BCRYPT_SALT_ROUNDS,
};

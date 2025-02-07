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
  SIEM_USER = "",
  SIEM_PASSWORD = "",
  PORT,
  JWT_SECRET = "" as Secret,
  JWT_ACCESS_EXPIRES_IN = "5m",
  JWT_REFRESH_EXPIRES_IN = "1h",
  BCYPT_SALT_DEV = 1,
  BCYPT_SALT_PROD = 10,
} = process.env;

const BCRYPT_SALT_ROUNDS =
  NODE_ENV === "production" ? BCYPT_SALT_PROD : BCYPT_SALT_DEV;

const API_PORT = NODE_ENV === "production" ? PORT : 3001;

export {
  NODE_ENV,
  SIEM_USER,
  SIEM_PASSWORD,
  API_PORT,
  JWT_SECRET,
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  BCRYPT_SALT_ROUNDS,
};

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
  REMOTE_FLAG = "0",
  LAST_PROD_VERSION = "1",
  PROD_PORT,
  DEV_PORT,
  JWT_SECRET = "" as Secret,
  JWT_ACCESS_EXPIRES_IN = "5m",
  JWT_REFRESH_EXPIRES_IN = "1h",
  BCYPT_SALT_DEV = 1,
  BCYPT_SALT_PROD = 10,
  STANDARD_SCRAPPER_TIMEOUT_PROD_IN_SS = "5",
  DEV_DOMAIN_REMOTE = "",
  DEV_DOMAIN_LOCAL = "",
  DEV_PROD_DOMAIN_REMOTE_FRONTEND = "",
  PROD_DOMAIN_FRONTEND = "",
  COOKIE_DOMAIN_DEV_LOCAL = "localhost",
  COOKIE_DOMAIN_DEV_REMOTE = ".devtunnels.ms",
  COOKIE_DOMAIN_PROD = "",
} = process.env;

const CURRENT_PROD_VERSION = Number(LAST_PROD_VERSION);

const BCRYPT_SALT_ROUNDS =
  NODE_ENV === "development" ? BCYPT_SALT_DEV : BCYPT_SALT_PROD;

const API_PORT = NODE_ENV === "development" ? DEV_PORT : PROD_PORT;

const COOKIE_DOMAIN =
  NODE_ENV === "development"
    ? Number(REMOTE_FLAG)
      ? COOKIE_DOMAIN_DEV_REMOTE
      : COOKIE_DOMAIN_DEV_LOCAL
    : COOKIE_DOMAIN_PROD;

const SCRAPPER_TIMEOUT =
  NODE_ENV === "test"
    ? 5 * 1000
    : parseInt(STANDARD_SCRAPPER_TIMEOUT_PROD_IN_SS) * 1000;

const CORS_ORIGINS = [
  DEV_DOMAIN_REMOTE,
  DEV_DOMAIN_LOCAL,
  DEV_PROD_DOMAIN_REMOTE_FRONTEND,
  PROD_DOMAIN_FRONTEND,
];

export {
  CURRENT_PROD_VERSION,
  NODE_ENV,
  COOKIE_DOMAIN,
  SCRAPPER_TIMEOUT,
  API_PORT,
  JWT_SECRET,
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  BCRYPT_SALT_ROUNDS,
  CORS_ORIGINS,
};

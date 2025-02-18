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
  REMOTE_FLAG = "1",
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
} = process.env;

const CURRENT_PROD_VERSION = Number(LAST_PROD_VERSION);

const BCRYPT_SALT_ROUNDS =
  NODE_ENV === "production" ? BCYPT_SALT_PROD : BCYPT_SALT_DEV;

const API_PORT = NODE_ENV === "production" ? PROD_PORT : DEV_PORT;

const COOKIE_DOMAIN =
  NODE_ENV === "development"
    ? Number(REMOTE_FLAG)
      ? ".devtunnels.ms"
      : "localhost"
    : PROD_DOMAIN_FRONTEND;

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

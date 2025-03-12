const {
  VITE_DEV_API_URL_LOCAL,
  VITE_DEV_API_URL_REMOTE,
  VITE_REMOTE_FLAG = "0",
  VITE_PROD_API_URL = "",
} = import.meta.env;

const NODE_ENV = import.meta.env.PROD ? "production" : "development";

const SIEM_BASE_URL = "https://siem.santafeciudad.gov.ar";
const FILE_STATS_PATH = "/expediente_ver.php?id=";

const SIEM_FILE_STATS_URL = `${SIEM_BASE_URL}${FILE_STATS_PATH}`;

const API_BASE_URL =
  NODE_ENV === "development"
    ? Number(VITE_REMOTE_FLAG)
      ? VITE_DEV_API_URL_REMOTE
      : VITE_DEV_API_URL_LOCAL
    : VITE_PROD_API_URL;

export { API_BASE_URL, SIEM_FILE_STATS_URL };

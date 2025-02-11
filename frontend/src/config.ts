const {
  VITE_API_BASE_URL_LOCAL,
  VITE_API_BASE_URL_REMOTE,
  VITE_REMOTE_FLAG = 0,
} = import.meta.env;

const VITE_SIEM_BASE_URL = "https://siem.santafeciudad.gov.ar";
const VITE_FILE_STATS_PATH = "/expediente_ver.php?id=";

const SIEM_FILE_STATS_URL = `${VITE_SIEM_BASE_URL}${VITE_FILE_STATS_PATH}`;

const API_BASE_URL = Number(VITE_REMOTE_FLAG)
  ? VITE_API_BASE_URL_REMOTE
  : VITE_API_BASE_URL_LOCAL;

console.log("🚀 ~ API_BASE_URL:", API_BASE_URL);

export { API_BASE_URL, SIEM_FILE_STATS_URL };

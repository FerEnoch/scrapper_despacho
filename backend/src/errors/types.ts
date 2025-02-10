enum ERRORS {
  SERVER_ERROR = "SERVER_ERROR",
  NO_FILE_TO_UPLOAD = "NO_FILE_TO_UPLOAD",
  NO_FILES_TO_END = "NO_FILES_TO_END",
  INVALID_DATA = "INVALID_DATA",
  INVALID_FILE = "INVALID_FILE",
  NOT_FOUND = "RESOURCE_NOT_FOUND",
  COULD_NOT_LOGIN_IN_SIEM = "COULD_NOT_LOGIN_IN_SIEM",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  NO_FILES_ENDED = "NO_FILES_ENDED",
  NO_FILE_STATS_RETRIEVED = "NO_FILE_STATS_RETRIEVED",
  DB_TRANSACTION_FAILURE = "DB_TRANSACTION_FAILURE",
  INVALID_TOKEN = "INVALID_TOKEN",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_MISSING_ACCESS_DENIED = "TOKEN_MISSING_ACCESS_DENIED",
  CREDENTIALS_NOT_PROVIDED = "CREDENTIALS_NOT_PROVIDED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  TOKEN_GENERATION_FAILED = "TOKEN_GENERATION_FAILED",
  REFRESH_TOKEN_SAVE_FAILED = "REFRESH_TOKEN_SAVE_FAILED",
  REFRESH_TOKEN_NOT_FOUND = "REFRESH_TOKEN_NOT_FOUND",
}

export { ERRORS };

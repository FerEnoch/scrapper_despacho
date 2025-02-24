enum FILES_API_ERRORS {
  SERVER_ERROR = "SERVER_ERROR",
  NO_FILE_TO_UPLOAD = "NO_FILE_TO_UPLOAD",
  NO_FILES_TO_END = "NO_FILES_TO_END",
  NOT_FOUND = "NOT_FOUND",
  INVALID_DATA = "INVALID_DATA",
  INVALID_FILE = "INVALID_FILE",
  NO_FILES_ENDED = "NO_FILES_ENDED",
  NO_FILE_STATS_RETRIEVED = "NO_FILE_STATS_RETRIEVED",
  CREDENTIALS_NOT_PROVIDED = "CREDENTIALS_NOT_PROVIDED",
  UNAUTHORIZED = "UNAUTHORIZED",
  TOKEN_MISSING_ACCESS_DENIED = "TOKEN_MISSING_ACCESS_DENIED",
  COULD_NOT_LOGIN_IN_SIEM = "COULD_NOT_LOGIN_IN_SIEM",
  GENERIC_ERROR = "GENERIC_ERROR",
}

enum AUTH_API_ERRORS {
  SERVER_ERROR = "SERVER_ERROR",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  COULD_NOT_LOGIN_IN_SIEM = "COULD_NOT_LOGIN_IN_SIEM",
  NOT_FOUND = "NOT_FOUND",
  REFRESH_TOKEN_NOT_FOUND = "REFRESH_TOKEN_NOT_FOUND",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  UNAUTHORIZED = "UNAUTHORIZED",
  LOGOUT_FAILED = "LOGOUT_FAILED",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  GENERIC_ERROR = "GENERIC_ERROR",
}

enum AUTH_API_MESSAGES {
  USER_REGISTERED = "USER_REGISTERED",
  USER_LOGGED_IN = "USER_LOGGED_IN",
  USER_CREDENTIALS_UPDATED = "USER_CREDENTIALS_UPDATED",
  USER_LOGGED_OUT = "USER_LOGGED_OUT",
}

enum FILES_API_MESSAGES {
  FILES_STATS_RETRIEVED = "FILES_STATS_RETRIEVED",
  FILES_ENDED = "FILES_ENDED",
  FILE_UPLOADED = "FILE_UPLOADED",
}

enum FILE_EXPORT_STATS {
  NUMBER = "Número",
  TITLE = "Carátula",
  STATUS = "Estado",
  LOCATION = "Ubicación",
}

export {
  FILES_API_ERRORS,
  FILES_API_MESSAGES,
  AUTH_API_ERRORS,
  AUTH_API_MESSAGES,
  FILE_EXPORT_STATS,
};

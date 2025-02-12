const SIEM_PAGE_DATA = {
  END_FILE_TEXT: "Finalizar",
  ENDED_FILE_STATUS_TEXT: "FINALIZADO",
  SIEM_BASE_URL: "https://siem.santafeciudad.gov.ar",
  SIEM_LOGIN_PATH: "/login.php",
  SIEM_SEARCH_FILE_PATH: "/expediente_ver.php?id=",
  AUTH_GRANTED_PAGE_CHECK: {
    // NOT WORKING
    element: "src",
    text: "templates/imgs/top2_usr.png",
  },
  AUTH_DENIED_PAGE_TITLE: {
    element: "h2",
    text: "ERROR",
  },
  AUTH_DENIED_PAGE_MSG: {
    element: "h3",
    text: "Falló la autenticación en SIMGEI.",
  },
  SIEM_LOCATE_FILE_TITLE: {
    element: "tr",
    text: "Carátula:",
  },
  SIEM_LOCATE_FILE_STATUS: {
    element: "tr",
    text: "Estado:",
  },
  SIEM_LOCATE_FILE_LOCATION: {
    element: "tr",
    text: "Ubicado en:",
  },
};

const FILE_NUMBER_COLUMN_VALID_NAME = "Número";

const VALIDATION_REGEX = {
  FILE_NUMBER_COLUMN: /^\w{2}-\d{4}-\d{7,9}-\d+ \(\w{1,2}\)$/,
  FILE_NUMBER_COLUMN_NO_LETTERS: /^\w{2}-\d{4}-\d{7,9}-\d+$/,
};

const COLLECTION_ERRORS = {
  DATA_MISSING: "Sin datos",
  NO_DATA_COLLECTED: "NO_DATA_COLLECTED",
  COULD_NOT_END_FILE_MESSAGE: "COULD_NOT_END_FILE_MESSAGE",
  COULD_NOT_END_FILE_DETAIL: "COULD_NOT_END_FILE_DETAIL",
};

export {
  COLLECTION_ERRORS,
  SIEM_PAGE_DATA,
  FILE_NUMBER_COLUMN_VALID_NAME,
  VALIDATION_REGEX,
};

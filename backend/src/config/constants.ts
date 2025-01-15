const FILE_NUMBER_COLUMN_VALID_NAME = "Número";
const FILE_NUMBER_COLUMN_VALIDATION_REGEX =
  /^\w{2}-\d{4}-\d{7,9}-\d+ \(\w{1,2}\)$/;
const FILE_NUMBER_COLUMN_VALIDATION_REGEX_NO_LETTERS =
  /^\w{2}-\d{4}-\d{7,9}-\d+$/;

enum UPLOADS_FOLDER {
  FOLDER = "uploads",
  FILES_CSV = "files.csv",
}

const NO_RESULTS_GENERIC_MSG = "Sin datos";
const ERROR_NO_FILES_ENDED =
  "Error al procesar la finalización de los archivos";
const ERROR_NO_FILE_STATS_RETRIEVED = "Error al buscar datos de los archivos";

export {
  UPLOADS_FOLDER,
  FILE_NUMBER_COLUMN_VALID_NAME,
  FILE_NUMBER_COLUMN_VALIDATION_REGEX,
  FILE_NUMBER_COLUMN_VALIDATION_REGEX_NO_LETTERS,
  NO_RESULTS_GENERIC_MSG,
  ERROR_NO_FILES_ENDED,
  ERROR_NO_FILE_STATS_RETRIEVED,
};

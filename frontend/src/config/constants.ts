const INVALID_DATA_ERROR_MSG = `No se pudieron recuperar los datos. Revisa que la columna de número de expediente sea 'Número", y que el formato de números sea el mismo para cada expediente, por ejemplo: DE-0963-01656388-4 (NI).`;
const NO_FILES_TO_END_ERROR_MSG = `No se encontraron archivos en curso para finalizar.`;

const API_ERROR_MSG =
  "Ocurrió un error al analizar los archivos, por favor intenta con otro. No cargues archivos que contengan más de 50 expedientes";

const CARD_TEXT = `Carga un archivo .csv que contenga una columna "Número" con el número completo de expediente SIEM. Podrás visualizar su estado actual y finalizar su tramitación.`;

export {
  INVALID_DATA_ERROR_MSG,
  NO_FILES_TO_END_ERROR_MSG,
  API_ERROR_MSG,
  CARD_TEXT,
};

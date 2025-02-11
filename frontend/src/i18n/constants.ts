import { API_ERRORS } from "@/types";

type uiErrorMessages = Record<keyof typeof API_ERRORS, string>;

const UI_ERROR_MESSAGES: uiErrorMessages = {
  [API_ERRORS.SERVER_ERROR]:
    "Ocurrió un error al analizar los archivos, por favor intenta con otro. No cargues archivos que contengan más de 50 expedientes",
  [API_ERRORS.INVALID_FILE]: `No se cargó el archivo. Por favor, intenta nuevamente.`,
  [API_ERRORS.INVALID_DATA]: `No se pudieron recuperar los datos. Revisa que la columna de número de expediente sea 'Número", y que el formato de números sea el mismo para cada expediente, por ejemplo: DE-0963-01656388-4 (NI).`,
  [API_ERRORS.NO_FILE_TO_UPLOAD]:
    "No se cargó el archivo. Por favor, intenta nuevamente.",
  [API_ERRORS.NO_FILES_TO_END]: `No se encontraron expediente en curso para finalizar.`,
  [API_ERRORS.NOT_FOUND]: `No se encontraron expediente en curso para finalizar.`,
  [API_ERRORS.NO_FILES_ENDED]: `No se encontraron expediente en curso para finalizar.`,
  [API_ERRORS.NO_FILE_STATS_RETRIEVED]: `No se encontraron datos de expedientes.`,
  [API_ERRORS.GENERIC_ERROR]: `Ocurrió un error. Por favor, intenta nuevamente.`,
  [API_ERRORS.UNAUTHORIZED]: `Necesitas iniciar sesión para finalizar los expedientes.`,
} as const;

const UI_MODAL_MESSAGES = {
  ERROR_MODAL: {
    FILES_ERROR: {
      dialogTitle: "Error en los expedientes",
      actionButton: "Continuar",
    },
    AUTH_ERROR: {
      dialogTitle: "Error de autenticación",
      actionButton: "Iniciar sesión",
    },
  },
  LOGIN: {
    dialogTitle: "Usa tus credenciales de SIEM",
    actionButton: "Iniciar sesión",
  }
} as const;

const CARD_TEXTS = {
  title: "Santa Fe Hábitat - Depto. Admin. y Despacho",
  body: `Carga un archivo .csv que contenga una columna "Número" con el número completo de expediente SIEM. Podrás visualizar su estado actual y finalizar su tramitación.`,
};

export { UI_ERROR_MESSAGES, UI_MODAL_MESSAGES, CARD_TEXTS };

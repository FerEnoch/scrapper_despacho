import { FILES_API_ERRORS } from "@/types/enums";

export const UI_ERROR_MESSAGES = {
  [FILES_API_ERRORS.SERVER_ERROR]:
    "Ocurrió un error al analizar los archivos. Por favor, intenta nuevamente.",
  [FILES_API_ERRORS.INVALID_FILE]: `No se cargó el archivo. Por favor, intenta nuevamente.`,
  [FILES_API_ERRORS.INVALID_DATA]: `No se pudieron recuperar los datos. Revisa que la columna de número de expediente sea 'Número", y que el formato de números sea el mismo para cada expediente, por ejemplo: DE-0963-01656388-4 (NI).`,
  [FILES_API_ERRORS.NO_FILE_TO_UPLOAD]:
    "No se cargó el archivo. Por favor, intenta nuevamente.",
  [FILES_API_ERRORS.NO_FILES_TO_END]: `No se encontraron expediente en curso para finalizar.`,
  [FILES_API_ERRORS.NOT_FOUND]: `No se encontraron expediente en curso para finalizar.`,
  [FILES_API_ERRORS.NO_FILES_ENDED]: `No se encontraron expediente en curso para finalizar.`,
  [FILES_API_ERRORS.NO_FILE_STATS_RETRIEVED]: `No se encontraron datos de expedientes.`,
  [FILES_API_ERRORS.GENERIC_ERROR]: `Ocurrió un error. Por favor, intenta nuevamente.`,
  [FILES_API_ERRORS.CREDENTIALS_NOT_PROVIDED]: `Tu sesión ha expirado. Por favor vuelve a iniciar sesión`,
  [FILES_API_ERRORS.UNAUTHORIZED]: `Necesitas iniciar sesión para finalizar los expedientes.`,
  [FILES_API_ERRORS.TOKEN_MISSING_ACCESS_DENIED]: `Necesitas iniciar sesión para finalizar los expedientes.`,
  [FILES_API_ERRORS.COULD_NOT_LOGIN_IN_SIEM]: `No se pudo iniciar sesión en SIEM. Por favor revisa tus credenciales de usuario y vuelve a intentarlo.`,
} as const;

export const UI_MODAL_MESSAGES = {
  ERROR_MODAL: {
    FILES_ERROR: {
      dialogTitle: "Ocurrió un error al intentar enviar los expedientes",
      actionButton: "Continuar",
    },
    AUTH_ERROR: {
      dialogTitle: "Se necesita autenticación",
      actionButton: "Iniciar sesión",
    },
  },
  LOGIN: {
    dialogTitle: "Usa tus credenciales de SIEM",
    actionButton: "Iniciar sesión",
  },
  UPDATE_CREDENTIALS: {
    dialogTitle: "Actualiza tus credenciales de SIEM",
    actionButton: "Actualizar",
  },
} as const;

export const UI_TOAST_MESSAGES = {
  LOGIN_SUCCESS: {
    title: "Sesión iniciada",
    description: "¡Bienvenido! Ahora puedes finalizar expedientes",
  },
  LOGIN_ERROR: {
    title: "Error de autenticación",
    description: "No se pudo iniciar sesión. Por favor, intenta nuevamente.",
  },
  LOGIN_NEEDED: {
    title: "Necesitas iniciar sesión",
    description: "Inicia sesión nuevamente para poder continuar",
  },
  LOGOUT_SUCCESS: {
    title: "Sesión cerrada",
    description: "¡Has cerrado sesión con éxito!",
  },
  LOGOUT_ERROR: {
    title: "El cierre de sesión no fue exitoso",
    description: "Por favor, recarga la página para volver a iniciar sesión",
  },
  CREDENTIALS_UPDATED_SUCCESS: {
    title: "Credenciales actualizadas",
    description: "Tus credenciales se han actualizado correctamente",
  },
  NO_FILES_TO_END: {
    title: "No hay expedientes seleccionados",
    description: "Selecciona expedientes para poder finalizarlos",
  },
  FILE_UPLOADED: {
    title: "¡Archivo cargado correctamente!",
    description: (filesLength: number) => `${filesLength} expedientes cargados`,
  },
  GENERIC_ERROR: {
    title: "Error",
    description:
      "Ocurrió un error en el sistema. Por favor, intenta nuevamente.",
  },
} as const;

export const CARD_TEXTS = {
  title: "Santa Fe Hábitat - Depto. Admin. y Despacho",
  body: `Carga un archivo .csv que contenga una columna "Número" con el número completo de expediente SIEM. Podrás visualizar su estado actual y finalizar su tramitación.`,
} as const;

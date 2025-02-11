import { RowData } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, value: FileStats | undefined | null) => void;
  }
}

export type RawFile = {
  Número?: string;
  completeNum?: string;
  org?: string;
  rep?: string;
  num?: string;
  digv?: string;
  [key: string]: string | undefined; // Other properties are not important
};

export type FileStats = {
  num: string;
  title: string;
  prevStatus: string;
  location: string;
  newStatus?: {
    status?: string;
    message?: string;
    detail?: string;
  };
};

export type ApiResponseStats<T> = {
  message: string;
  data?: T[];
};

enum API_ERRORS {
  SERVER_ERROR = "SERVER_ERROR",
  NO_FILE_TO_UPLOAD = "NO_FILE_TO_UPLOAD",
  NO_FILES_TO_END = "NO_FILES_TO_END",
  NOT_FOUND = "NOT_FOUND",
  INVALID_DATA = "INVALID_DATA",
  INVALID_FILE = "INVALID_FILE",
  NO_FILES_ENDED = "NO_FILES_ENDED",
  NO_FILE_STATS_RETRIEVED = "NO_FILE_STATS_RETRIEVED",
  UNAUTHORIZED = "UNAUTHORIZED",
  GENERIC_ERROR = "GENERIC_ERROR",
}

enum API_MESSAGES {
  FILES_STATS_RETRIEVED = "FILES_STATS_RETRIEVED",
  FILES_ENDED = "FILES_ENDED",
  FILE_UPLOADED = "FILE_UPLOADED",
}

enum FILE_EXPORT_STATS {
  NUMBER = "Número",
  TITLE = "Título",
  STATUS = "Estado",
  LOCATION = "Ubicación",
}

export { API_ERRORS, API_MESSAGES, FILE_EXPORT_STATS };

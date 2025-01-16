import { RowData } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, value: FileStats) => void;
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

export enum ERRORS {
  API_ERROR = "API_ERROR",
  INVALID_DATA = "Invalid raw data",
  NO_FILES_TO_END = "No files to end",
}

export enum FILE_EXPORT_STATS {
  NUMBER = "Número",
  TITLE = "Título",
  STATUS = "Estado",
  LOCATION = "Ubicación",
}

/* eslint-disable @typescript-eslint/no-unused-vars */
import { RowData } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, value: FileStats) => void;
  }
}

export type RawFile = {
  Número: string;
  [key: string]: string; // Other properties are not important
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
}

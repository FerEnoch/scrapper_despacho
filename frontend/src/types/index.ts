import { RowData } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  interface TableMeta<TData extends RowData> {
    updateData: (
      apiResponse: ApiResponse<FileStats>,
      selectedNum: string
    ) => void;
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

export type ApiResponse<T> = {
  message: string;
  data?: T[];
};

export type UserSessionData = {
  userId: string;
  user: string;
  pass: string;
};

export type ActiveUserInfo = {
  userId: string;
  username: string;
  password: string;
};

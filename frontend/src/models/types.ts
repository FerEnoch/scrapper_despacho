export type RawFile = {
  Número: string;
  [key: string]: string; // Other properties are not important
};

export type FileStats = {
  num: string;
  title: string;
  prevStatus: string;
  location: string;
};

export type FileEndedStats = {
  num: string;
  location: string;
  title: string;
  prevStatus: string;
  newStatus: {
    status: string;
    message: string;
    detail: string;
  };
};

export type ApiResponseStats<T> = {
  message: string;
  data?: T[];
};

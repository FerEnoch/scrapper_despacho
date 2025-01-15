export type RawFile = {
  Número: string;
  [key: string]: string | undefined; // Other properties are optional
};

export type FileId = {
  num: string;
  org?: string;
  rep?: string;
  digv?: string;
  completeNum?: string;
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

export type FileStats = {
  num: string;
  title: string;
  prevStatus: string;
  location: string;
};

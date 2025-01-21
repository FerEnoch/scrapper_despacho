import { FileEndedStats, FileId, FileStats } from "../models/types";
import { modelTypes } from "../types";

export interface IFilesService {
  model: modelTypes;
  searchFilesStats(files: FileId[]): Promise<FileStats[]>;
  endFiles({ files }: { files: FileStats[] }): Promise<FileEndedStats[]>;
}

import { promises as fs } from "fs";
import path from "node:path";
import converter from "convert-csv-to-json";
import { RawFile, FileId, FileStats } from "../types";
import {
  FILE_NUMBER_COLUMN_VALID_NAME,
  FILE_NUMBER_COLUMN_VALIDATION_REGEX,
  FILE_NUMBER_COLUMN_VALIDATION_REGEX_NO_LETTERS,
} from "../config/constants";

const validateRawData = (
  files: RawFile[],
  withLetters: boolean | undefined
) => {
  const validationRegex = withLetters
    ? FILE_NUMBER_COLUMN_VALIDATION_REGEX
    : FILE_NUMBER_COLUMN_VALIDATION_REGEX_NO_LETTERS;
  return files.every((item) => {
    // Check if 'Número' property exists and matches the regex
    return (
      FILE_NUMBER_COLUMN_VALID_NAME in item &&
      validationRegex.test(item[FILE_NUMBER_COLUMN_VALID_NAME].trim())
    );
  });
};

const getInvalidFiles = (
  files: RawFile[],
  withLetters: boolean | undefined
) => {
  return files.filter((file) => !validateRawData([file], withLetters));
};

const rawFileParser = (files: RawFile[]): FileId[] => {
  return files.map((file) => {
    const { Número: completeNum = "" } = file;
    const [org = "", rep = "", num = "", digv = ""] = completeNum.split("-");

    return {
      completeNum: completeNum.split(" ")[0],
      org,
      rep,
      num,
      digv: digv.split("")[0],
    };
  });
};

export async function parseRawFiles(
  files: RawFile[],
  withLetters: boolean = true
): Promise<{ ok: boolean; parsedData: FileId[] | RawFile[] }> {
  const isValid = validateRawData(files, withLetters);
  if (!isValid) {
    const invalidFiles = getInvalidFiles(files, withLetters)

    return Promise.resolve({
      ok: isValid,
      parsedData: rawFileParser(invalidFiles),
    });
  }

  return Promise.resolve({
    ok: isValid,
    parsedData: rawFileParser(files),
  });
}

export function parseFileStats(files: FileStats[]): FileId[] {
  return files.map((file) => {
    const { num: completeNum, title, prevStatus, location } = file;
    const [org, rep, num, digv] = completeNum.split("-");

    return {
      completeNum: completeNum.split(" ")[0],
      org,
      rep,
      num,
      digv: digv.split("")[0],
    };
  });
}

export async function getFilesRawDataFromFile({
  folder,
  fileName,
}: {
  folder: string;
  fileName: string;
}) {
  const fileRawData = await fs.readFile(
    path.join(process.cwd(), folder, fileName),
    "utf8"
  );

  return fileRawData;
}

export async function convertToJson(rawData: string) {
  const json = converter.fieldDelimiter(",").csvStringToJson(rawData);
  return json;
}

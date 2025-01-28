import { promises as fs } from "fs";
import path from "node:path";
import converter from "convert-csv-to-json";
import {
  FILE_NUMBER_COLUMN_VALID_NAME,
  VALIDATION_REGEX,
} from "../../controllers/constants";
import { FileId, FileStats, RawFile } from "../types";

function removeKVQuotes(file: RawFile) {
  const removeQuotesByRegex = (str: string) => str.replace(/['"]+/g, "");
  return Object.entries(file).reduce((acc, [key, value = ""]) => {
    const newKey = removeQuotesByRegex(key);
    const newValue = removeQuotesByRegex(value);
    acc[newKey] = newValue;
    return acc;
  }, {} as RawFile);
}

const validateRawData = (files: RawFile[], withLetters: boolean) => {
  const validationRegex = withLetters
    ? VALIDATION_REGEX.FILE_NUMBER_COLUMN
    : VALIDATION_REGEX.FILE_NUMBER_COLUMN_NO_LETTERS;

  return files.every((file) => {
    const newFile = removeKVQuotes(file);
    // Check if 'Número' property exists and matches the regex
    return (
      FILE_NUMBER_COLUMN_VALID_NAME in newFile &&
      validationRegex.test(newFile[FILE_NUMBER_COLUMN_VALID_NAME].trim())
    );
  });
};

const getInvalidFiles = (files: RawFile[], withLetters: boolean) =>
  files.filter((file) => !validateRawData([file], withLetters));

const rawFileParser = (files: RawFile[]): FileId[] => {
  return files.map((file) => {
    const newRawFile = removeKVQuotes(file);
    const { Número: completeNum = "" } = newRawFile;
    const [org = "", rep = "", num = "", digv = ""] = completeNum.split("-");

    return {
      completeNum: completeNum,
      org,
      rep,
      num,
      digv: digv.split("")[0],
    };
  });
};

export async function parseRawFiles(
  files: RawFile[],
  { withLetters = true }: { withLetters: boolean }
): Promise<{ ok: boolean; parsedData: FileId[] | RawFile[] }> {
  const isValid = validateRawData(files, withLetters);
  if (!isValid) {
    const invalidFiles = getInvalidFiles(files, withLetters);
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
    const { num: completeNum } = file;
    const [org, rep, num, digv] = completeNum.split("-");

    return {
      completeNum: completeNum,
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

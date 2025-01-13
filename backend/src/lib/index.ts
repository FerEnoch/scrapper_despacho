import { promises as fs } from "fs";
import path from "node:path";
import converter from "convert-csv-to-json";
import { RawFile, FileId, FileStats } from "../types";
import {
  FILE_NUMBER_COLUMN_VALID_NAME,
  FILE_NUMBER_COLUMN_VALIDATION_REGEX,
} from "../config";

const validateRawData = (files: RawFile[]) => {
  const validFiles = files.every((item) => {
    // Check if 'Número' property exists and matches the regex
    return (
      FILE_NUMBER_COLUMN_VALID_NAME in item &&
      FILE_NUMBER_COLUMN_VALIDATION_REGEX.test(
        item[FILE_NUMBER_COLUMN_VALID_NAME]
      )
    );
  });
  return validFiles;
};

const getInvalidFiles = (files: RawFile[]) => {
  const invalidFiles = files.filter((file) => {
    !validateRawData([file]);
  });
  return invalidFiles;
};

export async function parseRawFiles(
  files: RawFile[]
): Promise<{ ok: boolean; parsedData: FileId[] | RawFile[] }> {
  const isValid = validateRawData(files);
  console.log({ ok: isValid});
  if (!isValid) {
    return Promise.resolve({
      ok: isValid,
      parsedData: getInvalidFiles(files),
    });
  }

  return Promise.resolve({
    ok: isValid,
    parsedData: files.map((file) => {
      const { Número: completeNum = "" } = file;
      const [org = "", rep = "", num = "", digv = ""] = completeNum.split("-");

      return {
        completeNum: completeNum.split(" ")[0],
        org,
        rep,
        num,
        digv: digv.split("")[0],
      };
    }),
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

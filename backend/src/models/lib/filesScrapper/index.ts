import { FILE_NUMBER_COLUMN_VALID_NAME, VALIDATION_REGEX } from "./constants";
import { FileId, FileStats, RawFile } from "../../types";

function removeKVQuotes(file: RawFile) {
  const removeQuotesByRegex = (str: string) => str.trim().replace(/['"]+/g, "");
  return Object.entries(file).reduce((acc, [key, value = ""]) => {
    const newKey = removeQuotesByRegex(key);
    const newValue = removeQuotesByRegex(value);
    acc[newKey] = newValue;
    return acc;
  }, {} as RawFile);
}

const validateRawDataBatch = (files: RawFile[]) => {
  const validationRegex = VALIDATION_REGEX.FILE_NUMBER_COLUMN;

  const hasCorrectColumn = files.filter(
    (file) => FILE_NUMBER_COLUMN_VALID_NAME in file && file["Número"].length > 0
  );

  return hasCorrectColumn.every((file) => {
    const newFile = removeKVQuotes(file);
    const fileNum = newFile[FILE_NUMBER_COLUMN_VALID_NAME].trim();
    // Check if 'Número' property exists and matches the regex
    return validationRegex.test(fileNum);
  });
};

const getInvalidFiles = (files: RawFile[]) =>
  files.filter((file) => !validateRawDataBatch([file]));

const rawFileParser = (files: RawFile[]): FileId[] => {
  return files
    .map((file, index) => {
      const newRawFile = removeKVQuotes(file);
      const { Número: completeNum = "" } = newRawFile;
      const [org = "", rep = "", num = "", digv = ""] = completeNum.split("-");

      if (!org || !rep || !num || !digv) return null as unknown as FileId;

      return {
        index,
        completeNum: completeNum,
        org,
        rep,
        num,
        digv: digv.split("")[0],
      };
    })
    .filter(Boolean);
};

export async function parseRawFiles(
  files: RawFile[]
): Promise<{ ok: boolean; parsedData: FileId[] | RawFile[] }> {
  const batchIsValid = validateRawDataBatch(files);
  if (!batchIsValid) {
    const invalidFiles = getInvalidFiles(files);
    console.log("🚀 ~ invalidFiles:", invalidFiles);
    return Promise.resolve({
      ok: batchIsValid,
      parsedData: rawFileParser(invalidFiles),
    });
  }

  return Promise.resolve({
    ok: batchIsValid,
    parsedData: rawFileParser(files),
  });
}

export function parseFileStats(files: FileStats[]): FileId[] {
  return files.map((file) => {
    const { num: completeNum } = file;
    const [org, rep, num, digv, index] = completeNum.split("-");

    return {
      index: +index,
      completeNum: completeNum,
      org,
      rep,
      num,
      digv: digv.split("")[0],
    };
  });
}

export function getFilesBatches<F>({
  arr,
  size,
}: {
  arr: F[];
  size: number;
}): Array<F[]> {
  return arr.reduce((acc, item, index) => {
    if (index % size === 0) {
      acc.push([item]);
    } else {
      acc[acc.length - 1].push(item);
    }
    return acc;
  }, [] as Array<F[]>);
}

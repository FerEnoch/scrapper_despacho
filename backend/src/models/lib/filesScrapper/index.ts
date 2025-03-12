import { VALIDATION_REGEX } from "./constants";
import { FILE_NUMBER_COLUMN_VALID_NAME } from "../../../config";
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
    (file) =>
      FILE_NUMBER_COLUMN_VALID_NAME in file &&
      file[FILE_NUMBER_COLUMN_VALID_NAME].trim().length > 0
  );

  return hasCorrectColumn.every((file) => {
    const newFile = removeKVQuotes(file);
    const fileNum = newFile[FILE_NUMBER_COLUMN_VALID_NAME].trim();
    return validationRegex.test(fileNum);
  });
};

const getInvalidFiles = (files: RawFile[]) =>
  files.filter((file) => !validateRawDataBatch([file]));

const rawFileParser = (files: RawFile[]): FileId[] => {
  return files
    .map((file, index) => {
      const newRawFile = removeKVQuotes(file);
      const { [FILE_NUMBER_COLUMN_VALID_NAME]: completeNum = "" } = newRawFile;

      if (!completeNum) return null as unknown as FileId;

      let org = "",
        rep = "",
        num = "",
        digv = "";

      const hasLastFinalLetters = !!completeNum.split(" ")[1]?.length;

      if (hasLastFinalLetters) {
        [org = "", rep = "", num = "", digv = ""] = completeNum
          .trim()
          .split("-");

        const hasInitialOrgLetters = /\D/.test(org);

        return {
          index,
          completeNum: completeNum,
          org: hasInitialOrgLetters ? org : "",
          rep: hasInitialOrgLetters ? rep : org,
          num: hasInitialOrgLetters ? num : rep,
          digv:
            (hasInitialOrgLetters ? digv.split("")[0] : num.split("")[0]) || "",
        };
      }

      [rep = "", num = "", digv = ""] = completeNum.trim().split("-");
      const hasInitialOrgLetters = /\D/.test(rep);

      return {
        index,
        completeNum: completeNum,
        org: hasInitialOrgLetters ? rep : org,
        rep: hasInitialOrgLetters ? num : rep,
        num: hasInitialOrgLetters ? digv : num,
        digv: hasInitialOrgLetters ? num.split("")[0] : digv.split("")[0] || "",
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

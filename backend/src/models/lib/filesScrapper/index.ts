import { FILE_NUMBER_COLUMN_VALID_NAME, VALIDATION_REGEX } from "./constants";
import { FileId, FileStats, RawFile } from "../../types";

function removeKVQuotes(file: RawFile) {
  const removeQuotesByRegex = (str: string) => str.replace(/['"]+/g, "");
  return Object.entries(file).reduce((acc, [key, value = ""]) => {
    const newKey = removeQuotesByRegex(key);
    const newValue = removeQuotesByRegex(value);
    acc[newKey] = newValue;
    return acc;
  }, {} as RawFile);
}

const validateRawDataBatch = (files: RawFile[], withLetters: boolean) => {
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
  files.filter((file) => !validateRawDataBatch([file], withLetters));

const rawFileParser = (files: RawFile[]): FileId[] => {
  return files.map((file, index) => {
    const newRawFile = removeKVQuotes(file);
    const { Número: completeNum = "" } = newRawFile;
    const [org = "", rep = "", num = "", digv = ""] = completeNum.split("-");

    return {
      index,
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
  /**
   * TODO:
   *  1. let pass letters absence error, but not number errors
   *  2. accept code with 3 numbers (i.e. 963), and no letters
   * */

  const batchIsValid = validateRawDataBatch(files, withLetters);
  if (!batchIsValid) {
    const invalidFiles = getInvalidFiles(files, withLetters);
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

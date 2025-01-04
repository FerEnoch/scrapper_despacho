import { RawFile, File } from "../types";

export async function parseFilesNums(files: RawFile[]): Promise<File[]> {
  return Promise.resolve(
    files.map((file) => {
      const { Número: completeNum = "" } = file;
      const [org, rep, num, divg] = completeNum.split("-");

      return {
        completeNum: completeNum.split(" ")[0],
        org,
        rep,
        num,
        digv: divg.split("")[0],
      };
    })
  );
}

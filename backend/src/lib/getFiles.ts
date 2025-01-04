// import { promises as fs } from "fs";
// import path from "node:path";
import converter from "convert-csv-to-json";

// export async function getFilesRawDataFromFile() {
//   const fileRawData = await fs.readFile(
//     path.join(process.cwd(), "sample_data", "files.csv"),
//     "utf8"
//   );

//   return fileRawData;
// }

export async function convertToJson(rawData: string) {
  const json = converter.fieldDelimiter(",").csvStringToJson(rawData);
  return json;
}

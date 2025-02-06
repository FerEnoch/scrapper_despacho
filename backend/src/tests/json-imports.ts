import fs from "fs/promises";

export const getJsonSampleDataFile = async (file: string) => {
  const jsonData = await fs.readFile(
    new URL(`./sample_data/${file}`, import.meta.url),
    "utf-8"
  );
  return jsonData;
};

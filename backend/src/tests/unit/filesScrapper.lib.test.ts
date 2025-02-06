import { describe, expect, it } from "vitest";
import { parsedFilesIds } from "../sample_data/parsedFilesIds.js";
import { parseRawFiles } from "../../models/lib/filesScrapper/index.js";
import { getJsonSampleDataFile } from "../json-imports.js";

describe("LIB FUNCTIONS > filesScrapper", () => {
  it("should return a list of files stats", async () => {
    const jsonDataFiles = await getJsonSampleDataFile("jsonDataFiles.json");
    const { ok, parsedData } = await parseRawFiles(JSON.parse(jsonDataFiles), {
      withLetters: true,
    });
    expect(ok).toEqual(true);
    expect(parsedData).toEqual(parsedFilesIds);
  });

  it("should not throw if empty list of files", async () => {
    const { ok, parsedData } = await parseRawFiles([], { withLetters: true });
    expect(ok).toEqual(true);
    expect(parsedData).toEqual([]);
  });
});

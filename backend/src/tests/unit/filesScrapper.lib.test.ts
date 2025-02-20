import { describe, expect, it } from "vitest";
import { parsedFilesIds } from "../sample_data/parsedFilesIds.js";
import { parseRawFiles } from "../../models/lib/filesScrapper/index.js";
import { getJsonSampleDataFile } from "../json-imports.js";

/**
 * TODO -> test buggy files algorithm
 */

/**
 * @description This test suite is for testing the API lib functions
 * @dev Command to run this test suite:
 *  - npm run back:test
 */
describe("LIB-FUNCTIONS > filesScrapper", () => {
  it("should return a list of files stats", async () => {
    const jsonDataFiles = await getJsonSampleDataFile("jsonDataFiles.json");
    const { ok, parsedData } = await parseRawFiles(JSON.parse(jsonDataFiles));
    expect(ok).toEqual(true);
    expect(parsedData).toEqual(parsedFilesIds);
  });

  it("should not throw if empty list of files", async () => {
    const { ok, parsedData } = await parseRawFiles([]);
    expect(ok).toEqual(true);
    expect(parsedData).toEqual([]);
  });
});

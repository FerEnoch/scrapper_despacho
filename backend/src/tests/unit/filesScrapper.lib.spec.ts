import { describe } from "vitest";
import { parseRawFiles } from "../../models/lib";
import jsonDataFiles from "../sample_data/jsonDataFiles.json";
import parsedFiles from "../sample_data/parsedFiles.js";

describe("filesScrapper lib functions", () => {
  it("should return a list of files stats", async () => {
    const { ok, parsedData } = await parseRawFiles(jsonDataFiles, {
      withLetters: true,
    });
    expect(ok).toEqual(true);
    expect(parsedData).toEqual(parsedFiles);
  });

  it("should not throw if empty list of files", async () => {
    const { ok, parsedData } = await parseRawFiles([], { withLetters: true });
    expect(ok).toEqual(true);
    expect(parsedData).toEqual([]);
  });
});

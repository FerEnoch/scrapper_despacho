import { describe, it, expect } from "vitest";
import { testAgent } from "../setup";
import { MESSAGES } from "../../controllers/constants";
import { ERRORS } from "../../errors/types";
import { filesStats } from "../sample_data/filesStats";
import { wholeLotOfFileStats } from "../sample_data/filesStats-whole-lot-of";

/**
 * @description This test suite is for testing the API files routes
 * @dev To run this test suite, you need to have a running SIEM system user and password
 * @dev Command to run this test suite:
 *  - npm run back:test
 */
describe("API-INTEGRATION > files-router", () => {
  /**
   * @route /files
   * @method POST
   * @description Upload a csv file
   */
  it("should upload a csv file and search for SOME files stats", async () => {
    const res = await testAgent
      .post("/api/v1/files")
      .attach("file", "src/tests/sample_data/files.csv");

    const { data } = res.body;

    expect(res.status).toBe(201);
    expect(res.body.message).toBe(MESSAGES.FILE_UPLOADED);
    expect(data).toEqual(filesStats);
  }); // 2254 ms

  it("should upload a csv file and search for WHOLE LOT OF files stats", async () => {
    const res = await testAgent
      .post("/api/v1/files")
      .attach("file", "src/tests/sample_data/files-whole-lot-of.csv");

    const { data } = res.body;

    expect(res.status).toBe(201);
    expect(res.body.message).toBe(MESSAGES.FILE_UPLOADED);
    expect(data).toEqual(wholeLotOfFileStats);
  }, 15000); // 11355 ms

  it("should return 400 & correct msg if file is not a csv", async () => {
    const res = await testAgent
      .post("/api/v1/files")
      .attach("file", "src/tests/sample_data/sample.jpg");
    expect(res.status).toBe(400);
    expect(res.body.message).toBe(ERRORS.INVALID_FILE);
  });

  it("should return 400 & correct msg if no file is attached", async () => {
    const res = await testAgent.post("/api/v1/files");
    expect(res.status).toBe(400);
    expect(res.body.message).toBe(ERRORS.NO_FILE_TO_UPLOAD);
  });

  /**
   * @route /files/end
   * @method POST
   * @description End files in SIEM system
   * @description Requires authentication
   */
  it.skip("should not end files that are already ended", async () => {
    const endedFiles = [
      {
        prevStatus: "FINALIZADO",
      },
    ];

    const res = await testAgent.post("/api/v1/files/end").send(endedFiles);
    expect(res.status).toBe(400);
    expect(res.body.message).toEqual(ERRORS.NO_FILES_TO_END);
    expect(res.body.data).toEqual(null);
  });
});

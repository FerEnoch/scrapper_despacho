import { describe, it, expect } from "vitest";
import { testAgent } from "../setup";
import { MESSAGES } from "../../controllers/constants";
import { ERRORS } from "../../errors/types";
import { filesStats } from "../sample_data/filesStats";
import { wholeLotOfFileStats } from "../sample_data/filesStats-whole-lot-of";
import { filesEnded } from "../sample_data/filesEnded";
import { filesEndedWholeLotOf } from "../sample_data/filesEnded-whole-lot-of";

/**
 * @description This test suite is for testing the API files routes
 * @dev To run this test suite, you need to have a running SIEM system user and password
 * @dev Command to run this test suite:
 *  - npm run back:test
 */
describe.only("API-INTEGRATION > files-router", () => {
  /**
   * @route /files
   * @method POST
   * @description Upload a csv file
   */
  it.skip("should upload a csv file and search for SOME files stats", async () => {
    const res = await testAgent
      .post("/api/v1/files")
      .attach("file", "src/tests/sample_data/files.csv");

    const { data } = res.body;

    expect(res.status).toBe(201);
    expect(res.body.message).toBe(MESSAGES.FILE_UPLOADED);
    expect(data).toEqual(filesStats);
  }); // 2254 ms

  it.skip(
    "should upload a csv file and search for WHOLE LOT OF files stats",
    async () => {
      const res = await testAgent
        .post("/api/v1/files")
        .attach("file", "src/tests/sample_data/files-whole-lot-of.csv");

      const { data } = res.body;

      expect(res.status).toBe(201);
      expect(res.body.message).toBe(MESSAGES.FILE_UPLOADED);
      expect(data).toEqual(wholeLotOfFileStats);
    },
    15 * 1000 // 11355 ms / 9756 ms
  );

  it.skip("should return 400 & correct msg if file is not a csv", async () => {
    const res = await testAgent
      .post("/api/v1/files")
      .attach("file", "src/tests/sample_data/sample.jpg");
    expect(res.status).toBe(400);
    expect(res.body.message).toBe(ERRORS.INVALID_FILE);
  });

  it.skip("should return 400 & correct msg if no file is attached", async () => {
    const res = await testAgent.post("/api/v1/files");
    expect(res.status).toBe(400);
    expect(res.body.message).toBe(ERRORS.NO_FILE_TO_UPLOAD);
  });

  /**
   * @route /files/end
   * @method POST
   * @description End files in SIEM system
   * @description Requires authentication -
   * @description Test without issues by-passing auth middleware
   */
  it("should not end files that are already ended", async () => {
    const endedFiles = [
      {
        index: 0,
        num: "DE-0010-00485568-0 (N)",
        title: "Sin datos",
        prevStatus: "FINALIZADO",
        location: "D123 - DCION. TECNICO ADMINISTRATIVA",
      },
    ];

    const res = await testAgent.post("/api/v1/files/end").send(endedFiles);
    expect(res.status).toBe(400);
    expect(res.body.message).toEqual(ERRORS.NO_FILES_TO_END);
    expect(res.body.data).toEqual(null);
  });

  it("should end SOME files in SIEM system", async () => {
    const res = await testAgent.post("/api/v1/files/end").send(filesStats);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(MESSAGES.FILES_ENDED);
    expect(res.body.data).toEqual(filesEnded);
  });

  it.skip(
    "should end LOT OF files in SIEM system",
    async () => {
      const res = await testAgent
        .post("/api/v1/files/end")
        .send(wholeLotOfFileStats);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe(MESSAGES.FILES_ENDED);
      expect(res.body.data).toEqual(filesEndedWholeLotOf);
    },
    25 * 1000 // 21s
  );
});

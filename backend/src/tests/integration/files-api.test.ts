import { describe, it, expect } from "vitest";
import { testAgent } from "../setup";
import { MESSAGES } from "../../controllers/constants";
import { ERRORS } from "../../errors/types";
import { filesStats } from "../sample_data/filesStats";
import { wholeLotOfFileStats } from "../sample_data/filesStats-whole-lot-of";
import { filesEnded } from "../sample_data/filesEnded";
import { filesEndedWholeLotOf } from "../sample_data/filesEnded-whole-lot-of";
import {
  findLastScreenshotIfExists,
  getFakeValidCredentialsCookie,
  getFakeWrongCredentialsCookie,
  removeLastScreenshotIfExists,
} from "../helpers";

/**
 * TODO -> test buggy files sent to api
 */

/**
 * @description This test suite is for testing the v1 API files routes
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

  it(
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
   * @description Requires authentication -
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

    const res = await testAgent
      .post("/api/v1/files/end")
      .set("Cookie", `accessToken=${getFakeValidCredentialsCookie()}`)
      .send(endedFiles);

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual(ERRORS.NO_FILES_TO_END);
    expect(res.body.data).toEqual(null);
  });

  it(
    "should end SOME files in SIEM system",
    async () => {
      const res = await testAgent
        .post("/api/v1/files/end")
        .set("Cookie", `accessToken=${getFakeValidCredentialsCookie()}`)
        .send(filesStats);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe(MESSAGES.FILES_ENDED);
      expect(res.body.data).toEqual(filesEnded);
    },
    8 * 1000
  ); // 8s

  it(
    "should end LOT OF files in SIEM system",
    async () => {
      const res = await testAgent
        .post("/api/v1/files/end")
        .set("Cookie", `accessToken=${getFakeValidCredentialsCookie()}`)
        .send(wholeLotOfFileStats);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe(MESSAGES.FILES_ENDED);
      expect(res.body.data).toEqual(filesEndedWholeLotOf);
    },
    25 * 1000 // 21s / 22.5 ss
  );

  it(
    "should return 401 if wrong credentials are provided",
    async () => {
      await removeLastScreenshotIfExists(
        "./src/tests/integration/login-error.jpg"
      );

      const res = await testAgent
        .post("/api/v1/files/end")
        .set("Cookie", `accessToken=${getFakeWrongCredentialsCookie()}`)
        .send(filesStats);

      // is returning 500 - SERVER_ERROR

      const lastReportScreenshot = await findLastScreenshotIfExists(
        "./src/tests/integration/login-error.jpg"
      );

      expect(lastReportScreenshot).toBeTruthy();
      expect(res.status).toBe(401);
      expect(res.body.message).toBe(ERRORS.COULD_NOT_LOGIN_IN_SIEM);
    },
    8 * 1000
  ); // 8s
});

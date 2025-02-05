import { describe, it, expect } from "vitest";
import { request } from "../setup";
import { MESSAGES } from "../../controllers/constants";
import { ERRORS } from "../../errors/types";

describe("API-INTEGRATION > files-router", () => {
  /**
   * 
   * router.get("/stats/:id", filesController.getFilesStats);
  router.post("/end", filesController.endFiles);
  */

  /**
   * @route /files
   * @method POST
   * @description Upload a csv file
   */
  it.skip("should upload a csv file", async () => {
    const res = await request
      .post("/files")
      .attach("file", "src/tests/sample_data/files.csv");

    expect(res.status).toBe(201);
    expect(res.body.message).toBe(MESSAGES.FILE_UPLOADED);
  });

  it("should return 400 if file is not a csv", async () => {
    const res = await request
      .post("/files")
      .attach("file", "src/tests/sample_data/siem.png");
    expect(res.status).toBe(400);
    expect(res.body.message).toBe(ERRORS.INVALID_FILE);
  });

  it("should return 400 if no file is attached", async () => {
    const res = await request.post("/files");
    expect(res.status).toBe(400);
    expect(res.body.message).toBe(ERRORS.NO_FILE_TO_UPLOAD);
  });

  /**
   * @route /files/end
   * @method POST
   * @description End files in SIEM system
   */
  it("should not end files that are already ended", async () => {
    const endedFiles = [
      {
        num: "DE-0010-00485568-0 (N)",
        location: "S116 - Agencia de Vivienda",
        title: "SOLIC. LOTE",
        prevStatus: "FINALIZADO",
      },
    ];

    const res = await request.post("/files/end").send(endedFiles);
    expect(res.status).toBe(400);
    expect(res.body.message).toEqual(ERRORS.NO_FILES_TO_END);
    expect(res.body.data).toEqual([]);
  });

  // it("should end files by 1 per request", async () => {
  //   const endedFiles = [{}];
  //   const res = await request.post("/files/end").send(endedFiles);
  //   expect(res.status).toBe(200);
  //   expect(res.body.message).toEqual(MESSAGES.FILES_ENDED);
  //   expect(res.body.data).toEqual([]);
  // });

  // it("should end files by ~=50 per request", async () => {
  //   const endedFiles = [{}];
  //   const res = await request.post("/files/end").send(endedFiles);
  //   expect(res.status).toBe(200);
  //   expect(res.body.message).toEqual(MESSAGES.FILES_ENDED);
  //   expect(res.body.data).toEqual([]);
  // });
});

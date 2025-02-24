import { Router } from "express";
import { FilesController } from "../controllers/files.controller";
import { modelTypes } from "../types";
import { validateFileRequest } from "../middlewares/validateFileReq";
import { IAuthController } from "../controllers/types";

export async function initializeFilesRouter(
  model: modelTypes["IFileScrapper"],
  authController: IAuthController
) {
  const router = Router();

  const { endFiles, getFilesStats, uploadFile } = new FilesController(model);

  router.post("/", validateFileRequest, uploadFile);
  router.post("/end", authController.verifyJwtMiddleware, endFiles);
  router.get("/stats/:id", getFilesStats);

  return router;
}

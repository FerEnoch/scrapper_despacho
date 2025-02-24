import { Router } from "express";
import { FilesController } from "../controllers/files.controller";
import { modelTypes } from "../types";
import { AuthModel } from "../models/auth.model";
import { validateFileRequest } from "../middlewares/validateFileReq";

export async function initializeFilesRouter(
  model: modelTypes["IFileScrapper"]
) {
  const router = Router();

  const { endFiles, getFilesStats, uploadFile } = new FilesController(model);
  const { verifyJwtMiddleware } = new AuthModel(model);

  router.post("/", validateFileRequest, uploadFile);
  router.post("/end", verifyJwtMiddleware, endFiles);
  router.get("/stats/:id", getFilesStats);

  return router;
}

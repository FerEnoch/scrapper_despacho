import { Router } from "express";
import { FilesController } from "../controllers/files.controller";
import { modelTypes } from "../types";
import { AuthModel } from "../models/auth.model";
import { validateFileRequest } from "../middlewares/validateFileReq";

export async function initializeFilesRouter({
  model,
}: {
  model: modelTypes["IFileScrapper"];
}) {
  const router = Router();

  const filesController = new FilesController({ model });
  const { verifyJwtMiddleware } = new AuthModel();

  // router.get("/stats/:id", filesController.getFilesStats);
  router.post("/", validateFileRequest, filesController.uploadFile);
  router.post("/end", verifyJwtMiddleware, filesController.endFiles);
  return router;
}

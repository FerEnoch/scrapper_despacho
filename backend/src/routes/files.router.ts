import { Router } from "express";
import { FilesController } from "../controllers/files.controller";
import { modelTypes } from "../types";
import { AuthModel } from "../models/auth.model";

export async function initializeFilesRouter({
  model,
}: {
  model: modelTypes["IFileScrapper"];
}) {
  const router = Router();

  const filesController = new FilesController({ model });
  const { verifyJwt } = new AuthModel();

  router.get("/stats/:id", filesController.getFilesStats);
  router.post("/", filesController.uploadFile);
  router.post("/end", /*verifyJwt*/ filesController.endFiles);
  return router;
}

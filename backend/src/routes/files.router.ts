import { Router } from "express";
import { FilesController } from "../controllers/files.controller";
import { modelTypes } from "../types";
import { verifyToken } from "../middlewares/verifyToken";

export async function initializeFilesRouter({
  model,
}: {
  model: modelTypes["IFileScrapper"];
}) {
  const router = Router();

  const filesController = new FilesController({ model });

  router.get("/stats/:id", filesController.getFilesStats);
  router.post("/", filesController.uploadFile);
  router.post("/end", verifyToken, filesController.endFiles);
  return router;
}

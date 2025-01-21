import { Router } from "express";
import { FilesController } from "../controllers/files.controller";
import { modelTypes } from "../types";

export async function initializeRouter({ model }: { model: modelTypes }) {
  const router = Router();
  const filesController = new FilesController({ model });

  router.get("/stats/:id", filesController.getFilesStats);
  router.post("/", filesController.uploadFile);
  router.post("/end", filesController.endFiles);
  return router;
}

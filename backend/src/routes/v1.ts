import { Router } from "express";
import { initializeAuthRouter } from "./auth.router";
import { DatabaseModel } from "../models/database.model";
import { initializeFilesRouter } from "./files.router";
import { modelTypes } from "../types";
import { AuthController } from "../controllers/auth.controller";

export async function v1Routes({
  filesModel,
}: {
  filesModel: modelTypes["IFileScrapper"];
}) {
  const router = Router();

  /** Initialize auth database and controller */
  const databaseName = "users.db";
  const databaseModel = new DatabaseModel(databaseName);

  const authController = new AuthController(databaseModel);

  /** Initialize auth router: database and users models */
  const authRouter = await initializeAuthRouter(authController);

  /** Initialize files routes model */
  const filesRouter = await initializeFilesRouter(filesModel, authController);

  router.use("/auth", authRouter);
  router.use("/files", filesRouter);

  return router;
}

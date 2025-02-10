import { Router } from "express";
import { initializeAuthRouter } from "./auth.router";
import { DatabaseModel } from "../models/database.model";
import { initializeFilesRouter } from "./files.router";
import { modelTypes } from "../types";

export async function v1Routes({
  filesModel,
}: {
  filesModel: modelTypes["IFileScrapper"];
}) {
  const router = Router();

  /** Initialize auth router: database and users models */
  const databaseName = "users.db";
  const databaseModel = new DatabaseModel(databaseName);

  const authRouter = await initializeAuthRouter({ model: databaseModel });

  /** Initialize files routes model */
  const filesRouter = await initializeFilesRouter({ model: filesModel });

  router.use("/auth", authRouter);
  router.use("/files", filesRouter);

  return router;
}

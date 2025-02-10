import { modelTypes } from "./types";
import express from "express";
import { initializeFilesRouter } from "./routes/files.router";
import { handle404Error, handleGlobalError } from "./middlewares/handle-errors";
import { initializeAuthRouter } from "./routes/auth.router";
import { DatabaseModel } from "./models/database.model";
import { useMiddlewares } from "./middlewares";
import { NODE_ENV } from "./config";

export async function initializeApp({
  model,
}: {
  model: modelTypes["IFileScrapper"];
}) {
  const app = useMiddlewares(express());

  /** Initialize auth module: model, database and router */
  const databaseName = "users.db";

  const databaseModel = new DatabaseModel(databaseName);
  const authRouter = await initializeAuthRouter({ model: databaseModel });
  app.use("/auth", authRouter);

  /** Initialize files routes model */
  const filesRouter = await initializeFilesRouter({ model });
  app.use("/files", filesRouter);

  /* Handle errors */
  app.use(handle404Error, handleGlobalError);

  return app;
}

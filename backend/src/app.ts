import { modelTypes } from "./types";
import fileUpload from "express-fileupload";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { initializeFilesRouter } from "./routes/files.router";
import { handle404Error, handleGlobalError } from "./middlewares/handle-errors";
import { initializeAuthRouter } from "./routes/auth.router";
import cookieParser from "cookie-parser";
import { AuthModel } from "./models/auth.model";
import { createDB, createTables } from "./db";

export async function initializeApp({
  model,
}: {
  model: modelTypes["IFileScrapper"];
}) {
  const app = express();

  app.use(
    fileUpload({
      createParentPath: true,
      // debug: true,
    })
  );

  app.disable("x-powered-by");
  app.use(cookieParser());
  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(morgan("dev"));

  /** Initialize files routes model */
  const filesRouter = await initializeFilesRouter({ model });
  app.use("/files", filesRouter);

  /** Initialize auth model and database */
  const db = createDB("users.db");
  createTables(db);
  const authModel = new AuthModel(db);

  const authRouter = await initializeAuthRouter({ model: authModel });
  app.use("/auth", authRouter);

  app.use(handle404Error, handleGlobalError);

  return app;
}

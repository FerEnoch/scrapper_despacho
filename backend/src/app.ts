import { modelTypes } from "./types";
import fileUpload from "express-fileupload";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { initializeRouter } from "./routes/index";
import { handle404Error, handleGlobalError } from "./middlewares/handle-errors";

export async function initializeApp({ model }: { model: modelTypes }) {
  const app = express();

  app.use(
    fileUpload({
      createParentPath: true,
      // debug: true,
    })
  );

  app.disable("x-powered-by");

  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(morgan("dev"));

  const filesRouter = await initializeRouter({ model });
  app.use("/files", filesRouter);

  app.use(handle404Error, handleGlobalError);

  return app;
}

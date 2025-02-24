import { modelTypes } from "./types";
import express from "express";
import { handle404Error, handleGlobalError } from "./middlewares/handle-errors";
import { useMiddlewares } from "./middlewares";
const { v1Routes } = await import("./routes/v1");

export async function initializeApp({
  model,
  version,
}: {
  model: modelTypes["IFileScrapper"];
  version: number;
}) {
  if (!model) return null;

  const app = useMiddlewares(express());

  if (version === 1) {
    app.get("/", (_req, res) => {
      res.send(
        `<h3>Welcome to files scrapper API - Please use /api/v${version}</h3>`
      );
    });

    /* v1 router */
    const v1Router = await v1Routes({ filesModel: model });
    app.use(`/api/v${version}`, v1Router);

    /* Handle errors */
    app.use(handle404Error, handleGlobalError);
  }

  return app;
}

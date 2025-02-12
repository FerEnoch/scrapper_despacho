import { modelTypes } from "./types";
import express from "express";
import { handle404Error, handleGlobalError } from "./middlewares/handle-errors";
import { useMiddlewares } from "./middlewares";
const { v1Routes } = await import("./routes/v1");

export async function initializeApp({
  model,
}: {
  model: modelTypes["IFileScrapper"];
}) {
  const app = useMiddlewares(express());

  app.get("/api/v1", (_req, res) => {
    res.send("<h3>Welcome to files scrapper API</h3>");
  });

  const v1Router = await v1Routes({ filesModel: model });
  app.use("/api/v1", v1Router);

  /* Handle errors */
  app.use(handle404Error, handleGlobalError);

  return app;
}

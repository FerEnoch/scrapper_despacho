import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { modelTypes } from "../types";

export async function initializeAuthRouter({
  model,
}: {
  model: modelTypes["IAuthModel"];
}) {
  const authRouter = new AuthController({ model });

  const router = Router();
  router.post("/login", authRouter.login);
  router.get("/user/:id", authRouter.getUserById);
  router.post("/logout", authRouter.logout);

  return router;
}

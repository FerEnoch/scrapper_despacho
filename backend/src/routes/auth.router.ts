import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { modelTypes } from "../types";
import { verifyToken } from "../middlewares/verifyToken";
import { validateRequest } from "../middlewares/validateRequest";
import { AuthSchema } from "../schemas/auth";

export async function initializeAuthRouter({
  model,
}: {
  model: modelTypes["IAuthModel"];
}) {
  const authRouter = new AuthController({ model });

  const router = Router();
  router.post("/login", validateRequest(AuthSchema), authRouter.login);
  router.get("/user/:id", verifyToken, authRouter.getUserById);
  router.post("/logout", verifyToken, authRouter.logout);

  return router;
}

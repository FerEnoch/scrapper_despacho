import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { modelTypes } from "../types";
import { validateAuthReq } from "../middlewares/validateAuthReq";
import { AuthSchema } from "../schemas/auth";
import { AuthModel } from "../models/auth.model";

export async function initializeAuthRouter(
  model: modelTypes["IDatabaseModel"]
) {
  const { login, updateUserCredentials, logout } = new AuthController(model);
  const { verifyJwtMiddleware } = new AuthModel(model);

  const router = Router();
  // router.post("/register", validateAuthReq(AuthSchema), register);
  router.post("/login", validateAuthReq(AuthSchema), login);
  router.patch("/user/:id", verifyJwtMiddleware, updateUserCredentials);
  router.post("/logout", verifyJwtMiddleware, logout);

  return router;
}

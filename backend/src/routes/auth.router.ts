import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validateAuthReq } from "../middlewares/validateAuthReq";
import { AuthSchema } from "../schemas/auth";
import { IAuthController } from "../controllers/types";

export async function initializeAuthRouter(controller: IAuthController) {
  const router = Router();

  const { login, updateUserCredentials, logout, verifyJwtMiddleware } =
    controller;

  // router.post("/register", validateAuthReq(AuthSchema), register);
  router.post("/login", validateAuthReq(AuthSchema), login);
  router.patch("/user/:id", verifyJwtMiddleware, updateUserCredentials);
  router.post("/logout", verifyJwtMiddleware, logout);

  return router;
}

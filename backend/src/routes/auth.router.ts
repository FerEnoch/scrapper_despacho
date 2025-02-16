import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { modelTypes } from "../types";
import { validateAuthReq } from "../middlewares/validateAuthReq";
import { AuthSchema } from "../schemas/auth";
import { AuthModel } from "../models/auth.model";

export async function initializeAuthRouter({
  model,
}: {
  model: modelTypes["IDatabaseModel"];
}) {
  const { login, register, /*getUserById,*/ updateUserCredentials, logout } =
    new AuthController({
      model,
    });
  const { verifyJwtMiddleware } = new AuthModel();

  const router = Router();
  router.post("/register", validateAuthReq(AuthSchema), register);
  router.post("/login", validateAuthReq(AuthSchema), login);
  // router.get("/user/:id", verifyJwtMiddleware, getUserById);
  router.post("/logout", verifyJwtMiddleware, logout);
  router.patch("/user/:id", verifyJwtMiddleware, updateUserCredentials);
  return router;
}

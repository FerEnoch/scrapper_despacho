import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { modelTypes } from "../types";
import { validateRequest } from "../middlewares/validateAuthReq";
import { AuthSchema } from "../schemas/auth";
import { AuthModel } from "../models/auth.model";

export async function initializeAuthRouter({
  model,
}: {
  model: modelTypes["IDatabaseModel"];
}) {
  const { login, register, getUserById, logout } = new AuthController({
    model,
  });
  const { verifyJwt } = new AuthModel();

  const router = Router();
  router.post("/register", validateRequest(AuthSchema), register);
  router.post("/login", verifyJwt, validateRequest(AuthSchema), login);
  router.get("/user/:id", verifyJwt, getUserById);
  router.post("/logout", verifyJwt, logout);

  return router;
}

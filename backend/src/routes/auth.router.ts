import { Router } from "express";
import { validateAuthReq } from "../middlewares/validateAuthReq";
import { AuthSchema } from "../schemas/auth";
import { IAuthController } from "../controllers/types";

export async function initializeAuthRouter(controller: IAuthController) {
  const router = Router();

  const {
    login,
    revalidateAccessToken,
    updateUserCredentials,
    logout,
    getUserById,
    verifyJwtMiddleware,
  } = controller;

  router.post("/login", validateAuthReq(AuthSchema), login);
  router.post("/revalidate-token", revalidateAccessToken);
  router.get("/user/:id", verifyJwtMiddleware, getUserById);
  router.patch("/user/:id", verifyJwtMiddleware, updateUserCredentials);
  router.post("/logout", verifyJwtMiddleware, logout);

  return router;
}

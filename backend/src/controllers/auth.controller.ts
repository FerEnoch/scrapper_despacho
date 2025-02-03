import { Request, Response } from "express";
import { Auth } from "../schemas/auth";
import { IAuthService } from "../sevices/types";
import { IAuthController } from "./types";
import { AuthService } from "../sevices/auth.service";
import { modelTypes } from "../types";
import { MESSAGES } from "./constants";

export class AuthController implements IAuthController {
  service: IAuthService;
  constructor({ model }: { model: modelTypes["IAuthModel"] }) {
    this.service = new AuthService({ model });
    this.login = this.login.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.logout = this.logout.bind(this);
  }

  async login(req: Request, res: Response): Promise<void> {
    const { user, pass } = req.body as Auth;
    const { ok, message, userId, username } = await this.service.login({
      user,
      pass,
    });

    if (!ok) {
      res.status(400).json({
        message,
        userId,
        username,
      });
    }

    switch (message) {
      case MESSAGES.USER_ALREADY_LOGGED:
        res.status(400).json({
          message,
          userId,
          username,
        });
        break;
      case MESSAGES.SUCCESS:
        res.status(201).json({
          message: MESSAGES.USER_LOGGED_IN,
          userId,
          username,
        });
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    const { ok, message, userId, username } = await this.service.getUserById({
      userId: id,
    });

    if (!ok) {
      res.status(400).json({
        message,
        userId,
        username,
      });
      return;
    }

    switch (message) {
      case MESSAGES.USER_NOT_FOUND:
        res.status(404).json({
          message,
          userId,
          username,
        });
        break;
      case MESSAGES.SUCCESS:
        res.status(200).json({
          message,
          userId,
          username,
        });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    const { id } = req.body as { id: string };
    const { ok, message, userId } = await this.service.logout({
      userId: id,
    });

    if (!ok) {
      res.status(400).json({
        message,
        userId,
      });
      return;
    }

    switch (message) {
      case MESSAGES.USER_NOT_FOUND:
        res.status(404).json({
          message,
          userId,
        });
        break;
      case MESSAGES.SUCCESS:
        res.status(200).json({
          message: MESSAGES.USER_LOGGED_OUT,
          userId,
        });
        break;
    }
  }
}

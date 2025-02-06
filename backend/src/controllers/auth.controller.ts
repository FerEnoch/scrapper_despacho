import { Request, Response } from "express";
import { Auth } from "../schemas/auth";
import { IUserService } from "../sevices/types";
import { IAuthController } from "./types";
import { UserService } from "../sevices/user.service";
import { modelTypes } from "../types";
import { MESSAGES } from "./constants";
import { NODE_ENV } from "../config";
import { JwtPayload } from "jsonwebtoken";

export class AuthController implements IAuthController {
  service: IUserService;

  constructor({ model }: { model: modelTypes["IDatabaseModel"] }) {
    this.service = new UserService({ model });
    this.login = this.login.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.logout = this.logout.bind(this);
    this.register = this.register.bind(this);
  }

  async register(req: Request, res: Response): Promise<void> {
    const { user, pass } = req.body as Auth;

    const { userId, token } = await this.service.register({
      user,
      pass,
    });

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(201).json({
      message: MESSAGES.USER_REGISTERED,
      userId,
    });
  }

  async login(
    req: Request & { auth?: { access: string | JwtPayload } },
    res: Response
  ): Promise<void> {
    const { user, pass } = req.body as Auth;

    const access = req.auth?.access;
    console.log("🚀 ~ AuthController ~ login ~ access:", access);

    const { userId  } = await this.service.login({
      user,
      pass,
    });

    res.status(201).json({
      message: MESSAGES.USER_LOGGED_IN,
      userId,
    });
  }

  async getUserById(
    req: Request & {
      auth?: {
        access: string | JwtPayload;
      };
    },
    res: Response
  ): Promise<void> {
    const { id } = req.params as { id: string };

    const access = req.auth?.access;
    console.log("🚀 ~ AuthController ~ getUserById ~ access:", access);

    const { userId, username } = await this.service.getUserById({
      userId: id,
    });

    res.status(200).json({
      message: MESSAGES.USER_SESSION_ACTIVE,
      userId,
      username,
    });
  }

  async logout(
    req: Request & { auth?: { access: string | JwtPayload } },
    res: Response
  ): Promise<void> {
    const { id } = req.body as { id: string };

    const access = req.auth?.access;
    console.log("🚀 ~ AuthController ~ logout ~ access:", access);

    const { userId } = await this.service.logout({
      userId: id,
    });

    res.clearCookie("accessToken");

    res.status(200).json({
      message: MESSAGES.USER_LOGGED_OUT,
      userId,
    });
  }
}

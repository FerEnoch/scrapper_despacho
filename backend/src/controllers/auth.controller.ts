import { NextFunction, Request, Response } from "express";
import { Auth } from "../schemas/auth";
import { IUserService } from "../sevices/types";
import { IAuthController } from "./types";
import { UserService } from "../sevices/user.service";
import { modelTypes } from "../types";
import { MESSAGES } from "./constants";
import { NODE_ENV } from "../config";
import { JwtPayload } from "jsonwebtoken";
import { ApiError } from "../errors/api-error";
import { ERRORS } from "../errors/types";

export class AuthController implements IAuthController {
  service: IUserService;

  constructor({ model }: { model: modelTypes["IDatabaseModel"] }) {
    this.service = new UserService({ model });
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.logout = this.logout.bind(this);
  }

  async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, pass } = req.body as Auth;

      const { userId } = await this.service.register({
        user,
        pass,
      });

      res.status(201).json({
        message: MESSAGES.USER_REGISTERED,
        userId,
      });
    } catch (error: any) {
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(
          new ApiError({
            statusCode: 500,
            message: ERRORS.SERVER_ERROR,
          })
        );
      }
    }
  }

  async login(
    req: Request & { auth?: { access: string | JwtPayload } },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, pass } = req.body as Auth;

      const { userId, token } = await this.service.login({
        user,
        pass,
      });

      res.cookie("accessToken", token, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: "strict",
      });

      res.status(201).json({
        message: MESSAGES.USER_LOGGED_IN,
        userId,
      });
    } catch (error: any) {
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(
          new ApiError({
            statusCode: 500,
            message: ERRORS.SERVER_ERROR,
          })
        );
      }
    }
  }

  async getUserById(
    req: Request & {
      auth?: {
        access: string | JwtPayload;
      };
    },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
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
    } catch (error: any) {
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(
          new ApiError({
            statusCode: 500,
            message: ERRORS.SERVER_ERROR,
          })
        );
      }
    }
  }

  async logout(
    req: Request & { auth?: { access: string | JwtPayload } },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.auth?.access as { userId: string };

      // await this.service.logout({
      //   userId,
      // });

      res.clearCookie("accessToken");

      res.status(200).json({
        message: MESSAGES.USER_LOGGED_OUT,
        userId,
      });
    } catch (error: any) {
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(
          new ApiError({
            statusCode: 500,
            message: ERRORS.SERVER_ERROR,
          })
        );
      }
    }
  }
}

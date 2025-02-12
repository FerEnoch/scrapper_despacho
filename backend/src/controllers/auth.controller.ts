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

      const {
        userId,
        user: authUser,
        token,
      } = await this.service.register({
        user,
        pass,
      });

      /**
       * If token is generated
       * (i.e. user is forced to log in because he was already registered)
       * set it as a cookie
       */
      if (token) {
        res.cookie("accessToken", token, {
          secure: NODE_ENV === "production",
          httpOnly: true,
          sameSite: "strict",
          domain:
            NODE_ENV === "development" ? ".devtunnels.ms" : ".devtunnels.ms",
          maxAge: 24 * 60 * 60 * 1000,
        });
        res.status(201).json({
          message: MESSAGES.USER_LOGGED_IN,
          data: [{ userId, user: authUser }],
        });
        return;
      }

      res.status(201).json({
        message: MESSAGES.USER_REGISTERED,
        data: [{ userId, user: authUser }],
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

      const {
        userId,
        user: authUser,
        token,
      } = await this.service.login({
        user,
        pass,
      });

      res.cookie("accessToken", token, {
        secure: NODE_ENV === "production",
        httpOnly: true,
        sameSite: "strict",
        domain:
          NODE_ENV === "development" ? ".devtunnels.ms" : ".devtunnels.ms",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        message: MESSAGES.USER_LOGGED_IN,
        data: [{ userId, user: authUser }],
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
      const { userId, user } = await this.service.getUserById({
        userId: id,
      });

      res.status(200).json({
        message: MESSAGES.USER_SESSION_ACTIVE,
        data: [{ userId, user }],
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
      console.log("🚀 ~ AuthController ~ userId:", userId);

      // await this.service.logout({
      //   userId,
      // });

      res.clearCookie("accessToken");

      res.status(200).json({
        message: MESSAGES.USER_LOGGED_OUT,
        data: [{ userId, user: "" }],
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

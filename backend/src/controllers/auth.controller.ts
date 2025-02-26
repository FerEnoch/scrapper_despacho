import { NextFunction, Request, Response } from "express";
import { Auth } from "../schemas/auth";
import { IUserService } from "../sevices/types";
import { IAuthController } from "./types";
import { UserService } from "../sevices/user.service";
import { modelTypes } from "../types";
import { MESSAGES } from "./constants";
import { JwtPayload } from "jsonwebtoken";
import { setTokenCookie } from "../utils";
import { UserAuthData } from "../models/types";
import { ApiError } from "../errors/api-error";
import { ERRORS } from "../errors/types";
import chalk from "chalk";
import jwt from "jsonwebtoken";
const { TokenExpiredError } = jwt;

export class AuthController implements IAuthController {
  private userService: IUserService;

  constructor(private readonly databaseModel: modelTypes["IDatabaseModel"]) {
    this.userService = new UserService(databaseModel);
    this.revalidateAccessToken = this.revalidateAccessToken.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.verifyJwtMiddleware = this.verifyJwtMiddleware.bind(this);
    this.updateUserCredentials = this.updateUserCredentials.bind(this);
  }

  async revalidateAccessToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId, user, pass } = req.body;

      const { accessToken } = await this.userService.generateAccessToken({
        userId,
        user,
        pass,
      });

      setTokenCookie(res, {
        tokenKey: "accessToken",
        tokenValue: accessToken,
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days cookie expiration time
      });

      res.status(200).json({
        message: MESSAGES.USER_SESSION_ACTIVE,
        data: [{ userId, user, pass }],
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getUserById(
    req: Request & {
      auth?: { access: string | JwtPayload };
    },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const { access } = req.auth as {
        access: {
          user: string;
          pass: string;
        };
      };

      const { pass } = access;

      const { user } = await this.userService.getUserById({
        userId: id,
      });

      try {
        const { refreshToken } = await this.userService.getRefreshTokenById({
          userId: id,
        });
        await this.userService.verifyJwt({ token: refreshToken });
      } catch (error: any) {
        console.log(chalk.red(error.message));
        if (error instanceof TokenExpiredError) {
          console.log(chalk.blue("Expired REFRESH token - login again"));
          res.clearCookie("accessToken");
          throw new ApiError({
            statusCode: 401,
            message: ERRORS.REFRESH_TOKEN_EXPIRED,
          });
        } else {
          throw error;
        }
      }

      res.status(200).json({
        message: MESSAGES.USER_SESSION_ACTIVE,
        data: [{ userId: id, user, pass }],
      });
    } catch (error: any) {
      next(error);
    }
  }

  async login(
    req: Request & { auth?: { access: string | JwtPayload } },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, pass } = req.body as Auth;

      const { userId, accessToken } = await this.userService.login({
        user,
        pass,
      });

      if (!accessToken) {
        throw new ApiError({
          statusCode: 401,
          message: ERRORS.TOKEN_GENERATION_FAILED,
        });
      }

      setTokenCookie(res, {
        tokenKey: "accessToken",
        tokenValue: accessToken,
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days cookie expiration time
      });
      res.status(201).json({
        message: MESSAGES.USER_LOGGED_IN,
        data: [{ userId, user, pass }],
      });
    } catch (error: any) {
      next(error);
    }
  }

  async logout(
    req: Request & { auth?: { access: string | JwtPayload } },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { access } = req.auth as {
        access: {
          userId: string;
        };
      };

      const { userId } = access;

      res.clearCookie("accessToken");

      res.status(200).json({
        message: MESSAGES.USER_LOGGED_OUT,
        data: [{ userId }],
      });
    } catch (error: any) {
      next(error);
    }
  }

  async updateUserCredentials(
    req: Request & { auth?: { access: string | JwtPayload } },
    res: Response,
    next: NextFunction
  ) {
    try {
      let { userId } = req.auth?.access as UserAuthData;

      const { user: newUser, pass: newPass } = req.body as Auth;

      const { accessToken } = await this.userService.updateUserCredentials({
        userId,
        user: newUser,
        pass: newPass,
      });

      if (accessToken)
        setTokenCookie(res, {
          tokenKey: "accessToken",
          tokenValue: accessToken,
          maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days cookie expiration time
        });

      res.status(200).json({
        message: MESSAGES.USER_CREDENTIALS_UPDATED,
        data: [{ userId, user: newUser, pass: newPass }],
      });
    } catch (error: any) {
      next(error);
    }
  }

  async verifyJwtMiddleware(
    req: Request & {
      auth?: {
        access: string | JwtPayload;
      };
    },
    res: Response,
    next: NextFunction
  ) {
    let decoded;
    try {
      const accessToken: string = req.cookies.accessToken;

      if (!accessToken) {
        throw new ApiError({
          statusCode: 401,
          message: ERRORS.TOKEN_MISSING_ACCESS_DENIED,
        });
      }

      try {
        decoded = this.userService.verifyJwt({ token: accessToken });
      } catch (error: any) {
        console.log(chalk.red("accessToken token error: " + error.message));
        if (error instanceof TokenExpiredError) {
          console.log(
            chalk.red("Expired accessToken token - needs to regenerate")
          );
          res.clearCookie("accessToken");
          throw new ApiError({
            statusCode: 401,
            message: ERRORS.ACCESS_TOKEN_EXPIRED,
          });
        } else {
          throw error;
        }
      }

      req.auth = {
        access: decoded ?? {},
      };

      next();
    } catch (error: any) {
      next(error);
    }
  }
}

import { NextFunction, Request, Response } from "express";
import { Auth } from "../schemas/auth";
import { IUserService } from "../sevices/types";
import { IAuthController } from "./types";
import { UserService } from "../sevices/user.service";
import { modelTypes } from "../types";
import { MESSAGES } from "./constants";
import { JwtPayload } from "jsonwebtoken";
import { setAccessTokenCookie } from "../utils";
import { UserAuthData } from "../models/types";
import { ApiError } from "../errors/api-error";
import { ERRORS } from "../errors/types";
import chalk from "chalk";
import jwt from "jsonwebtoken";
const { TokenExpiredError } = jwt;

export class AuthController implements IAuthController {
  private service: IUserService;

  constructor(private readonly databaseModel: modelTypes["IDatabaseModel"]) {
    this.service = new UserService(databaseModel);
    // this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.verifyJwtMiddleware = this.verifyJwtMiddleware.bind(this);
    this.updateUserCredentials = this.updateUserCredentials.bind(this);
  }

  // async register(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<void> {
  //   try {
  // const { user, pass } = req.body as Auth;
  // const {
  //   userId,
  //   user: authUser,
  //   token,
  // } = await this.service.register({
  //   user,
  //   pass,
  // });
  // /**
  //  * If token is generated
  //  * (i.e. user is forced to login because he was already registered)
  //  * set it as a cookie
  //  */
  // if (token) {
  //   setAccessTokenCookie(res, token);
  //   res.status(201).json({
  //     message: MESSAGES.USER_LOGGED_IN,
  //     data: [{ userId, user: authUser, pass }],
  //   });
  //   return;
  // }
  // res.status(201).json({
  //   message: MESSAGES.USER_REGISTERED,
  //   data: [{ userId, user: authUser }],
  // });
  // } catch (error: any) {
  // next(error);
  // }
  // }

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

      if (!token) {
        throw new ApiError({
          statusCode: 401,
          message: ERRORS.TOKEN_GENERATION_FAILED,
        });
      }

      setAccessTokenCookie(res, token);
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
      const { userId, user, pass } = req.auth?.access as {
        userId: string;
        user: string;
        pass: string;
      };

      res.clearCookie("accessToken");

      res.status(200).json({
        message: MESSAGES.USER_LOGGED_OUT,
        data: [{ userId, user, pass }],
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
      let { userId /*user, pass*/ } = req.auth?.access as UserAuthData;

      const { user: newUser, pass: newPass } = req.body as Auth;

      const { token } = await this.service.updateUserCredentials({
        userId,
        user: newUser,
        pass: newPass,
      });

      if (token) setAccessTokenCookie(res, token);

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
    _res: Response,
    next: NextFunction
  ) {
    let decoded;

    try {
      const accessToken: string = req.cookies.accessToken;
      const { user, pass, userId } = req.body;

      if (!accessToken) {
        throw new ApiError({
          statusCode: 401,
          message: ERRORS.TOKEN_MISSING_ACCESS_DENIED,
        });
      }

      try {
        decoded = this.service.verifyJwt({ token: accessToken });
      } catch (error: any) {
        console.log(chalk.red(error.message));
        if (error instanceof TokenExpiredError) {
          // check refresh token
          const { refreshToken } = await this.service.getRefreshTokenById({
            userId,
          });
          try {
            decoded = this.service.verifyJwt({ token: refreshToken });
          } catch (error) {
            if (error instanceof TokenExpiredError) {
              console.log(chalk.red("Expired refresh token"));
              throw new ApiError({
                statusCode: 400,
                message: ERRORS.TOKEN_EXPIRED,
              });
            }
            throw error;
          }

          console.log(chalk.blue("Regenerating access token"));
          const { accessToken } = this.service.generateAccessToken({
            userId,
            user,
            pass,
          });
          decoded = accessToken;
        }
      }

      req.auth = {
        access: decoded ?? {},
      };

      next();
    } catch (error: any) {
      console.log(chalk.red(error.message));
      next(error);
    }
  }
}

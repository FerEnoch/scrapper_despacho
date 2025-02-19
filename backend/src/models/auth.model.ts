import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import {
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  JWT_SECRET,
} from "../config";
import { NextFunction, Response, Request } from "express";
import { ApiError } from "../errors/api-error";
import { ERRORS } from "../errors/types";
import { IAuthModel, UserAuthData } from "./types";
import ms from "ms";
import chalk from "chalk";
const { TokenExpiredError } = jwt;

export class AuthModel implements IAuthModel {
  private readonly JWT_SECRET: Secret;
  private readonly JWT_ACCESS_EXPIRES_IN: ms.StringValue;
  private readonly JWT_REFRESH_EXPIRES_IN: ms.StringValue;

  constructor() {
    this.JWT_SECRET = JWT_SECRET;
    this.JWT_ACCESS_EXPIRES_IN = JWT_ACCESS_EXPIRES_IN as ms.StringValue;
    this.JWT_REFRESH_EXPIRES_IN = JWT_REFRESH_EXPIRES_IN as ms.StringValue;
    this.generateAccessToken = this.generateAccessToken.bind(this);
    this.generateRefreshToken = this.generateRefreshToken.bind(this);
    this.verifyJwtMiddleware = this.verifyJwtMiddleware.bind(this);
    this.verifyJwt = this.verifyJwt.bind(this);
  }

  generateRefreshToken(userId: string) {
    try {
      const refresh = jwt.sign({ userId }, this.JWT_SECRET, {
        expiresIn: this.JWT_REFRESH_EXPIRES_IN,
      });
      return { refreshToken: refresh };
    } catch (error: any) {
      console.log(chalk.red(error.message));
      throw new ApiError({
        statusCode: 500,
        message: ERRORS.SERVER_ERROR,
      });
    }
  }

  generateAccessToken({ userId, user, pass }: UserAuthData): {
    accessToken: string;
  } {
    try {
      const access = jwt.sign({ userId, user, pass }, this.JWT_SECRET, {
        expiresIn: this.JWT_ACCESS_EXPIRES_IN,
      });

      return { accessToken: access };
    } catch (error: any) {
      console.log(chalk.red(error.message));
      throw new ApiError({
        statusCode: 500,
        message: ERRORS.TOKEN_GENERATION_FAILED,
      });
    }
  }

  verifyJwt({ token }: { token: string }) {
    const decoded = jwt.verify(token, this.JWT_SECRET);

    if (!decoded) {
      throw new ApiError({
        statusCode: 400,
        message: ERRORS.INVALID_TOKEN,
      });
    }

    return decoded;
  }

  verifyJwtMiddleware(
    req: Request & {
      auth?: {
        access: string | JwtPayload;
      };
    },
    _res: Response,
    next: NextFunction
  ) {
    try {
      const accessToken: string = req.cookies.accessToken;
      const { user, pass, userId } = req.body;

      if (!accessToken) {
        throw new ApiError({
          statusCode: 401,
          message: ERRORS.TOKEN_MISSING_ACCESS_DENIED,
        });
      }

      let decoded;
      try {
        decoded = this.verifyJwt({ token: accessToken });
      } catch (error: any) {
        console.log(chalk.red(error.message));
        if (error instanceof TokenExpiredError) {
          const { accessToken } = this.generateAccessToken({
            userId,
            user,
            pass,
          });
          decoded = this.verifyJwt({ token: accessToken });
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

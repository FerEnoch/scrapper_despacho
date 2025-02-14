import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import {
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  JWT_SECRET,
} from "../config";
import { NextFunction, Response, Request } from "express";
import { ApiError } from "../errors/api-error";
import { ERRORS } from "../errors/types";
import { IAuthModel } from "./types";
import ms from "ms";

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
      throw new ApiError({
        statusCode: 500,
        message: ERRORS.SERVER_ERROR,
      });
    }
  }

  generateAccessToken({
    userId,
    user,
    pass,
  }: {
    userId: string;
    user: string;
    pass: string;
  }): {
    accessToken: string;
  } {
    try {
      const access = jwt.sign({ userId, user, pass }, this.JWT_SECRET, {
        expiresIn: this.JWT_ACCESS_EXPIRES_IN,
      });

      return { accessToken: access };
    } catch (error: any) {
      throw new ApiError({
        statusCode: 500,
        message: ERRORS.TOKEN_GENERATION_FAILED,
      });
    }
  }

  verifyJwt({ token }: { token: string }) {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET);

      if (!decoded) {
        throw new ApiError({
          statusCode: 400,
          message: ERRORS.INVALID_TOKEN,
        });
      }

      return decoded;
    } catch (error: any) {
      throw new ApiError({
        statusCode: 500,
        message: ERRORS.SERVER_ERROR,
      });
    }
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
      const accessToken = req.cookies.accessToken;

      if (!accessToken) {
        throw new ApiError({
          statusCode: 401,
          message: ERRORS.TOKEN_MISSING_ACCESS_DENIED,
        });
      }

      const decoded = jwt.verify(accessToken, this.JWT_SECRET);

      if (!decoded) {
        throw new ApiError({ statusCode: 401, message: ERRORS.INVALID_TOKEN });
      }

      req.auth = {
        access: decoded,
      };

      next();
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

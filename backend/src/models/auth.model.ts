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
  private readonly jwtSecret: Secret;
  private readonly jwtAccessExpiresIn: ms.StringValue;
  private readonly jwtRefreshExpiresIn: ms.StringValue;

  constructor() {
    this.jwtSecret = JWT_SECRET;
    this.jwtAccessExpiresIn = JWT_ACCESS_EXPIRES_IN as ms.StringValue;
    this.jwtRefreshExpiresIn = JWT_REFRESH_EXPIRES_IN as ms.StringValue;
    this.generateAccessToken = this.generateAccessToken.bind(this);
    this.generateRefreshToken = this.generateRefreshToken.bind(this);
    this.verifyJwt = this.verifyJwt.bind(this);
  }

  generateRefreshToken(userId: string) {
    try {
      const refresh = jwt.sign({ userId }, this.jwtSecret, {
        expiresIn: this.jwtRefreshExpiresIn,
      });
      return { refreshToken: refresh };
    } catch (error: any) {
      throw new ApiError({
        statusCode: 500,
        message: ERRORS.SERVER_ERROR,
      });
    }
  }

  generateAccessToken(userId: string): {
    accessToken: string;
  } {
    try {
      const access = jwt.sign({ userId }, this.jwtSecret, {
        expiresIn: this.jwtAccessExpiresIn,
      });

      return { accessToken: access };
    } catch (error: any) {
      throw new ApiError({
        statusCode: 500,
        message: ERRORS.TOKEN_GENERATION_FAILED,
      });
    }
  }

  verifyJwt(
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

      const decoded = jwt.verify(accessToken, this.jwtSecret);

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

  verifyRefreshToken({ refreshToken }: { refreshToken: string }) {
    try {
      const decoded = jwt.verify(refreshToken, this.jwtSecret);

      if (!decoded) {
        throw new ApiError({ statusCode: 401, message: ERRORS.TOKEN_EXPIRED });
      }

      return decoded;
    } catch (error: any) {
      throw new ApiError({
        statusCode: error?.message ? 401 : 500,
        message: error?.message ?? ERRORS.SERVER_ERROR,
      });
    }
  }
}

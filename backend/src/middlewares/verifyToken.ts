import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { NextFunction, Response, Request } from "express";
import { ApiError } from "../errors/api-error";
import { ERRORS } from "../errors/types";

export async function verifyToken(
  req: Request & {
    auth?: {
      access: string | jwt.JwtPayload;
      refresh: string | jwt.JwtPayload;
    };
  },
  _res: Response,
  next: NextFunction
) {
  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken || !refreshToken) {
      throw new ApiError({
        statusCode: 401,
        message: ERRORS.TOKEN_NOT_PROVIDED,
      });
    }

    const access = jwt.verify(accessToken, JWT_SECRET);
    const refresh = jwt.verify(refreshToken, JWT_SECRET);

    req.auth = {
      access,
      refresh,
    };

    next();
  } catch (error) {
    throw new ApiError({ statusCode: 401, message: ERRORS.INVALID_TOKEN });
  }
}

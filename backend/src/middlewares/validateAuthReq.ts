import { Request, Response, NextFunction } from "express";
import { ApiError } from "../errors/api-error";
import { ERRORS } from "../errors/types";
import { ZodSchema } from "zod";
import chalk from "chalk";

export const validateAuthReq =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      const { user, pass } = req.body;

      if (!user || !pass) {
        throw new ApiError({
          statusCode: 400,
          message: ERRORS.CREDENTIALS_NOT_PROVIDED,
        });
      }

      schema.parse({
        user,
        pass,
      });

      next();
    } catch (error: any) {
      console.log(chalk.red(`${error.message}`));
      throw new ApiError({
        statusCode: 400,
        message: ERRORS.INVALID_CREDENTIALS,
        data: [],
      });
    }
  };

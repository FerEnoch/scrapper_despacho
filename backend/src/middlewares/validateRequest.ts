import { Request, Response, NextFunction } from "express";
import { ApiError } from "../errors/api-error";
import { ERRORS } from "../errors/types";
import { ZodSchema } from "zod";

export const validateRequest =
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
      throw new ApiError({
        statusCode: 400,
        message: error.errors?.[0].message ?? ERRORS.INVALID_CREDENTIALS,
        data: error?.errors ?? [],
      });
    }
  };

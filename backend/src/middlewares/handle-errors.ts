import { Request, Response, NextFunction } from "express";
import { ERRORS } from "../errors/types";
import { ApiError } from "../errors/api-error";

function handle404Error(_req: Request, res: Response, _next: NextFunction) {
  res.status(404).json({ message: ERRORS.NOT_FOUND });
}

function handleGlobalError(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json(err);
    return;
  }

  res.status(500).json({ message: ERRORS.SERVER_ERROR });
}

export { handle404Error, handleGlobalError };

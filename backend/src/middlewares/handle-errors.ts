import { Request, Response, NextFunction } from "express";
import { ERRORS } from "../errors/types";
import { ApiError } from "../errors/api-error";
import chalk from "chalk";

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
    res.status(err.statusCode).json({
      message: err.message,
      data: err.data || null,
    });
    return;
  }

  console.error(
    chalk.red.bold(" :::: Encountered an API unhandled error:"),
    err
  );
  res.status(500).json({ message: ERRORS.SERVER_ERROR });
}

export { handle404Error, handleGlobalError };

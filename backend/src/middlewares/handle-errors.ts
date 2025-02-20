import { Request, Response, NextFunction } from "express";
import { ERRORS } from "../errors/types";
import { ApiError } from "../errors/api-error";
import chalk from "chalk";

function handle404Error(_req: Request, res: Response, _next: NextFunction) {
  res.status(404).json({ message: ERRORS.NOT_FOUND });
}

function handleGlobalError(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.log(chalk.red("[ERROR]"));
  console.log(chalk.yellow(`${err.message} in ${req.originalUrl}`));
  console.log("Params ->");
  console.log(chalk.yellow(`${JSON.stringify(req.body)}`));

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      message: err.message,
      data: err.data || null,
    });
    return;
  }

  res.status(500).json({ message: ERRORS.SERVER_ERROR });
}

export { handle404Error, handleGlobalError };

export class ApiError extends Error {
  public statusCode: number;
  public data?: any[];
  
  constructor({
    statusCode,
    message,
    data
  }: {
    statusCode: number;
    message: string;
    data?: any[];
  }) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}

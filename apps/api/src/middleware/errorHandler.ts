import { Request, Response, NextFunction } from 'express';

type AsyncHandler<Req extends Request = Request> = (
  req: Req,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

export const catchAsync = <Req extends Request = Request>(fn: AsyncHandler<Req>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as Req, res, next)).catch(next);
  };
};

interface AppError extends Error {
  statusCode?: number;
}

export const globalErrorHandler = (err: AppError, req: Request, res: Response, _next: NextFunction) => {
  console.error(`[ERROR] ${req.method} ${req.path} >>`, err.message || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

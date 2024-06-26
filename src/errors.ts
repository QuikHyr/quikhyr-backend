import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    res.status(err.statusCode).json({ message: err.message });
  } else {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class RequiredFieldError extends ValidationError {
  constructor(field: string) {
    super(`Field '${field}' is required.`);
    this.name = "RequiredFieldError";
  }
}

export class UnsupportedFieldError extends ValidationError {
  constructor(field: string) {
    super(`Field '${field}' is not supported.`);
    this.name = "UnsupportedFieldError";
  }
}

export class AutoGeneratedFieldError extends ValidationError {
  constructor(field: string) {
    super(`Field '${field}' is auto-generated.`);
    this.name = "AutoGeneratedFieldError";
  }
}

export class StringFieldError extends ValidationError {
  constructor(field: string) {
    super(`Field '${field}' must be a string.`);
    this.name = "StringFieldError";
  }
}

export class NumberFieldError extends ValidationError {
  constructor(field: string) {
    super(`Field '${field}' must be a number.`);
    this.name = "NumberFieldError";
  }
}

export class BooleanFieldError extends ValidationError {
  constructor(field: string) {
    super(`Field '${field}' must be a boolean.`);
    this.name = "BooleanFieldError";
  }
}

export class ISO8601StringError extends ValidationError {
  constructor(field: string) {
    super(`Field '${field}' must be in ISO 8601 string format.`);
    this.name = "ISO8601StringError";
  }
}

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
    super(`Field "${field}" is required.`);
    this.name = "RequiredFieldError";
  }
}

export class StringFieldError extends ValidationError {
  constructor(field: string) {
    super(`Field "${field}" must be a string.`);
    this.name = "StringFieldError";
  }
}

export class NumberFieldError extends ValidationError {
  constructor(field: string) {
    super(`Field "${field}" must be a number.`);
    this.name = "NumberFieldError";
  }
}

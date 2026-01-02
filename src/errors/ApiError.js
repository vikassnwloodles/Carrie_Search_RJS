export class ApiError extends Error {
  constructor(message, statusCode, errorCode, details) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}

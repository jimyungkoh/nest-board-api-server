import { ErrorCodes } from './error-code';

export class ServiceException extends Error {
  readonly errorCode: ErrorCodes;

  constructor(errorCode: ErrorCodes) {
    super(errorCode.message);
    this.errorCode = errorCode;
  }

  getStatus() {
    return this.errorCode.status;
  }

  get message() {
    return this.errorCode.message;
  }
}

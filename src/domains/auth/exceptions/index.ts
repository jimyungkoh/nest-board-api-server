import { ErrorCodes } from 'src/common/errors/error-code';
import { ServiceException } from 'src/common/errors/service-exception';

export class UserAlreadyExistsException extends ServiceException {
  constructor() {
    super(ErrorCodes.USER_ALREADY_EXISTS);
  }
}

export class EmailOrPasswordMismatchException extends ServiceException {
  constructor() {
    super(ErrorCodes.EMAIL_OR_PASSWORD_MISMATCH);
  }
}

export class TokenExpiredException extends ServiceException {
  constructor() {
    super(ErrorCodes.TOKEN_EXPIRED);
  }
}

export class LoginRequiredException extends ServiceException {
  constructor() {
    super(ErrorCodes.LOGIN_REQUIRED);
  }
}

export class InvalidTokenSignatureException extends ServiceException {
  constructor() {
    super(ErrorCodes.INVALID_TOKEN_SIGNATURE);
  }
}

export class UserNotFoundException extends ServiceException {
  constructor() {
    super(ErrorCodes.USER_NOT_FOUND);
  }
}

export class PermissionDeniedException extends ServiceException {
  constructor() {
    super(ErrorCodes.PERMISSION_DENIED);
  }
}

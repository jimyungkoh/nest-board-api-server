import { ErrorCodes } from 'src/common/errors/error-code';
import { ServiceException } from 'src/common/errors/service-exception';

export class PostNotFoundException extends ServiceException {
  constructor() {
    super(ErrorCodes.POST_NOT_FOUND);
  }
}

export class OnlyAuthorCanAccessException extends ServiceException {
  constructor() {
    super(ErrorCodes.ONLY_AUTHOR_CAN_ACCESS);
  }
}

export class OnlyAdminCanAccessException extends ServiceException {
  constructor() {
    super(ErrorCodes.ONLY_ADMIN_CAN_ACCESS);
  }
}

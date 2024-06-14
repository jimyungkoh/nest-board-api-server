import { ErrorCodes } from 'src/common/errors/error-code';
import { ServiceException } from 'src/common/errors/service-exception';

export class CategoryAlreadyExistsException extends ServiceException {
  constructor() {
    super(ErrorCodes.CATEGORY_ALREADY_EXISTS);
  }
}

export class CategoryNotFoundException extends ServiceException {
  constructor() {
    super(ErrorCodes.CATEGORY_NOT_FOUND);
  }
}

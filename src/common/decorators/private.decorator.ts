import { SetMetadata } from '@nestjs/common';
import { TAccount } from '../types';

export const PRIVATE_DECORATOR_KEY = 'accountType';

export const Private = (accountTypes: TAccount[] | TAccount) =>
  SetMetadata(PRIVATE_DECORATOR_KEY, accountTypes);

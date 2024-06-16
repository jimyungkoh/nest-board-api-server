import { TResponse } from '../types';

const formatResponse = <T>(
  success: boolean,
  result: T,
  message: string | object,
): TResponse<T> => {
  return {
    success,
    result: success ? result : null,
    message: success ? null : message ?? '에러가 발생했습니다.',
  } as TResponse<T>;
};

export default formatResponse;

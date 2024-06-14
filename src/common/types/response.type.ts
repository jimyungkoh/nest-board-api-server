export type TResponse<T> =
  | {
      success: true;
      result: T;
      message: null;
    }
  | {
      success: false;
      result: null;
      message: string;
    };

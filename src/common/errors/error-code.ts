export class ErrorCodes {
  constructor(
    readonly status: number,
    readonly message: string,
  ) {
    this.status = status;
    this.message = message;
  }

  // 카테고리 관련 에러
  static readonly CATEGORY_ALREADY_EXISTS = new ErrorCodes(
    400,
    '이미 존재하는 카테고리입니다.',
  );

  static readonly CATEGORY_NOT_FOUND = new ErrorCodes(
    404,
    '카테고리를 찾을 수 없습니다.',
  );

  // 게시글 관련 에러
  static readonly POST_NOT_FOUND = new ErrorCodes(
    404,
    '게시글을 찾을 수 없습니다.',
  );
}

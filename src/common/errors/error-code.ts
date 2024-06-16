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

  static readonly ONLY_AUTHOR_CAN_ACCESS = new ErrorCodes(
    403,
    '작성자만 접근할 수 있습니다.',
  );

  static readonly ONLY_ADMIN_CAN_ACCESS = new ErrorCodes(
    403,
    '관리자만 접근할 수 있습니다.',
  );

  // 인증 관련 에러
  static readonly USER_ALREADY_EXISTS = new ErrorCodes(
    400,
    '이미 존재하는 사용자입니다.',
  );

  static readonly EMAIL_OR_PASSWORD_MISMATCH = new ErrorCodes(
    401,
    '이메일 또는 패스워드가 일치하지 않습니다.',
  );
  static readonly TOKEN_EXPIRED = new ErrorCodes(401, '토큰이 만료되었습니다.');
  static readonly INVALID_TOKEN_SIGNATURE = new ErrorCodes(
    401,
    '유효하지 않은 토큰 서명입니다.',
  );

  static readonly USER_NOT_FOUND = new ErrorCodes(
    404,
    '사용자를 찾을 수 없습니다.',
  );

  static readonly REFRESH_TOKEN_NOT_FOUND = new ErrorCodes(
    404,
    '리프레시 토큰을 찾을 수 없습니다.',
  );

  static readonly LOGIN_REQUIRED = new ErrorCodes(
    401,
    '로그인이 후 이용해주세요.',
  );

  static readonly PERMISSION_DENIED = new ErrorCodes(
    403,
    '접근 권한이 없습니다.',
  );
}

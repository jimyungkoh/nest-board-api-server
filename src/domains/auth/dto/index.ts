import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({ example: 'user@example.com', description: '사용자 이메일' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: '사용자 비밀번호' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'username', description: '사용자 이름' })
  @IsString()
  @IsNotEmpty()
  username: string;
}

export class SignInDto {
  @ApiProperty({ example: 'user@example.com', description: '사용자 이메일' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: '사용자 비밀번호' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: '1:1문의', description: '카테고리 이름' })
  @IsString()
  @IsNotEmpty()
  categoryName: string;

  @ApiProperty({ example: '1:1문의 남깁니다.', description: '게시물 제목' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: '1:1문의 남깁니다.',
    description: '게시물 내용',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class UpdatePostDto extends PartialType(CreatePostDto) {}

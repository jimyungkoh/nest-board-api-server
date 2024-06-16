import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Private } from 'src/common/decorators/private.decorator';
import { DUser } from 'src/common/decorators/user-data.decorator';
import { User } from '../users/entities';
import { CreateCommentDto, UpdateCommentDto } from './comment/\bdto';
import { CommentsService } from './comment/comments.service';
import { CreatePostDto, UpdatePostDto } from './dto';
import { PostsService } from './posts.service';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {}

  @Post()
  @ApiCookieAuth()
  @Private(['user', 'admin'])
  @UseInterceptors(FilesInterceptor('images'))
  @ApiOperation({ summary: '게시물 생성' })
  @ApiResponse({ status: 201, description: '게시물 생성 성공' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreatePostDto })
  async createPost(
    @UploadedFiles() images: Array<Express.Multer.File>,
    @Body() createPostDto: CreatePostDto,
    @DUser() user: User,
  ) {
    const result = await this.postsService.createPost(
      createPostDto,
      user,
      images,
    );
    return result;
  }

  @Get('search')
  @ApiOperation({ summary: '게시물 검색' })
  @ApiResponse({ status: 200, description: '게시물 검색 성공' })
  async searchPosts(
    @Query('title') title?: string,
    @Query('username') username?: string,
  ) {
    const searchCriteria = { title, username };
    return this.postsService.searchPosts(searchCriteria);
  }

  @Get()
  @ApiOperation({ summary: '게시물 조회' })
  @ApiResponse({ status: 200, description: '게시물 조회 성공' })
  async getPosts(
    @Query('sort') sort: 'latest' | 'popular' = 'latest',
    @Query('period') period: 'all' | 'year' | 'month' | 'week' = 'all',
  ) {
    if (sort === 'latest') {
      return this.postsService.getLatestPosts();
    } else if (sort === 'popular') {
      return this.postsService.getPopularPosts(period);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: '게시물 조회' })
  @ApiResponse({ status: 200, description: '게시물 조회 성공' })
  async getPostById(@Param('id') id: number) {
    return this.postsService.getPostById(id);
  }

  @Put(':id')
  @ApiCookieAuth()
  @Private(['user', 'admin'])
  @UseInterceptors(FilesInterceptor('images'))
  @ApiOperation({ summary: '게시물 수정' })
  @ApiResponse({ status: 200, description: '게시물 수정 성공' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdatePostDto })
  async updatePost(
    @UploadedFiles() images: Array<Express.Multer.File>,
    @Param('id') id: number,
    @Body() updatePostDto: UpdatePostDto,
    @DUser() user: User,
  ) {
    return this.postsService.updatePost(id, updatePostDto, user, images);
  }

  @Delete(':id')
  @ApiCookieAuth()
  @Private(['user', 'admin'])
  @ApiOperation({ summary: '게시물 삭제' })
  @ApiResponse({ status: 200, description: '게시물 삭제 성공' })
  async deletePost(@Param('id') id: number, @DUser() user: User) {
    await this.postsService.deletePost(id, user);
  }

  @Post(':id/comments')
  @ApiCookieAuth()
  @Private(['user', 'admin'])
  @ApiOperation({ summary: '게시물에 댓글 생성' })
  @ApiResponse({ status: 201, description: '게시물에 댓글 생성 성공' })
  @ApiBody({ type: CreateCommentDto })
  async createComment(
    @Param('id') postId: number,
    @Body() createCommentDto: CreateCommentDto,
    @DUser() user: User,
  ) {
    return this.commentsService.createComment(postId, createCommentDto, user);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: '게시물에 댓글 조회' })
  @ApiResponse({ status: 200, description: '게시물에 댓글 조회 성공' })
  async getCommentsByPostId(@Param('id') postId: number) {
    return this.commentsService.getCommentsByPostId(postId);
  }

  @Put('comments/:id')
  @ApiCookieAuth()
  @Private(['user', 'admin'])
  @ApiOperation({ summary: '댓글 수정' })
  @ApiResponse({ status: 200, description: '댓글 수정 성공' })
  @ApiBody({ type: UpdateCommentDto })
  async updateComment(
    @Param('id') commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @DUser() user: User,
  ) {
    return this.commentsService.updateComment(
      commentId,
      updateCommentDto,
      user,
    );
  }

  @Delete('comments/:id')
  @ApiCookieAuth()
  @Private(['user', 'admin'])
  @ApiOperation({ summary: '댓글 삭제' })
  @ApiResponse({ status: 200, description: '댓글 삭제 성공' })
  async deleteComment(@Param('id') commentId: number, @DUser() user: User) {
    await this.commentsService.deleteComment(commentId, user);
  }

  @Post('comments/:id/replies')
  @ApiCookieAuth()
  @Private(['user', 'admin'])
  @ApiOperation({ summary: '대댓글 생성' })
  @ApiResponse({ status: 201, description: '대댓글 생성 성공' })
  @ApiBody({ type: CreateCommentDto })
  async createReply(
    @Param('id') commentId: number,
    @Body() createCommentDto: CreateCommentDto,
    @DUser() user: User,
  ) {
    return this.commentsService.createReply(commentId, createCommentDto, user);
  }
}

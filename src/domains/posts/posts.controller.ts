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
import { Private } from 'src/common/decorators/private.decorator';
import { DUser } from 'src/common/decorators/user-data.decorator';
import { User } from '../users/entities';
import { CreateCommentDto, UpdateCommentDto } from './comment/\bdto';
import { CommentsService } from './comment/comments.service';
import { CreatePostDto, UpdatePostDto } from './dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {}

  @Post()
  @Private(['user', 'admin'])
  @UseInterceptors(FilesInterceptor('images'))
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
  async searchPosts(
    @Query('title') title?: string,
    @Query('username') username?: string,
  ) {
    const searchCriteria = { title, username };
    return this.postsService.searchPosts(searchCriteria);
  }

  /**
   * @title 게시글 조회
   * @description
   * - 최신순
   * - 인기순(조회순) - 전체기간, 일년, 한달, 일주일 기준
   * @returns 게시글 목록
   */
  @Get()
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

  @Post()
  @Private(['user', 'admin'])
  @UseInterceptors(FilesInterceptor('images'))
  async createNotice(
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

  @Get(':id')
  async getPostById(@Param('id') id: number) {
    return this.postsService.getPostById(id);
  }

  @Put(':id')
  @Private(['user', 'admin'])
  @UseInterceptors(FilesInterceptor('images'))
  async updatePost(
    @UploadedFiles() images: Array<Express.Multer.File>,
    @Param('id') id: number,
    @Body() updatePostDto: UpdatePostDto,
    @DUser() user: User,
  ) {
    return this.postsService.updatePost(id, updatePostDto, user, images);
  }

  @Delete(':id')
  @Private(['user', 'admin'])
  async deletePost(@Param('id') id: number, @DUser() user: User) {
    await this.postsService.deletePost(id, user);
  }

  @Post(':id/comments')
  @Private(['user', 'admin'])
  async createComment(
    @Param('id') postId: number,
    @Body() createCommentDto: CreateCommentDto,
    @DUser() user: User,
  ) {
    return this.commentsService.createComment(postId, createCommentDto, user);
  }

  @Get(':id/comments')
  async getCommentsByPostId(@Param('id') postId: number) {
    return this.commentsService.getCommentsByPostId(postId);
  }

  @Put('comments/:id')
  @Private(['user', 'admin'])
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
  @Private(['user', 'admin'])
  async deleteComment(@Param('id') commentId: number, @DUser() user: User) {
    await this.commentsService.deleteComment(commentId, user);
  }

  @Post('comments/:id/replies')
  @Private(['user', 'admin'])
  async createReply(
    @Param('id') commentId: number,
    @Body() createCommentDto: CreateCommentDto,
    @DUser() user: User,
  ) {
    return this.commentsService.createReply(commentId, createCommentDto, user);
  }
}

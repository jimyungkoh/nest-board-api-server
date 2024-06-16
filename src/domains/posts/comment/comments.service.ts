import { Injectable } from '@nestjs/common';
import { User } from 'src/domains/users/entities/user.entity';
import { OnlyAuthorCanAccessException } from '../exceptions';
import { CreateCommentDto, UpdateCommentDto } from './\bdto';
import { CommentsRepository } from './comments.repository';

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async createComment(
    postId: number,
    createCommentDto: CreateCommentDto,
    user: User,
  ) {
    return this.commentsRepository.createComment(
      postId,
      createCommentDto,
      user,
    );
  }

  async getCommentsByPostId(postId: number) {
    return this.commentsRepository.findCommentsByPostId(postId);
  }

  async updateComment(
    commentId: number,
    updateCommentDto: UpdateCommentDto,
    user: User,
  ) {
    const comment = await this.commentsRepository.findCommentById(commentId);

    if (comment.author.id !== user.id) throw new OnlyAuthorCanAccessException();

    return this.commentsRepository.updateComment(commentId, updateCommentDto);
  }

  async deleteComment(commentId: number, user: User) {
    const comment = await this.commentsRepository.findCommentById(commentId);

    if (comment.author.id !== user.id) throw new OnlyAuthorCanAccessException();

    await this.commentsRepository.softDeleteComment(commentId);
  }

  async createReply(
    commentId: number,
    createCommentDto: CreateCommentDto,
    user: User,
  ) {
    return this.commentsRepository.createReply(
      commentId,
      createCommentDto,
      user,
    );
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/domains/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async createComment(
    postId: number,
    comment: Partial<Comment>,
    user: User,
  ): Promise<Comment> {
    const post = await this.postsRepository.findOne({ where: { id: postId } });
    const newComment = this.commentsRepository.create({
      ...comment,
      author: user,
      post,
    });
    return this.commentsRepository.save(newComment);
  }

  async findCommentById(id: number): Promise<Comment> {
    return this.commentsRepository.findOne({
      where: { id },
      relations: ['author', 'post'],
    });
  }

  async findCommentsByPostId(postId: number): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { post: { id: postId } },
      relations: ['author', 'childComments', 'childComments.author'],
    });
  }

  async updateComment(id: number, comment: Partial<Comment>): Promise<Comment> {
    await this.commentsRepository.update(id, comment);
    return this.findCommentById(id);
  }

  async softDeleteComment(id: number): Promise<void> {
    await this.commentsRepository.softDelete(id);
  }

  async createReply(
    commentId: number,
    reply: Partial<Comment>,
    user: User,
  ): Promise<Comment> {
    const parentComment = await this.findCommentById(commentId);
    const newReply = this.commentsRepository.create({
      ...reply,
      author: user,
      post: parentComment.post,
      parentComment,
    });
    return this.commentsRepository.save(newReply);
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../entities';
import { CommentsRepository } from './comments.repository';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';

@Module({
  providers: [CommentsService, CommentsRepository],
  imports: [TypeOrmModule.forFeature([Comment, Post])],
  exports: [CommentsService],
})
export class CommentsModule {}

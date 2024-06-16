import { Test, TestingModule } from '@nestjs/testing';
import { User } from 'src/domains/users/entities/user.entity';
import { CreateCommentDto, UpdateCommentDto } from '../\bdto';
import { OnlyAuthorCanAccessException } from '../../exceptions';
import { CommentsRepository } from '../comments.repository';
import { CommentsService } from '../comments.service';
import { Comment } from '../entities';

describe('CommentsService', () => {
  let commentsService: CommentsService;
  let commentsRepository: CommentsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: CommentsRepository,
          useValue: {
            createComment: jest.fn(),
            findCommentsByPostId: jest.fn(),
            findCommentById: jest.fn(),
            updateComment: jest.fn(),
            softDeleteComment: jest.fn(),
            createReply: jest.fn(),
          },
        },
      ],
    }).compile();

    commentsService = module.get<CommentsService>(CommentsService);
    commentsRepository = module.get<CommentsRepository>(CommentsRepository);
  });

  describe('createComment', () => {
    it('should create a new comment', async () => {
      const postId = 1;
      const createCommentDto: CreateCommentDto = { content: 'Test comment' };
      const user: User = { id: 1 } as User;
      const createdComment = {
        id: 1,
        ...createCommentDto,
        author: user,
      } as Comment;

      jest
        .spyOn(commentsRepository, 'createComment')
        .mockResolvedValueOnce(createdComment);

      const result = await commentsService.createComment(
        postId,
        createCommentDto,
        user,
      );

      expect(commentsRepository.createComment).toHaveBeenCalledWith(
        postId,
        createCommentDto,
        user,
      );
      expect(result).toEqual(createdComment);
    });
  });

  describe('getCommentsByPostId', () => {
    it('should get comments by post id', async () => {
      const postId = 1;
      const comments = [
        { id: 1, content: 'Comment 1' },
        { id: 2, content: 'Comment 2' },
      ] as Comment[];

      jest
        .spyOn(commentsRepository, 'findCommentsByPostId')
        .mockResolvedValueOnce(comments);

      const result = await commentsService.getCommentsByPostId(postId);

      expect(commentsRepository.findCommentsByPostId).toHaveBeenCalledWith(
        postId,
      );
      expect(result).toEqual(comments);
    });
  });

  describe('updateComment', () => {
    it('should update a comment', async () => {
      const commentId = 1;
      const updateCommentDto: UpdateCommentDto = { content: 'Updated comment' };
      const user: User = { id: 1 } as User;
      const comment = {
        id: commentId,
        content: 'Test comment',
        author: user,
      } as Comment;
      const updatedComment = { id: commentId, ...updateCommentDto } as Comment;

      jest
        .spyOn(commentsRepository, 'findCommentById')
        .mockResolvedValueOnce(comment);
      jest
        .spyOn(commentsRepository, 'updateComment')
        .mockResolvedValueOnce(updatedComment);

      const result = await commentsService.updateComment(
        commentId,
        updateCommentDto,
        user,
      );

      expect(commentsRepository.findCommentById).toHaveBeenCalledWith(
        commentId,
      );
      expect(commentsRepository.updateComment).toHaveBeenCalledWith(
        commentId,
        updateCommentDto,
      );
      expect(result).toEqual(updatedComment);
    });

    it('should throw OnlyAuthorCanAccessException if user is not the author', async () => {
      const commentId = 1;
      const updateCommentDto: UpdateCommentDto = { content: 'Updated comment' };
      const user: User = { id: 1 } as User;
      const comment = {
        id: commentId,
        content: 'Test comment',
        author: { id: 2 },
      } as Comment;

      jest
        .spyOn(commentsRepository, 'findCommentById')
        .mockResolvedValueOnce(comment);

      await expect(
        commentsService.updateComment(commentId, updateCommentDto, user),
      ).rejects.toThrow(OnlyAuthorCanAccessException);
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment', async () => {
      const commentId = 1;
      const user: User = { id: 1 } as User;
      const comment = {
        id: commentId,
        content: 'Test comment',
        author: user,
      } as Comment;

      jest
        .spyOn(commentsRepository, 'findCommentById')
        .mockResolvedValueOnce(comment);
      jest
        .spyOn(commentsRepository, 'softDeleteComment')
        .mockResolvedValueOnce();

      await commentsService.deleteComment(commentId, user);

      expect(commentsRepository.findCommentById).toHaveBeenCalledWith(
        commentId,
      );
      expect(commentsRepository.softDeleteComment).toHaveBeenCalledWith(
        commentId,
      );
    });

    it('should throw OnlyAuthorCanAccessException if user is not the author', async () => {
      const commentId = 1;
      const user: User = { id: 1 } as User;
      const comment = {
        id: commentId,
        content: 'Test comment',
        author: { id: 2 },
      } as Comment;

      jest
        .spyOn(commentsRepository, 'findCommentById')
        .mockResolvedValueOnce(comment);

      await expect(
        commentsService.deleteComment(commentId, user),
      ).rejects.toThrow(OnlyAuthorCanAccessException);
    });
  });

  describe('createReply', () => {
    it('should create a reply', async () => {
      const commentId = 1;
      const createCommentDto: CreateCommentDto = { content: 'Test reply' };
      const user: User = { id: 1 } as User;
      const createdReply = {
        id: 2,
        ...createCommentDto,
        author: user,
      } as Comment;

      jest
        .spyOn(commentsRepository, 'createReply')
        .mockResolvedValueOnce(createdReply);

      const result = await commentsService.createReply(
        commentId,
        createCommentDto,
        user,
      );

      expect(commentsRepository.createReply).toHaveBeenCalledWith(
        commentId,
        createCommentDto,
        user,
      );
      expect(result).toEqual(createdReply);
    });
  });
});

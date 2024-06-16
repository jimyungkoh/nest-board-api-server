import { TAccount } from 'src/common/types';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';
import { Comment } from '../../posts/comment/entities/comment.entity';
import { Post } from '../../posts/entities/post.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @Column({ default: 'user' })
  role: TAccount;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Post, (post) => post.author, { nullable: true })
  posts?: Post[];

  @OneToMany(() => Comment, (comment) => comment.author, { nullable: true })
  comments?: Comment[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user, {
    nullable: true,
  })
  refreshTokens?: RefreshToken[];
}

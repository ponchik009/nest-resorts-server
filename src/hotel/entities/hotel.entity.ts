import User from 'src/user/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { Tag } from './tag.entity';

@Entity()
export class Hotel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  country: string;

  @Column()
  stars: number;

  @Column()
  price: number;

  @ManyToMany((type) => User, (user) => user.likes, { onDelete: 'CASCADE' })
  likes: User[];

  @Column()
  image: string;

  @Column('text')
  description: string;

  @ManyToMany((type) => Tag, (tag) => tag.hotels, {
    cascade: true,
  })
  @JoinTable()
  tags: Tag[];
}

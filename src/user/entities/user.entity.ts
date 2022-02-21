import { Hotel } from 'src/hotel/entities/hotel.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
class User {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ unique: true })
  public email: string;

  @Column({ unique: true, nullable: true })
  public username: string;

  @Column({ nullable: true })
  public password: string;

  @Column({ default: false })
  public isAdmin: boolean;

  @Column()
  public verificationCode: string;

  @Column({ default: false })
  public isVerif: boolean;

  @ManyToMany((type) => Hotel, (hotel) => hotel.likes, {
    cascade: true,
  })
  @JoinTable()
  likes: Hotel[];
}

export default User;

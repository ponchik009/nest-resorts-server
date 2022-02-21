import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Hotel } from './hotel.entity';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany((type) => Hotel, (hotel) => hotel.tags)
  hotels: Hotel[];
}

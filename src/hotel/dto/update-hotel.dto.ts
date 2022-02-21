import User from 'src/user/entities/user.entity';
import { Tag } from '../entities/tag.entity';

export class UpdateHotelDto {
  readonly id: number;
  readonly name: string;
  readonly country: string;
  readonly description: string;
  readonly stars: number;
  readonly price: number;
  readonly likes?: User[];
  readonly tags?: Tag[];
}

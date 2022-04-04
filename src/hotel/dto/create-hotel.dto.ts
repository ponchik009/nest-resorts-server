import { Tag } from '../entities/tag.entity';

export class CreateHotelDto {
  readonly name: string;
  readonly cities: string;
  readonly description: string;
  readonly stars: number;
  readonly price: number;
  readonly tags?: string;
}

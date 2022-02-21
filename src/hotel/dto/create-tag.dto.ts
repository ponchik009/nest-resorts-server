import { Hotel } from '../entities/hotel.entity';

export class CreateTagDto {
  readonly name: string;
  readonly hotels: Hotel[];
}

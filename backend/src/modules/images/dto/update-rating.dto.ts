import { IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for updating an image's rating.
 * Rating must be an integer between 1 and 5.
 */
export class UpdateRatingDto {
  @ApiProperty({
    type: Number,
    description: 'User rating for the image (1-5 scale)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsInt({ message: 'Rating must be an integer' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  rating: number;
}
